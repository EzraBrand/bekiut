# Read the Talmud, Keep the Commentary

*Bekiut · Blog draft · September 11, 2026*

**How Bekiut’s new footnotes make the Steinsaltz-based English edition easier to follow without removing its explanations.**

The Steinsaltz-based William Davidson English edition does two jobs at once. It translates the Talmud, and it explains what the translation assumes you already know. A few words about a marriage, an offering, or a calendar rule can require a substantial account of the law behind them.

That combination is enormously useful. But it also creates a reading problem: a brief statement and a long explanation can occupy the same continuous passage. By the time you reach the next question, you may need to look back to remember what was being challenged.

Bekiut’s new **Move Talmud Commentary to Footnotes** feature separates those reading tasks. Eligible explanatory passages now appear in numbered, initially collapsed notes. Click a superscript to expand the explanation and move to it; a return link takes you back to the text.

This is not an AI summary or a shorter replacement translation. The feature reorganizes the edition’s text after Bekiut’s existing text processing. It does not write substitute explanations.

## Rosh Hashanah: sixteen words, two hundred words of explanation

In [Rosh Hashanah 20b, section 12](https://bekiut.com/talmud/Rosh_Hashanah/20b#12), the main text is exceptionally short:

> “Rava said: There is a practical difference between them with regard to the hours before midnight.”

The statement identifies where two opinions differ. But the explanation of that difference takes **201 words**. It compares the scriptural derivations used by R’ Yoḥanan and Reish Lakish, explains the relevance of nightfall and midnight, and connects the discussion to the obligation to eat unleavened bread on Passover.

There is nothing extraneous about this material. Without it, a reader unfamiliar with the argument may not understand why midnight matters. Yet placing the whole explanation inline makes Rava’s concise answer look like a much longer contribution.

With footnotes, the structure is easier to see: Rava states the practical difference; the note explains its basis. The reader can first locate the answer in the discussion, then open the explanation to understand it.

The section’s 217 processed words become **16 main-text words plus a 201-word note**. That is a change in presentation, not a claim that sixteen words contain everything a learner needs.

It also helps when reviewing. Someone returning to the passage can identify Rava’s answer immediately, rather than searching through the explanatory paragraph for the statement being explained.

## Ketubot: keeping a technical explanation close, but separate

A similar effect appears in [Ketubot 55b, section 1](https://bekiut.com/talmud/Ketubot/55b#1). The main line reads:

> “And the halakha is also in accordance with his opinion with regard to the teruma of the tithe from doubtfully tithed produce [demai].”

This is a 23-word statement attached to a **171-word explanation**. The note defines the uncertainty surrounding demai, introduces a case in which the separated portion becomes mixed back into the produce, and explains why asking the seller about the tithes can matter.

It also spells out the financial stakes: treating everything as actual teruma would restrict who could use it and affect its sale. That background makes an otherwise obscure ruling intelligible.

But the ruling and the explanation have different functions. One tells us which opinion the law follows; the other reconstructs the situation to which the ruling applies.

Previously, the reader encountered them together as a 194-word section. Now the ruling stays in view, and the supporting explanation remains available through its note.

This is especially useful when following a sequence of rulings. You can see how the present statement relates to the surrounding statements before deciding how much background to read. If the technical term is unfamiliar, the explanation is still right there.

## A useful bonus: finding complex passages

(The longest note in the ranking, on [Yevamot 2a](https://bekiut.com/talmud/Yevamot/2a#1), is introductory material rather than a typical explanation within an ongoing Talmud discussion. It remains in the appendix’s ranking, but is not one of our main examples.)

We ran Bekiut’s actual extraction pipeline over **78,826 nonempty sections across 36 tractates**. It produced 28,817 notes, with a median length of 24 words. Only 210 reached 100 words, and just three reached 200.

This gives us something beyond a cleaner reading interface: **long footnotes are a reasonable heuristic for complex Talmud passages**. An unusually long explanation often points to several relationships, legal assumptions, or argumentative steps that a short formulation leaves unstated. Ranking the notes can help readers and teachers find passages worth unpacking carefully.

For example, [Yevamot 31b, section 6](https://bekiut.com/talmud/Yevamot/31b#6) has a 170-word note explaining why dates on divorce and betrothal documents matter. The explanation reconstructs a hypothetical sequence of events and its legal consequences—complexity that is not obvious from the brief main text alone.

It is a clue, not a difficulty score. Length also reflects editorial choices and assumed background knowledge, while difficult passages can have short notes. Still, the ranking provides a useful starting list of potentially demanding passages, as well as illustrations of why separating commentary helps.

## Which tractates, chapters, and sugyot stand out?

Yevamot is the strongest sustained signal in this analysis. Eruvin, Beitzah, Pesachim, Nazir, and Gittin also stand out. But the more useful result is identifying particular clusters of complex discussion, rather than declaring an entire tractate uniformly difficult.

### Comparing tractates without simply favoring longer books

We compared the frequency of substantial notes **per 1,000 text sections**. The tractate comparisons omit the introductory note on Yevamot 2a §1; the appendix retains it in the complete individual-note ranking. Section denominators remain the full counts of processed sections.

| Tractate | Notes of 50+ words per 1,000 sections | Notes of 100+ words, total |
| --- | ---: | ---: |
| Meilah | 74.7 | 2 |
| Yevamot | 63.3 | 23 |
| Beitzah | 60.2 | 9 |
| Chagigah | 58.7 | 6 |
| Pesachim | 57.3 | 15 |
| Gittin | 52.3 | 11 |
| Nazir | 51.2 | 7 |
| Eruvin | 50.9 | 21 |

**Yevamot** offers the most convincing combination of frequent substantial explanations, exceptionally long notes, and multiple concentrated clusters. **Eruvin** is particularly strong at the extreme end: its 21 notes exceeding 100 words are almost as numerous as Yevamot’s 23. **Beitzah** ranks highly even after accounting for its shorter length, while **Pesachim, Gittin, and Nazir** also show substantial explanatory demand.

**Meilah and Chagigah** have high concentrations, but smaller datasets—509 and 732 sections respectively—make their rankings more sensitive to individual passages. For comparison, **Berakhot has 17.5 notes of 50+ words per 1,000 sections**, versus Yevamot’s 63.3. That is a difference in explanatory-note density, not evidence that Yevamot is “3.6 times harder.”

### Yevamot, chapter 3: Arba’ah Achin

This is a particularly strong candidate for concentrated complexity. In **[28b–29b](https://bekiut.com/talmud/Yevamot/28b#12)**, twelve notes of at least 50 words total **920 words**. The discussion involves sisters coming before surviving brothers for levirate marriage, co-wives, and the interaction between levirate bonds, betrothal, and ḥalitza.

A second cluster, **[33a–34a](https://bekiut.com/talmud/Yevamot/33a#7)**, contains seven such notes totaling **640 words**. Here the discussion concerns overlapping prohibitions and liability for multiple sin-offerings. The reader must track not only relationships but also when prohibitions arise and whether one can take effect alongside another.

The challenge is that several legal statuses change together. Changing one relationship or its timing can change the result.

### Eruvin, chapter 4: Mi She’hotziuhu

**[49a–50a](https://bekiut.com/talmud/Eruvin/49a#4)** contains twelve substantial notes totaling **844 words**. This cluster concerns eruv arrangements and simultaneous or retroactive designation, with comparisons to tithes and animal tithes.

The discussion moves between concrete arrangements and abstract questions about when a designation becomes legally effective. Its difficulty is not merely spatial; it is also conceptual.

### Bava Kamma, chapter 1: Arba’ah Avot

**[7b–8b](https://bekiut.com/talmud/Bava_Kamma/7b#3)** contains eleven substantial notes totaling **927 words**. It combines damages, loans, ketubah obligations, land quality, and collection rights after land has been sold.

Readers must keep track of different claimants, different kinds of land, and successive transfers. A diagram or transaction timeline could be especially helpful alongside the explanations here.

### Beitzah, chapter 5: Mashilin

**[36b–37b](https://bekiut.com/talmud/Beitzah/36b#4)** contains eleven substantial notes totaling **866 words**. The cluster includes festival and Shabbat restrictions, preventing loss, and questions involving eruv limits and retroactive designation.

Superficially similar actions can receive different treatment depending on the relevant prohibition, ownership, purpose, or timing. The explanations help readers identify which distinction matters in each case.

### Sanhedrin: Eilu Hen HaNechnakin

**[87a–88a](https://bekiut.com/talmud/Sanhedrin/87a#15)** contains eleven substantial notes totaling **857 words**. The rebellious-elder discussion tests its legal framework against cases drawn from purity law, court composition, consecration, sotah, and other areas.

This is complexity arising from breadth of prerequisites: a short example may depend on an entire legal framework explained elsewhere.

These are **clusters within chapters, not a statistical ranking of complete chapters**. Counts concern notes of at least 50 words within the listed passages, rather than every section on each named folio. Chapter placement follows folio-level boundaries; it should not be read as a precise section-by-section chapter comparison.

### Individual sugyot with unusually large explanatory requirements

The longest individual notes also offer useful starting points:

- **[Rosh Hashanah 20b §12](https://bekiut.com/talmud/Rosh_Hashanah/20b#12):** a **201-word note** explaining the practical difference involving midnight, scriptural derivations, and sanctification of the new month—a concentrated example of calendrical and interpretive complexity.
- **[Yevamot 31b §6](https://bekiut.com/talmud/Yevamot/31b#6):** a **170-word note** reconstructing why dates on divorce and betrothal documents matter. The difficulty lies in the hypothetical chronology and its legal consequences.
- **[Eruvin 71a §10](https://bekiut.com/talmud/Eruvin/71a#10):** a **169-word note** concerning retroactive consent to an eruv, highlighting another question of legal effect and timing.

A useful caution is **[Ketubot 55b §1](https://bekiut.com/talmud/Ketubot/55b#1)**: its 171-word note concerns **demai and terumat ma’aser**, not the chapter’s principal marriage-law subject. Long notes can identify a demanding digression without establishing that the surrounding chapter is unusually difficult.

### A practical shortlist—and the limits of the metric

For readers or teachers looking for passages to unpack carefully, a strong initial shortlist is:

1. **Yevamot, Arba’ah Achin:** relationships, overlapping statuses, and prohibitions.
2. **Eruvin 49a–50a:** designation, timing, and cross-domain reasoning.
3. **Bava Kamma 7b–8b:** creditor priorities and successive property transfers.
4. **Sanhedrin 87a–88a:** arguments requiring substantial knowledge of other legal domains.

The metric is best understood as **“where this edition needs substantial standalone explanation.”** Editorial choices, assumed background knowledge, and the extraction rules all affect it. Short notes do not prove simplicity; no claim about study time or learning outcomes follows from note length alone. Niddah was not included in the source corpus. Other introductory material may also influence the rankings, even after removing the conspicuous Yevamot opening note.

## Not every unbolded word belongs in a footnote

The edition’s distinction between bold translation and unbolded explanation is the starting point, not an instruction to move every unbolded fragment.

English often needs connecting words and explanations within a sentence. Moving those mechanically could leave broken syntax or remove wording necessary to follow a quotation. Bekiut’s rules therefore retain mixed translation-and-commentary passages and protect continuations that belong with the main text.

The feature focuses on complete explanatory blocks. It also uses a minimum-length threshold rather than creating a separate note for every brief gloss. The result is not a claim to have isolated a completely interpretation-free translation. It is a practical distinction between material that needs to remain in the sentence and material that can be read separately.

## Read in the order that helps you learn

For a first encounter with a difficult sugya, the notes can be part of the first reading. Read a statement, open its explanation, then return to the next statement.

For review, keep the notes collapsed and follow the sequence of claims, questions, objections, and answers. Open a note when a term or connection needs refreshing.

For bilingual study, a less crowded English column can also make it easier to compare a translated statement with the Hebrew or Aramaic alongside it. The commentary remains available without always occupying the same visual space.

The aim is not to make the Steinsaltz-based edition less explanatory. Its explanations are a major reason to use it. The aim is to let readers decide when to engage with that depth.

**Read the statement. Consult the explanation. Return to the argument.** The same text supports all three steps, with a clearer distinction between them.

**Sources and scope:** Examples derive from Sefaria’s *William Davidson Edition – English*, with Koren/NOE version provenance and CC-BY-NC licensing. Quotations follow Bekiut’s processed display wording; emphasis is simplified here. Measurements use consistent Unicode word counts, excluding markup and note markers. Niddah is excluded because its edition-specific English export was unavailable. The scan covers all valid pages and nonempty sections in the other 36 exports, not the complete Bavli without qualification. This is a presentation analysis, not a measured learning-outcome study.

## Appendix: Longest Talmud Footnotes

### Scope and method

Analyzed 36 of the 37 canonical Bavli tractates using edition-specific public Sefaria exports of *William Davidson Edition – English*. Every included export matched the expected title and edition and declared CC-BY-NC licensing, with Koren/NOE version provenance. Niddah’s English export returned HTTP 404 and is excluded. English Menachot and Chullin were included; their separate Hebrew licensing gaps do not exclude these English sources.

The scan applied the app’s actual `processEnglishText` and `extractTalmudCommentary` functions to all nonempty sections on valid folios—not only opening excerpts. Counts use Unicode letter/number runs after stripping markup and decoding entities; punctuation and note markers are excluded. Hyphenated terms can count as multiple words. This consistent method gives 290 words for the longest note, compared with 287 under the preliminary whitespace count.

- 5,207 expected pages in included tractates; 5,206 populated and one source-empty page (Nazir 33b).

- 78,826 nonempty sections processed; no processing failures.

- 26,005 sections contain notes: about 33% of processed sections.

- 28,817 extracted notes; median 24 words; 75th percentile 35; 90th percentile 50; 95th percentile 63; 99th percentile 94.

- 2,981 notes have at least 50 words; 210 at least 100; three at least 200. Maximum: 290.

### Twenty longest individual notes

“All notes” is the total moved from the section, which may contain more than one footnote. “Main” means all retained text, including connective or introductory prose—not a claim that every word is pure translation.

| Rank | Reference | This note | Section before | Main after | All notes |
| --- | --- | --- | --- | --- | --- |
| 1 | [Yevamot 2a:1](https://bekiut.com/talmud/Yevamot/2a#1) | 290 | 400 | 110 | 290 |
| 2 | [Yevamot 9b:4](https://bekiut.com/talmud/Yevamot/9b#4) | 230 | 243 | 13 | 230 |
| 3 | [Rosh Hashanah 20b:12](https://bekiut.com/talmud/Rosh_Hashanah/20b#12) | 201 | 217 | 16 | 201 |
| 4 | [Ketubot 55b:1](https://bekiut.com/talmud/Ketubot/55b#1) | 171 | 194 | 23 | 171 |
| 5 | [Pesachim 53b:4](https://bekiut.com/talmud/Pesachim/53b#4) | 170 | 234 | 64 | 170 |
| 6 | [Yevamot 31b:6](https://bekiut.com/talmud/Yevamot/31b#6) | 170 | 224 | 54 | 170 |
| 7 | [Eruvin 71a:10](https://bekiut.com/talmud/Eruvin/71a#10) | 169 | 220 | 38 | 182 |
| 8 | [Yevamot 34a:3](https://bekiut.com/talmud/Yevamot/34a#3) | 164 | 206 | 42 | 164 |
| 9 | [Yevamot 40b:14](https://bekiut.com/talmud/Yevamot/40b#14) | 161 | 189 | 28 | 161 |
| 10 | [Yevamot 113a:14](https://bekiut.com/talmud/Yevamot/113a#14) | 159 | 169 | 10 | 159 |
| 11 | [Yevamot 10a:1](https://bekiut.com/talmud/Yevamot/10a#1) | 156 | 240 | 84 | 156 |
| 12 | [Beitzah 11b:8](https://bekiut.com/talmud/Beitzah/11b#8) | 154 | 184 | 30 | 154 |
| 13 | [Yoma 26b:12](https://bekiut.com/talmud/Yoma/26b#12) | 153 | 180 | 27 | 153 |
| 14 | [Pesachim 18b:16](https://bekiut.com/talmud/Pesachim/18b#16) | 152 | 184 | 32 | 152 |
| 15 | [Makkot 15b:5](https://bekiut.com/talmud/Makkot/15b#5) | 152 | 165 | 13 | 152 |
| 16 | [Sanhedrin 9b:1](https://bekiut.com/talmud/Sanhedrin/9b#1) | 152 | 175 | 23 | 152 |
| 17 | [Yevamot 34a:1](https://bekiut.com/talmud/Yevamot/34a#1) | 151 | 195 | 44 | 151 |
| 18 | [Yevamot 15a:12](https://bekiut.com/talmud/Yevamot/15a#12) | 150 | 171 | 21 | 150 |
| 19 | [Yoma 32a:3](https://bekiut.com/talmud/Yoma/32a#3) | 150 | 203 | 53 | 150 |
| 20 | [Kiddushin 53b:7](https://bekiut.com/talmud/Kiddushin/53b#7) | 149 | 223 | 74 | 149 |
