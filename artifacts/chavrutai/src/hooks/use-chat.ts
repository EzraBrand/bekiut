import { useMemo, useRef, useState } from "react";
import { useChat as useSdkChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { trackPublishingEvent } from "@/lib/publishing-analytics";
import { prepareChatContext } from "@/lib/chat-context";
import { chatHistory, messageText, messageTools } from "@/lib/chat-messages";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ChatContext {
  tractate?: string;
  page?: string;
  section?: number | string;
  range?: string;
  hebrewText?: string;
  englishText?: string;
}
export interface ToolCall {
  tool: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

export function useChat(context?: ChatContext) {
  const preparedContext = prepareChatContext(context);
  const contextRef = useRef(preparedContext.context);
  contextRef.current = preparedContext.context;
  const beforeSend = useRef<UIMessage[]>([]);
  const pendingInput = useRef("");
  const [failedInput, setFailedInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    credentials: "include",
    prepareSendMessagesRequest: ({ messages }) => ({
      body: { messages: chatHistory(messages), context: contextRef.current },
    }),
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(typeof body?.error === "string" ? body.error
          : response.status === 413 ? "This request is too large. Select a shorter passage."
          : "Chat is temporarily unavailable. Please try again.");
      }
      return response;
    },
  }), []);
  const sdk = useSdkChat({
    transport,
    onError: () => {
      sdk.setMessages(beforeSend.current);
      setFailedInput(pendingInput.current);
    },
    onFinish: ({ messages, message, isError, isAbort }) => {
      if (isError || isAbort) return;
      trackPublishingEvent("ai_response_received", {
        has_context: Boolean(contextRef.current),
        conversation_turn: messages.filter(message => message.role === "user").length,
        tool_call_count: messageTools(message).length,
      });
    },
  });
  const isLoading = sdk.status === "submitted" || sdk.status === "streaming";
  const sendMessage = async (content: string) => {
    if (isLoading) return;
    sdk.clearError();
    setFailedInput("");
    beforeSend.current = sdk.messages;
    pendingInput.current = content;
    await sdk.sendMessage({ text: content });
  };
  const clearMessages = () => {
    sdk.stop();
    sdk.setMessages([]);
    sdk.clearError();
    beforeSend.current = [];
    pendingInput.current = "";
    setFailedInput("");
  };
  return {
    messages: sdk.messages.map(message => ({
      role: message.role as "user" | "assistant", content: messageText(message),
    })),
    isLoading, error: sdk.error?.message ?? null,
    lastToolCalls: messageTools(sdk.messages.at(-1)),
    contextTrimmed: preparedContext.trimmed,
    failedInput, sendMessage, clearMessages,
  };
}
