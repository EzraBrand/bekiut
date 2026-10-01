import { describe, expect, it } from "vitest";
import { BDB_GREEK_MARKER_RE, wrapBdbGreekMarkers } from "./bdb-greek-markers";
import { annotateAllTransliterations } from "@/shared/transliteration";

describe("BDB Greek outline markers", () => {
  it.each(["Ακ(κ)αταν", "Ακ(κ)", "(κ)αταν", "Ακ(κ)(τ)αν"])(
    "does not insert a text-node boundary in %s",
    (text) => {
      expect(wrapBdbGreekMarkers(text, "sense")).toBe(text);
      expect([...text.matchAll(BDB_GREEK_MARKER_RE)]).toHaveLength(0);
    },
  );

  it("preserves one Greek run in the actual qatan entry's HTML", () => {
    const raw = '<span dir="rtl">הַקּ׳</span>, post-ex. name <a data-ref="Ezra 8:12" href="https://www.sefaria.org/Ezra.8.12">Ezra 8:12</a>, Ακ(κ)αταν.';
    const wrapped = wrapBdbGreekMarkers(raw, "sense-BDB08756-0");
    expect(wrapped).toBe(raw);
    // Annotate each text segment separately, as the DOM text walker does.
    const annotated = wrapped.split(/(<[^>]+>)/).map(part =>
      part.startsWith("<") ? part : annotateAllTransliterations(part),
    ).join("");
    expect(annotated).toBe(raw.replace("Ακ(κ)αταν", "Ακ(κ)αταν [Ak(k)atan]"));
  });

  it.each(["α. first", "(α) first", "; β. second", "relations:—α. first", "<em>α.</em> first"])(
    "keeps genuine section anchors in %s",
    (text) => {
      expect([...text.matchAll(BDB_GREEK_MARKER_RE)]).toHaveLength(1);
      expect(wrapBdbGreekMarkers(text, "sense")).toContain('class="scroll-mt-20"');
    },
  );

  it("does not consume occurrence ids for optional letters", () => {
    const wrapped = wrapBdbGreekMarkers("Ακ(κ)αταν; (κ) first; (κ) second", "sense");
    expect(wrapped).toContain('id="sense-greek-κ-0"');
    expect(wrapped).toContain('id="sense-greek-κ-1"');
    expect(wrapped).not.toContain('id="sense-greek-κ-2"');
  });
});