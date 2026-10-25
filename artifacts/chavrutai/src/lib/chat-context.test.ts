import { expect, it } from "vitest";
import { prepareChatContext } from "./chat-context";

it("preserves short context", () => {
  const context = { range: "Berakhot 2a", hebrewText: "שלום", englishText: "hello" };
  expect(prepareChatContext(context)).toEqual({ context, trimmed: false });
});
it("bounds long bilingual context and discloses the excerpt to the model", () => {
  const result = prepareChatContext({ range: "Berakhot 2a-6b", hebrewText: "שלום".repeat(40000), englishText: "text".repeat(40000) });
  expect(result.trimmed).toBe(true);
  expect(JSON.stringify(result.context).length).toBeLessThan(26000);
  expect(result.context?.range).toContain("opening excerpt only");
});
it("accounts for JSON escaping as well as text length", () => {
  const result = prepareChatContext({ hebrewText: "\u0001".repeat(30000), englishText: '"'.repeat(30000) });
  expect(JSON.stringify(result.context).length).toBeLessThan(26000);
  expect(result.trimmed).toBe(true);
});
