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
  expect(email.split("\n\n")[0]).not.toContain("\nBcc:");
});
