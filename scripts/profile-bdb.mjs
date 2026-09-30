// Reproducible browser benchmark: node scripts/profile-bdb.mjs --url http://localhost:80/bdb --out /tmp/bdb-before.json
// Point --url at a server serving the intended revision. Never compare a HEAD worktree
// against a concurrently edited dev server: build/serve each revision independently.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
};
const url = new URL(option("--url", "http://localhost:80/bdb"));
url.searchParams.set("q", "קְרַאת");
const output = option("--out", "/tmp/bdb-profile.json");
const fixture = option("--fixture", "");
const apiOrigin = option("--api-origin", url.origin);
const factor = Number(option("--throttle", "4"));
const repeats = Number(option("--repeats", "1"));
const executable = process.env.REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/repl/tools/bin/chromium";
const sha = value => createHash("sha256").update(value).digest("hex");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profileDir = await mkdtemp(join(tmpdir(), "bdb-chromium-"));
const browser = spawn(executable, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run",
  "--disable-background-networking", "--disable-extensions",
  "--remote-debugging-port=0", `--user-data-dir=${profileDir}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
let wsUrl;
browser.stderr.on("data", chunk => {
  const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
  if (match) wsUrl = match[1];
});
let socket;
let pending = new Map();
let serial = 0;
let tracing = [];
function send(method, params = {}, sessionId) {
  const id = ++serial;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, session);
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression, timeout = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
function summarizeProfile(profile) {
  const nodes = new Map(profile.nodes.map(n => [n.id, n.callFrame.functionName || "(anonymous)"]));
  const categories = { transliteration: 0, transform: 0, parsing: 0, react: 0, otherJS: 0 };
  const top = new Map();
  (profile.samples || []).forEach((id, i) => {
    const functionName = nodes.get(id) || "(unknown)";
    const ms = (profile.timeDeltas[i] || 0) / 1000;
    top.set(functionName, (top.get(functionName) || 0) + ms);
    const category = /transliterat|greekToLatin|arabicToLatin|syriacTo|ethiopicTo/i.test(functionName) ? "transliteration"
      : /expandAbbreviations|renderDefinition|convertBdb|convertSefaria|splitIntoParagraphs|splitSegment|wrapGreekMarkers|buildOutline|classifyMarker|prependBdb|convertSup/i.test(functionName) ? "transform"
      : /parseFromString|parseHTML|parseJSON|JSON\.parse/i.test(functionName) ? "parsing"
      : /renderRoot|performUnitOfWork|commitRoot|completeWork|beginWork|reconcile|updateFunctionComponent/i.test(functionName) ? "react" : "otherJS";
    categories[category] += ms;
  });
  return { categoriesMs: categories, topFunctionsMs: [...top].sort((a, b) => b[1] - a[1]).slice(0, 25), sampleCount: profile.samples?.length || 0 };
}
async function startCapture() {
  tracing = [];
  await send("Profiler.start", {}, session);
  await send("Tracing.start", { categories: "devtools.timeline,blink,loading", options: "record-as-much-as-possible", transferMode: "ReportEvents" }, session);
}
async function stopCapture() {
  const profile = (await send("Profiler.stop", {}, session)).profile;
  const end = new Promise(resolve => {
    const timer = setTimeout(resolve, 20000);
    traceDone = () => { clearTimeout(timer); resolve(); };
  });
  await send("Tracing.end", {}, session);
  await end;
  const totals = {};
  for (const event of tracing) {
    if (event.ph !== "X" || !event.dur) continue;
    if (/^(Layout|UpdateLayoutTree|RecalculateStyles|ParseHTML|Paint|CompositeLayers|EvaluateScript)$/.test(event.name))
      totals[event.name] = (totals[event.name] || 0) + event.dur / 1000;
  }
  return { cpu: summarizeProfile(profile), traceDurationsMs: totals, traceEvents: tracing.length };
}
let traceDone = () => {};
let session;
try {
  for (let i = 0; !wsUrl && i < 100; i++) await sleep(100);
  if (!wsUrl) throw new Error("Chromium did not open CDP: " + executable);
  const port = new URL(wsUrl).port;
  const target = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  if (!target[0]?.webSocketDebuggerUrl) throw new Error("No Chromium page target");
  socket = new WebSocket(target[0].webSocketDebuggerUrl);
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const waiting = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiting?.reject(new Error(JSON.stringify(message.error)));
      else waiting?.resolve(message.result || {});
    } else if (message.method === "Tracing.dataCollected") tracing.push(...message.params.value);
    else if (message.method === "Tracing.tracingComplete") traceDone();
    else if (message.method === "Fetch.requestPaused") {
      if (!fixture) {
        send("Fetch.continueRequest", { requestId: message.params.requestId }, session).catch(console.error);
      } else {
        send("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 200,
          responseHeaders: [{ name: "Content-Type", value: "application/json; charset=utf-8" }],
          body: Buffer.from(apiText).toString("base64") }, session).catch(console.error);
      }
    }
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  session = (await send("Target.attachToTarget", { targetId: target[0].id, flatten: true })).sessionId;
  await send("Page.enable", {}, session);
  await send("Runtime.enable", {}, session);
  await send("Profiler.enable", {}, session);
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, session);
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }, session);
  await send("Emulation.setCPUThrottlingRate", { rate: factor }, session);
  const apiUrl = new URL(`/api/bdb/search?query=${encodeURIComponent("קְרַאת")}`, apiOrigin);
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`API ${apiUrl}: HTTP ${response.status}`);
  const liveApiText = await response.text();
  const apiText = fixture ? await readFile(fixture, "utf8") : liveApiText;
  if (fixture && sha(liveApiText) !== sha(apiText))
    throw new Error(`Fixture differs from live API: fixture ${sha(apiText)}, live ${sha(liveApiText)}`);
  const api = JSON.parse(apiText);
  if (!Array.isArray(api) || !api.length) throw new Error("Exact BDB API response contains no entries");
  if (fixture) await send("Fetch.enable", { patterns: [{ urlPattern: "*api/bdb/search*", requestStage: "Request" }] }, session);
  const runs = [];
  for (let i = 0; i < repeats; i++) {
    await send("Network.enable", {}, session);
    await send("Network.setCacheDisabled", { cacheDisabled: true }, session);
    await startCapture();
    const began = performance.now();
    await send("Page.navigate", { url: url.href }, session);
    await waitFor(`document.querySelectorAll('[data-testid^="entry-"] .dictionary-content').length > 0`);
    const entryVisibleMs = performance.now() - began;
    const load = await stopCapture();
    const dom = await evaluate(`(() => {
      const senses = [...document.querySelectorAll('[data-testid^="entry-"] .dictionary-content')];
      return { entryCount: document.querySelectorAll('[data-testid^="entry-"]').length,
        senseCount: senses.length, html: senses.map(el => el.innerHTML),
        links: senses.flatMap(el => [...el.querySelectorAll('a')].map(a => a.getAttribute('href'))),
        transliterationCount: senses.reduce((n, el) => n + (el.textContent.match(/\\[[^\\]]+\\]/g) || []).length, 0),
        toggle: [...document.querySelectorAll('button,input')].filter(el => /transliterat/i.test(el.textContent + (el.getAttribute('aria-label') || ''))).map(el => el.outerHTML.slice(0, 250)) };
    })()`);
    const actions = {};
    for (const [name, script] of Object.entries({
      typing: `(() => { const input = document.querySelector('[data-testid="input-search"]'); input.focus(); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, input.value + 'א'); input.dispatchEvent(new Event('input', { bubbles: true })); return input.value; })()`,
      scroll: `(() => { window.scrollTo(0, Math.min(document.documentElement.scrollHeight - innerHeight, 1400)); return scrollY; })()`,
      outline: `(() => { const el = document.querySelector('[data-testid="outline-toggle-floating"]') || document.querySelector('[data-testid^="outline-toggle-"]'); if (!el) return 'unavailable'; el.click(); return el.getAttribute('data-testid'); })()`,
    })) {
      await startCapture();
      const actionStart = performance.now();
      const { value, inputToTwoFramesMs } = await evaluate(`new Promise(resolve => {
        const start = performance.now();
        const value = ${script};
        requestAnimationFrame(() => requestAnimationFrame(() => resolve({ value, inputToTwoFramesMs: performance.now() - start })));
      })`);
      await sleep(250);
      const observationWindowMs = performance.now() - actionStart;
      actions[name] = { value, inputToTwoFramesMs, observationWindowMs, ...(await stopCapture()) };
    }
    runs.push({ entryVisibleMs, load, actions, dom: {
      entryCount: dom.entryCount, senseCount: dom.senseCount, htmlSha256: sha(JSON.stringify(dom.html)),
      htmlLengths: dom.html.map(s => s.length), linksSha256: sha(JSON.stringify(dom.links)),
      html: dom.html, links: dom.links, transliterationCount: dom.transliterationCount, transliterationToggle: dom.toggle,
    } });
    console.log(`run ${i + 1}: ${entryVisibleMs.toFixed(1)}ms visible, ${dom.senseCount} senses, ${dom.links.length} links`);
  }
  const result = { url: url.href, chromium: await (await fetch(`http://127.0.0.1:${port}/json/version`)).json().then(v => v.Browser),
    cpuThrottle: factor, viewport: { width: 390, height: 844, deviceScaleFactor: 2 }, capturedAt: new Date().toISOString(),
    api: { url: apiUrl.href, sha256: sha(apiText), bytes: Buffer.byteLength(apiText), entries: api.length,
      senses: api.reduce((n, e) => n + (e.content?.senses?.length || 0), 0) }, runs };
  await writeFile(output, JSON.stringify(result, null, 2));
  console.log(`saved ${output}`);
} finally {
  socket?.close();
  browser.kill();
  await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}