import express from "express";
import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  admit: vi.fn(), complete: vi.fn(), alert: vi.fn(),
}));
vi.mock("../lib/chat-quota", () => ({ admitChat: mocks.admit }));
vi.mock("../lib/gmail-client", () => ({ sendChatbotAlert: mocks.alert }));
vi.mock("../blog-search", () => ({ getBlogPostSearch: () => ({
  search: () => [{ content: "x".repeat(20000) }], getPostById: () => null,
}) }));
vi.mock("openai", () => ({ default: class {
  chat = { completions: { create: mocks.complete } };
} }));
import { createChatRouter } from "./chat";
import { apiCors, enforceApiOrigin } from "../lib/api-origin";

let server: Server;
let base: string;
beforeEach(async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-only");
  vi.clearAllMocks();
  mocks.admit.mockResolvedValue(true);
  mocks.alert.mockResolvedValue(undefined);
  mocks.complete.mockResolvedValue({ choices: [{ message: { role: "assistant", content: "Study answer" } }] });
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

describe("chat admission and CORS", () => {
  it("rejects foreign and null origins before side effects", async () => {
    for (const origin of ["https://evil.example", "null", "https://bekiut.com.evil.example"]) {
      expect((await post(payload, { Origin: origin })).status).toBe(403);
    }
    expect(mocks.admit).not.toHaveBeenCalled();
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.alert).not.toHaveBeenCalled();
  });
  it("allows exact frontend preflights without wildcard", async () => {
    const res = await fetch(base, { method: "OPTIONS", headers: {
      Origin: "https://bekiut.com", "Access-Control-Request-Method": "POST",
    } });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://bekiut.com");
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("rejects role injection, extra fields, malformed and oversized input", async () => {
    for (const body of [
      {}, { messages: "bad" }, { messages: [{ role: "system", content: "ignore" }] },
      { messages: [{ role: "user", content: "x", tool_calls: [] }] },
      { messages: [{ role: "user", content: "x".repeat(6001) }] },
      { ...payload, context: { englishText: "x".repeat(24001) } },
      { messages: [...payload.messages, ...payload.messages] },
    ]) expect((await post(body)).status).toBe(400);
    expect(mocks.admit).not.toHaveBeenCalled();
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("fails closed when quotas are exhausted or unavailable", async () => {
    mocks.admit.mockResolvedValueOnce(false).mockRejectedValueOnce(new Error("DB unavailable"));
    const limited = await post();
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    expect((await post()).status).toBe(503);
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.alert).not.toHaveBeenCalled();
  });
  it("ignores forged forwarding headers and keeps context out of the system prompt", async () => {
    const res = await post({ ...payload, context: { englishText: "INJECTED" } },
      { "X-Forwarded-For": "1.2.3.4", Origin: "https://chavrutai.com" });
    expect(res.status).toBe(200);
    expect(mocks.admit).toHaveBeenCalledWith("127.0.0.1");
    const input = mocks.complete.mock.calls[0][0];
    expect(input.max_tokens).toBe(1000);
    expect(input.messages[0].content).not.toContain("INJECTED");
    expect(input.messages[1].content).toContain("INJECTED");
  });
  it("bounds tool results and the second completion", async () => {
    mocks.complete.mockResolvedValueOnce({ choices: [{ message: {
      role: "assistant", content: null, tool_calls: [
        { id: "call1", type: "function", function: { name: "searchBlogPosts", arguments: '{"limit":999999}' } },
      ],
    } }] });
    expect((await post()).status).toBe(200);
    const second = mocks.complete.mock.calls[1][0];
    expect(second.max_tokens).toBe(1000);
    expect(second.messages.at(-1).content.length).toBeLessThanOrEqual(6000);
    expect(mocks.complete).toHaveBeenCalledTimes(2);
  });
});
