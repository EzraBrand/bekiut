# BDB mobile profiling — קְרַאת

**One measured run per revision**, September 30, 2026. Baseline is frozen git HEAD `16b18e4` served from `/tmp/bdb-baseline-16b18e4` at `localhost:5174`; after is the updated managed preview at `localhost:80`. Chromium CDP identified itself as `Chrome/140.0.7339.16`; viewport 390 × 844 CSS pixels, device scale 2, CPU throttled 4×, no network throttling. Navigation had the browser cache disabled. Both browsers received the **same captured API response** through CDP request interception (2 entries, 47 senses, 62,223 bytes, SHA-256 `bd391a0448d0f0fa6e74e7997d876c8dd2a9b6e6df1ce73d14ec3dd1036308d8`). The script additionally checked that this fixture still matched the live API before each run.

| Measurement | Baseline | After |
|---|---:|---:|
| Navigation to entry DOM visible (wall time) | 32,515 ms | 6,002 ms |
| JS CPU samples attributed to `expandAbbreviations` during load | 25,936 ms | 1,123 ms |
| All named dictionary transforms during load (sampled CPU) | 26,143 ms | 1,198 ms |
| Transliteration during load (sampled CPU) | 103 ms | 71 ms |
| HTML parsing during load (trace duration) | 74 ms | 64 ms |
| Layout during load (trace duration) | 673 ms | 594 ms |
| Style/layout-tree update during load (trace duration) | 133 ms | 122 ms |
| Typing interaction observation window* | 19,153 ms | 495 ms |
| Scroll interaction observation window* | 285 ms | 288 ms |
| Open floating outline interaction observation window* | 16,634 ms | 485 ms |

The dominant load bottleneck was dictionary abbreviation expansion, not HTML parsing, layout, or transliteration. Load wall time fell approximately 81.5%, and sampled expansion CPU approximately 95.7%. The scrolling observation window was unchanged; its baseline CPU trace included ongoing dictionary-transform work and must not be interpreted as scroll handler cost. The baseline typing/outline windows likewise include any synchronous re-render triggered by the action. `*` Windows include CDP command execution, two subsequent animation frames, and a fixed 250 ms wait; they are **not** Interaction to Next Paint scores. Two-frame waits alone were 26/29/14 ms before and 82/28/19 ms after (typing/scroll/outline), measured only **after** the dispatched action returned, so they omit synchronous blocking. Profiler samples and trace event durations are diagnostic aggregates, not mutually exclusive portions of navigation wall time; these are one-run comparisons with potentially variable dev-server compilation/GC overhead, not statistically robust medians.

**Exact rendered-content check:** all 47 per-sense `innerHTML` strings compare byte-for-byte equal between the two runs (SHA-256 of JSON array `9ecb12a13769884e14763705016765d7539e8c1cfcc1e38b42994b981e146091`). All 482 sense-link `href` strings compare byte-for-byte equal, in the same order (SHA-256 `253c8969b18ae98c99dc6ba095c9110ac5ec4315738bc1f5a7dfa02ddc5294f9`). Both runs displayed 2 entries, 47 senses and 5 bracketed transliteration annotations. There is **no transliteration toggle** on this BDB page: annotation is unconditional, so a toggle-on/off timing cannot honestly be reported. The existing “Split by semicolons” checkbox is unrelated to transliteration.

Reproduction: `node scripts/profile-bdb.mjs --url http://localhost:5174/bdb --api-origin http://localhost:80 --fixture /tmp/bdb-baseline-api-response.json --repeats 1 --out /tmp/bdb-before.json`; repeat with `--url http://localhost:80/bdb --out /tmp/bdb-after.json`. The JSON outputs include full rendered HTML and every link plus CPU/trace data; both live in `/tmp` and are not committed. Ensure that each server actually serves the specified revision before running. Browser baseline and after captures used the script's original action measurement sequence (action dispatch, then two frames, then 250 ms); the reproducibility script now additionally times dispatch-to-two-frames as a single browser-side interval.

Backend caching intentionally remains unchanged: `searchLexiconCore` can swallow upstream failures into empty results and suggestion failures into partial results, making naive caching of responses liable to persist outages. Failure-aware bounded caching is separate follow-up work (task #86).