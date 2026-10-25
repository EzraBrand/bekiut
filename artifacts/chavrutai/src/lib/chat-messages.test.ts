import { expect, it } from "vitest";
import type { UIMessage } from "ai";
import { chatHistory } from "./chat-messages";
it("keeps SDK message metadata and tools out of submitted history", () => {
  const messages: UIMessage[] = [
    { id: "u", role: "user", parts: [{ type: "text", text: "Question" }] },
    { id: "a", role: "assistant", metadata: { arbitrary: true }, parts: [
      { type: "text", text: "First " }, { type: "text", text: "answer" },
      { type: "dynamic-tool", toolName: "searchBlogPosts", toolCallId: "t", state: "output-available", input: {}, output: [] },
    ] },
    { id: "u2", role: "user", parts: [{ type: "text", text: "Follow-up" }] },
  ];
  expect(chatHistory(messages)).toEqual([
    { role: "user", content: "Question" }, { role: "assistant", content: "First answer" },
    { role: "user", content: "Follow-up" },
  ]);
});
