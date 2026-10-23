import { z } from "zod";

const text = (max: number) => z.string().max(max);
export const chatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(6000),
  }).strict()).min(1).max(15),
  context: z.object({
    tractate: text(80).optional(),
    page: text(40).optional(),
    section: z.union([text(80), z.number().int().nonnegative()]).optional(),
    range: text(160).optional(),
    hebrewText: text(24000).optional(),
    englishText: text(24000).optional(),
  }).strict().optional(),
}).strict().superRefine(({ messages, context }, ctx) => {
  if (messages.at(-1)?.role !== "user" ||
      messages[0]?.role !== "user" ||
      messages.some((m, i) => i > 0 && m.role === messages[i - 1].role)) {
    ctx.addIssue({ code: "custom", message: "Messages must alternate user and assistant, ending with user." });
  }
  if (messages.reduce((n, m) => n + m.content.length, 0) > 12000 ||
      JSON.stringify(context ?? {}).length > 26000) {
    ctx.addIssue({ code: "custom", message: "Chat context or history is too long." });
  }
});
