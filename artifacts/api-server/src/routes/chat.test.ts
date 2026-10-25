import express from "express";
import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admit: vi.fn(), stream: vi.fn(), alert: vi.fn(), configure: vi.fn(), model: vi.fn(),
}));
vi.mock("../lib/chat-quota", () => ({ admitChat: mocks.admit }));
vi.mock("../lib/gmail-client", () => ({ sendChatbotAlert: mocks.alert }));
vi.mock("../blog-search", () => ({ getBlogPostSearch: () => ({
  search: () => [{ content: "x".repeat(20000) }], getPostById: () => null,
}) }));
vi.mock("@ai-sdk/openai-compatible", async () => {
  const { MockLanguageModelV3 } = await import("ai/test");
  return { createOpenAICompatible: (options: unknown) => {
    mocks.configure(options);
    return { chatModel: (id: string) => {
      mocks.model(id);
      return new MockLanguageModelV3({ doStream: mocks.stream });
    } };
  } };
});
import { createChatRouter } from "./chat";
import { apiCors, enforceApiOrigin } from "../lib/api-origin";

const usage = { inputTokens: { total: 5 }, outputTokens: { total: 5 } };
function response(tool = false) {
  const parts: any[] = [
    { type: "stream-start", warnings: [] },
    ...(tool ? [{
      type: "tool-call", toolCallId: "t1", toolName: "searchBlogPosts",
      input: '{"keywords":["Berakhot"]}',
    }] : [
      { type: "text-start", id: "text1" },
      { type: "text-delta", id: "text1", delta: "Study answer" },
      { type: "text-end", id: "text1" },
    ]),
    { type: "finish", finishReason: { unified: tool ? "tool-calls" : "stop", raw: undefined }, usage },
  ];
  return { stream: new ReadableStream({ start(controller) {
    parts.forEach(part => controller.enqueue(part)); controller.close();
  } }) };
}
let server: Server, base: string;
beforeEach(async () => {
  vi.stubEnv("AI_INTEGRATIONS_OPENROUTER_API_KEY", "test-only");
  vi.stubEnv("AI_INTEGRATIONS_OPENROUTER_BASE_URL", "https://integration.example/v1");
  vi.clearAllMocks();
  mocks.admit.mockResolvedValue(true);
  mocks.alert.mockResolvedValue(undefined);
  mocks.stream.mockImplementation(async () => response());
  const app = express();
  app.use(enforceApiOrigin, apiCors, express.json());
  app.use((req, _res, next) => { req.log = { error: vi.fn() } as any; next(); });
  app.use(createChatRouter());
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as any).port}/api/chat`;
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await new Promise<void>(resolve => server.close(() => resolve()));
});
const payload = { messages: [{ role: "user", content: "Explain this passage" }] };
const post = (body: unknown = payload, headers = {}) => fetch(base, {
  method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
});

describe("SDK chat streaming and admission", () => {
  it("streams an answer and accepts the next user turn", async () => {
    const first = await post();
    expect(first.headers.get("content-type")).toContain("text/event-stream");
    expect(await first.text()).toContain('"delta":"Study answer"');
    const second = await post({ messages: [...payload.messages,
      { role: "assistant", content: "Study answer" }, { role: "user", content: "Explain further" },
    ] });
    expect(await second.text()).toContain("Study answer");
    expect(mocks.model).toHaveBeenCalledWith("openai/gpt-4o");
    expect(mocks.configure).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: "test-only", baseURL: "https://integration.example/v1",
    }));
    expect(mocks.stream.mock.calls[0][0].maxOutputTokens).toBe(1000);
  });
  it("streams bounded tool output then a final answer in at most two steps", async () => {
    mocks.stream.mockImplementationOnce(async () => response(true));
    const res = await post();
    const text = await res.text();
    expect(text).toContain("tool-output-available");
    expect(text).toContain("Study answer");
    expect(text).toContain("excerpt");
    expect(mocks.stream).toHaveBeenCalledTimes(2);
    expect(mocks.stream.mock.calls[1][0].toolChoice).toEqual({ type: "none" });
  });
  it("sanitizes provider errors in the stream", async () => {
    mocks.stream.mockRejectedValueOnce(Object.assign(new Error("secret upstream body"), {
      code: "credit_balance_exhausted",
    }));
    const text = await (await post()).text();
    expect(text).toContain("provider credits are exhausted");
    expect(text).not.toContain("secret upstream body");
  });
  it("rejects foreign origins and invalid histories before quota or provider calls", async () => {
    expect((await post(payload, { Origin: "https://evil.example" })).status).toBe(403);
    for (const body of [{}, { messages: [...payload.messages, ...payload.messages] },
      { messages: [{ role: "user", content: "x".repeat(6001) }] },
      { ...payload, context: { englishText: "x".repeat(24001) } },
    ]) expect((await post(body)).status).toBe(400);
    expect(mocks.admit).not.toHaveBeenCalled();
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it("fails closed for absent configuration and unavailable or exhausted quotas", async () => {
    mocks.admit.mockResolvedValueOnce(false).mockRejectedValueOnce(new Error("DB unavailable"));
    expect((await post()).status).toBe(429);
    expect((await post()).status).toBe(503);
    vi.stubEnv("AI_INTEGRATIONS_OPENROUTER_API_KEY", "");
    expect((await post()).status).toBe(503);
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it("ignores forged forwarding headers and keeps context out of system instructions", async () => {
    const res = await post({ ...payload, context: { englishText: "INJECTED" } }, {
      Origin: "https://bekiut.com", "X-Forwarded-For": "1.2.3.4",
    });
    await res.text();
    expect(mocks.admit).toHaveBeenCalledWith("127.0.0.1");
    const prompt = mocks.stream.mock.calls[0][0].prompt;
    expect(prompt[0].content).not.toContain("INJECTED");
    expect(JSON.stringify(prompt[1])).toContain("INJECTED");
  });
});
