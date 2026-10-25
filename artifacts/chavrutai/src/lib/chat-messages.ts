import { isToolUIPart, getToolName, type UIMessage } from "ai";

export function messageText(message: UIMessage): string {
  return message.parts.filter(part => part.type === "text").map(part => part.text).join("");
}

/** Only text crosses our strict server boundary; UI/tool metadata stays local. */
export function chatHistory(messages: UIMessage[]) {
  let history = messages
    .filter(message => message.role === "user" || message.role === "assistant")
    .map(message => ({ role: message.role as "user" | "assistant", content: messageText(message) }))
    .filter(message => message.content.trim());
  history = history.slice(-15);
  while (history.length && history[0].role !== "user") history.shift();
  while (history.length > 1 && history.reduce((n, message) => n + message.content.length, 0) > 12000) {
    history = history.slice(2);
  }
  return history;
}

export function messageTools(message?: UIMessage) {
  if (!message) return [];
  return message.parts.filter(isToolUIPart).filter(part => part.state === "output-available")
    .map(part => ({ tool: getToolName(part), arguments: part.input as Record<string, unknown>, result: part.output }));
}
