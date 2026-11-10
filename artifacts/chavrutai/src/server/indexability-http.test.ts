import { mkdtemp, mkdir, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import { spawn, type ChildProcess } from "node:child_process";
import { build } from "esbuild";
import { afterAll, beforeAll, expect, it } from "vitest";

let directory: string;
let child: ChildProcess;
let baseUrl: string;
const enhancementRequests: string[] = [];
const api = createServer((req, res) => {
  enhancementRequests.push(req.url!);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    complete: true,
    bodyContent: '<div id="crawler-content">Places enhancement fixture</div>',
  }));
});

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "indexability-"));
  await mkdir(path.join(directory, "public"));
  await copyFile(new URL("../../index.html", import.meta.url), path.join(directory, "public/index.html"));
  await copyFile(new URL("../../public/robots.txt", import.meta.url), path.join(directory, "public/robots.txt"));
  await build({
    entryPoints: [new URL("./index.ts", import.meta.url).pathname],
    outfile: path.join(directory, "server.mjs"),
    bundle: true, platform: "node", format: "esm",
    banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
  });
  await new Promise<void>(resolve => api.listen(0, "127.0.0.1", resolve));
  const apiAddress = api.address();
  if (!apiAddress || typeof apiAddress === "string") throw new Error("API did not bind");
  // Reserve an available port for this isolated production-server process.
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, "127.0.0.1", resolve));
  const address = reservation.address();
  if (!address || typeof address === "string") throw new Error("Port did not bind");
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  baseUrl = `http://127.0.0.1:${address.port}`;
  child = spawn(process.execPath, [path.join(directory, "server.mjs")], {
    env: { ...process.env, NODE_ENV: "production", PORT: String(address.port),
      SEO_ENHANCE_BASE_URL: `http://127.0.0.1:${apiAddress.port}` },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise<void>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", code => reject(new Error(`Server exited: ${code}`)));
    child.stdout!.on("data", chunk => {
      if (String(chunk).includes("server listening")) resolve();
    });
  });
}, 15000);

afterAll(async () => {
  if (child && child.exitCode === null) {
    const stopped = new Promise(resolve => child.once("exit", resolve));
    child.kill();
    await stopped;
  }
  await new Promise<void>(resolve => api.close(() => resolve()));
  if (directory) await rm(directory, { recursive: true, force: true });
});

it("serves public Places to browsers and enhanced indexable Places to crawlers", async () => {
  for (const userAgent of ["Mozilla/5.0", "Googlebot", "Bingbot"]) {
    for (const pathname of ["/places", "/places/"]) {
      const response = await fetch(`${baseUrl}${pathname}`, { headers: { "user-agent": userAgent } });
      expect(response.status).toBe(200);
      expect(response.headers.get("x-robots-tag")).toBeNull();
      const html = await response.text();
      expect(html).not.toMatch(/name="robots" content="[^"]*noindex/);
      if (userAgent !== "Mozilla/5.0") {
        expect(html).toContain('href="https://bekiut.com/places"');
        expect(html).toContain('id="crawler-content"');
        expect(html).toContain("Biblical &amp; Talmudic Places Map");
      }
    }
  }
  expect(enhancementRequests.some(url => url.includes("path=%2Fplaces"))).toBe(true);
});

it("redirects Bible aliases and legacy URLs for browsers and crawlers, preserving queries", async () => {
  for (const userAgent of ["Mozilla/5.0", "Googlebot"]) {
    for (const [source, target] of [
      ["/bible/genesis/1", "/bible/Genesis/1"],
      ["/bible/song-of-songs/8", "/bible/Song_of_Songs/8"],
      ["/contents/Berakhot", "/talmud/Berakhot"],
      ["/tractate/Berakhot/2a", "/talmud/Berakhot/2a"],
    ]) {
      const response = await fetch(`${baseUrl}${source}?ref=test`, {
        redirect: "manual", headers: { "user-agent": userAgent },
      });
      expect(response.status, source).toBe(301);
      expect(response.headers.get("location")).toBe(`${target}?ref=test`);
    }
  }
  const response = await fetch(`${baseUrl}/bible/Genesis/1`, { headers: { "user-agent": "Googlebot" } });
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('href="https://bekiut.com/bible/Genesis/1"');
});
