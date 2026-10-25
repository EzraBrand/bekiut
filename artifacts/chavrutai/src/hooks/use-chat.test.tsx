import React, { act } from "react";
import { Window } from "happy-dom";
import { afterAll, expect, it, vi } from "vitest";
import { useChat } from "./use-chat";
vi.mock("@/lib/publishing-analytics", () => ({ trackPublishingEvent: vi.fn() }));
afterAll(() => vi.unstubAllGlobals());

it("uses SDK streaming over multiple turns and restores failed input without corrupting history", async () => {
  const window = new Window({ url: "https://example.com/sugya-viewer" });
  for (const key of ["window", "document", "navigator", "HTMLElement", "Node"]) {
    vi.stubGlobal(key, key === "window" ? window : (window as any)[key]);
  }
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const bodies: any[] = [];
  let fail = false;
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    if (fail) return new Response(JSON.stringify({ error: "Test quota reached" }), { status: 429 });
    const events = [
      { type: "start", messageId: `reply-${bodies.length}` },
      { type: "start-step" },
      { type: "text-start", id: "t" },
      { type: "text-delta", id: "t", delta: "An answer" },
      { type: "text-end", id: "t" },
      { type: "finish-step" },
      { type: "finish", finishReason: "stop" },
    ];
    return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join("") + "data: [DONE]\n\n", {
      headers: { "Content-Type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
    });
  }));
  let hook!: ReturnType<typeof useChat>;
  function Harness() {
    hook = useChat({ range: "Berakhot 10a", englishText: "Passage text" });
    return null;
  }
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(window.document.createElement("div") as unknown as HTMLElement);
  await act(async () => root.render(<Harness />));
  await act(async () => { await hook.sendMessage("Question"); });
  expect(hook.messages).toHaveLength(2);
  await act(async () => { await hook.sendMessage("Follow up"); });
  expect(hook.messages).toHaveLength(4);
  expect(bodies[1].messages).toEqual([
    { role: "user", content: "Question" }, { role: "assistant", content: "An answer" },
    { role: "user", content: "Follow up" },
  ]);
  expect(bodies[1].context.range).toBe("Berakhot 10a");
  fail = true;
  await act(async () => { await hook.sendMessage("Keep my question"); });
  expect(hook.messages).toHaveLength(4);
  expect(hook.error).toBe("Test quota reached");
  expect(hook.failedInput).toBe("Keep my question");
  fail = false;
  await act(async () => { await hook.sendMessage("Keep my question"); });
  expect(hook.messages).toHaveLength(6);
  expect(hook.error).toBeNull();
  await act(async () => hook.clearMessages());
  expect(hook.messages).toEqual([]);
  await act(async () => root.unmount());
});
