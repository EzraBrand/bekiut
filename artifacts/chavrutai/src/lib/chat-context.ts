import type { ChatContext } from "@/hooks/use-chat";

export function prepareChatContext(context?: ChatContext) {
  if (!context) return { context: undefined, trimmed: false };
  const bounded = { ...context };
  for (const key of ["hebrewText", "englishText"] as const) {
    if (bounded[key]) bounded[key] = bounded[key]!.slice(0, 11000);
  }
  while (JSON.stringify(bounded).length > 25000) {
    const key = (bounded.hebrewText?.length ?? 0) > (bounded.englishText?.length ?? 0)
      ? "hebrewText" : "englishText";
    if (!bounded[key]?.length) break;
    bounded[key] = bounded[key]!.slice(0, Math.floor(bounded[key]!.length * 0.9));
  }
  const trimmed = bounded.hebrewText !== context.hebrewText || bounded.englishText !== context.englishText;
  if (trimmed) {
    // Inform the model too, rather than implying it can see the whole range.
    bounded.range = `${(bounded.range || `${context.tractate ?? ""} ${context.page ?? ""}`).slice(0, 90)} (opening excerpt only)`;
  }
  return { context: bounded, trimmed };
}
