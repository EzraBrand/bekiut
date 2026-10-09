# Guide to Online Resources for Scholarly Jewish Study and Research

**Ezra Brand · 2026 working edition**

This is a web-first working update of the 2023 guide, not a claim that every description in the original has been checked afresh. It preserves the 47-page source, inventories every hyperlink destination, adds a curated resource directory and introduces AI-assisted research methods.

## Scope and continuity

The guide is primarily for intellectually curious readers and scholars working on rabbinic and medieval Jewish texts, broadly c. 100–1850 CE. English and Hebrew resources receive priority. The original’s “1850 BCE” in its scope paragraph is an apparent typo: its surrounding explanation and preceding sentence indicate 1850 CE.

The original categories remain useful: primary texts; scans and manuscripts; search and bibliography; secondary literature; dictionaries and reference works; and scholarly media. The new directory preserves these distinctions rather than mixing texts, tools and scholarly arguments into one undifferentiated list.

Digital access is not identical to an authoritative edition. Always identify the edition or manuscript witness, translator, editorial interventions and stable locator. The interface used to find a text is not usually the source that should appear in the final citation.

The 2023 introductory statistics, prices, collection sizes and “recent” descriptions are historical. They are retained in the source archive, not presented as 2026 facts.

## What has changed in this working edition

1. Every original PDF hyperlink is extracted with page provenance and checked for HTTP availability.
2. A curated, searchable directory sits alongside the complete historical link inventory.
3. Relevant projects are selected from [Powered by Sefaria](https://developers.sefaria.org/docs/powered-by-sefaria) and the [JewishAI directory](https://jewishai.me/table.html).
4. AI tools, developer resources and scholarship about AI are categorized separately.
5. Downloads expose the audit and resource data for correction, reuse and future Bekiut integration.

Directory entries are selected for source discovery, textual study, language processing or scholarly methods. The two directories contain many popular, devotional, educational and opinion resources that are outside this guide’s main remit. Their descriptions are discovery evidence, not a substitute for independent evaluation. Duplicate JewishAI rows for the same publication are represented by one resource rather than counted as separate works.

## AI-assisted research: useful tasks and necessary checks

### 1. Discovery and retrieval

Tools that search a bounded textual corpus can help locate passages, generate alternative spellings and surface possible parallels. Sefaria’s Library Assistant, DICTA’s tools and directory-listed projects such as Mekoros and Ituria illustrate different approaches.

Separate **retrieved text** from **generated explanation**. A real quotation can still be attached to a misleading argument. A link may exist without supporting the sentence for which the model cites it.

For every potentially useful result:

1. Open the cited work independently.
2. Verify the tractate, page/chapter/section and edition.
3. Read the surrounding text.
4. Compare the quotation with the source, including omissions and punctuation.
5. Record the source itself in your notes, not only the AI answer.

### 2. OCR and manuscript transcription

eScriptorium and Transkribus belong in the same research workflow as newer generative tools, but handwritten-text recognition is a distinct task. Hebrew script, abbreviations, ligatures, damaged pages and unusual hands create characteristic errors. A plausible reading is not evidence that a letter is present.

Test on a representative sample that you transcribe manually. Preserve images and coordinates; record uncertain readings rather than silently normalizing them. Compare accuracy by hand and document type, not only by a single overall score. Correct the output before using it as a corpus for quantitative analysis.

### 3. Translation, vocalization and abbreviation expansion

AI can suggest a first translation, alternative parsing or possible expansion. It may import modern Hebrew meanings into rabbinic language, conflate Aramaic dialects, miss negation or confidently choose the wrong proper name.

Use specialist dictionaries, parallel passages and edition notes to resolve ambiguities. Mark uncertainty. Do not present generated vocalization, punctuation or expansion as part of the transmitted source.

### 4. Corpus work and reproducibility

Hebrew NLP projects such as AlephBERT and DICTA’s model repositories are research infrastructure, not ready-made scholarly conclusions. Confirm training-language coverage, evaluation tasks, tokenization and licensing. Success on modern Hebrew does not demonstrate accuracy on Babylonian Aramaic or a medieval manuscript.

Record the corpus version, preprocessing, model/version, prompt, retrieval settings and date of access. Preserve a test set and include representative failures. Avoid drawing historical conclusions from an uncorrected OCR corpus without estimating error and coverage bias.

### 5. Secondary-literature searches

Use AI to brainstorm keywords, names and related concepts. Use RAMBI, publisher catalogues, repositories and scholarly search to establish whether a publication exists. Check author, exact title, date, venue, volume, pages and DOI independently.

A model-generated bibliography is a list of leads, not a bibliography ready to cite. Summaries should be checked against the full publication, not only an abstract or search snippet.

### 6. Privacy, copyright and authority

Do not upload confidential archival material, unpublished work, identifiable participant data or restricted scans without permission. Check a service’s retention, training-use and sharing policies, and the source collection’s reuse rules.

AI is not an autonomous halakhic authority. A source-grounded system can still omit relevant authorities, misunderstand facts or fail to distinguish descriptive scholarship from practical decision-making. Practical questions require a qualified human authority with the full context.

### 7. Reading about AI versus using it

The AJS Perspectives AI issue and research papers in the directory concern AI as a subject or method. They should not be confused with operational tools. Institutional news stories, preprints, peer-reviewed papers and opinion essays have different evidentiary roles.

Consult the full publication and its bibliography. Dates and classifications in aggregators may conflict; verify them on the publication itself before formal citation.

## Evaluating a resource

Ask: Who maintains it? What does it cover? What is omitted? Which edition or collection underlies it? Can the result be cited and recovered? Is it free to read, free to download, or licensed for reuse? Does it disclose computational intervention?

A project’s continued availability, scholarly quality, access terms and software maintenance are separate questions. This edition’s HTTP check answers only a limited part of the first.

## Link audit: how to read the results

- **HTTP reachable:** a successful response was observed, not proof of content correctness.
- **Redirected:** a successful response at a different URL; the destination may still need content review.
- **Not found:** repeated HTTP 404 or 410 in this run. Confirm in an ordinary browser before deleting or replacing the reference.
- **Blocked or restricted:** HTTP 401, 403 or 429. Often authentication, access controls or bot defenses—not proof of link rot.
- **HTTP error / network error:** unsuccessful server or transport response; treat as unresolved.
- **Manual review:** a recognizable challenge or soft-error page despite success status.

Fragments, full-text access, paywall behavior and interactive application functions are not tested by the HTTP audit. Original URLs are preserved; suggested alternatives must be identified as exact replacements or merely broader collection entry points.

## Credits and sources

Original: [2023 guide on Academia.edu](https://www.academia.edu/83334340/Guide_to_Online_Resources_for_Scholarly_Jewish_Study_and_Research_2023). The historical source preserves the original acknowledgements.

New-project discovery: [Powered by Sefaria](https://developers.sefaria.org/docs/powered-by-sefaria), [JewishAI](https://jewishai.me/table.html). Directly consulted examples include [DICTA’s tools](https://dicta.org.il/tools), [Sefaria’s AI page](https://www.sefaria.org/ai), [Mekoros](https://mekoros.com/) and the [Ituria repository](https://github.com/Sivan22/ituria).

Disclosure: Bekiut is Ezra Brand’s own project. Its inclusion is explicitly marked in the directory rather than presented as an independent assessment.
