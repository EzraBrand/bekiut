import { describe, expect, it } from "vitest";
import { parseWeeklyParsha } from "./weekly-parsha";

describe("weekly parsha", () => {
  const item = {
    title: { en: "Parashat Hashavua" },
    displayValue: { en: "Vayera", he: "וירא" },
    ref: "Genesis 18:1-22:24", heRef: "בראשית י״ח:א׳-כ״ב:כ״ד",
  };
  it("preserves the full range and links to its first verse", () => {
    expect(parseWeeklyParsha({ calendar_items: [item] })).toEqual({
      titleEn: "Vayera", titleHe: "וירא", ref: item.ref, heRef: item.heRef,
      href: "/bible/Genesis/18#1",
    });
  });
  it("handles combined portions and openings mid-chapter", () => {
    expect(parseWeeklyParsha({ calendar_items: [{
      ...item, displayValue: { en: "Matot-Masei", he: "מטות־מסעי" },
      ref: "Numbers 30:2-36:13",
    }] }).href).toBe("/bible/Numbers/30#2");
  });
  it("rejects missing portions and invalid references", () => {
    expect(() => parseWeeklyParsha({ calendar_items: [] })).toThrow();
    expect(() => parseWeeklyParsha({ calendar_items: [{ ...item, ref: "bad" }] })).toThrow();
  });
});
