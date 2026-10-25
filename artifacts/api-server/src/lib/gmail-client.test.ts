import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ quota: vi.fn(), send: vi.fn(), gmail: vi.fn() }));
vi.mock("./chat-quota", () => ({ admitChatAlert: mocks.quota }));
vi.mock("./logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("googleapis", () => ({ google: {
  auth: { OAuth2: class { setCredentials() {} } },
  gmail: mocks.gmail,
} }));
import { sendChatbotAlert } from "./gmail-client";
const params = {
  userQuestion: "Question", aiResponse: "Answer", fullPrompt: "Prompt",
  talmudRange: "Berakhot\r\nBcc: injected@example.com", tractate: "Berakhot",
  page: "2a", timestamp: new Date(),
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CHATBOT_ALERT_EMAIL", "test@example.com");
  vi.stubEnv("REPL_IDENTITY", "test");
  mocks.gmail.mockReturnValue({ users: { messages: { send: mocks.send } } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    json: async () => ({ items: [{ settings: { access_token: "test", expires_at: "2000-01-01" } }] }),
  }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it("does not contact Gmail when the quota is denied or unavailable", async () => {
  mocks.quota.mockResolvedValueOnce(false).mockRejectedValueOnce(new Error("offline"));
  await sendChatbotAlert(params);
  await sendChatbotAlert(params);
  expect(fetch).not.toHaveBeenCalled();
  expect(mocks.send).not.toHaveBeenCalled();
});
it("skips missing recipients without taking quota", async () => {
  vi.stubEnv("CHATBOT_ALERT_EMAIL", "");
  await sendChatbotAlert(params);
  expect(mocks.quota).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it("sends only admitted alerts and prevents subject header injection", async () => {
  mocks.quota.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  await sendChatbotAlert(params);
  await sendChatbotAlert(params);
  expect(mocks.send).toHaveBeenCalledTimes(1);
  const email = Buffer.from(mocks.send.mock.calls[0][0].requestBody.raw, "base64url").toString();
  expect(email.split("\r\n\r\n")[0]).not.toMatch(/\r\nBcc:/);
});
it("round-trips Unicode subjects and bodies using MIME encodings", async () => {
  mocks.quota.mockResolvedValue(true);
  const range = "TEST — email alert setup · בראשית ".repeat(5);
  await sendChatbotAlert({ ...params, talmudRange: range, userQuestion: "שלום — question" });
  const email = Buffer.from(mocks.send.mock.calls[0][0].requestBody.raw, "base64url").toString("utf8");
  const [headers, body] = email.split("\r\n\r\n");
  const words = [...headers.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)];
  expect(words.length).toBeGreaterThan(1);
  expect(words.map(match => Buffer.from(match[1], "base64").toString("utf8")).join(""))
    .toBe(`Bekiut Chatbot Query: ${range.slice(0, 160)}`);
  for (const match of words) expect(match[0].length).toBeLessThanOrEqual(75);
  expect(Buffer.from(body, "base64").toString("utf8")).toContain("שלום — question");
});
