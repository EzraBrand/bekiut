import express from "express";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import type { Server } from "node:http";
import { servePageWithMeta, renderSeoEnhancement } from "./seo";
import { injectJsonLd } from "@workspace/shared-data/json-ld";
import { isKnownAppPath } from "@workspace/shared-data/route-validation";

vi.mock("../lib/ben-yehuda", () => ({ searchBenYehuda: vi.fn().mockResolvedValue([]) }));
let server: Server;
let baseUrl: string;
beforeAll(async () => {
  const app = express();
  app.get("/ben-yehuda", servePageWithMeta);
  app.get("/ben-yehuda/abbreviations", servePageWithMeta);
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, "127.0.0.1", error => error ? reject(error) : resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No port");
  baseUrl = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });

it("serves the public abbreviation table with its own crawler title and known route", async () => {
  expect(isKnownAppPath("/ben-yehuda/abbreviations")).toBe(true);
  const response = await fetch(`${baseUrl}/ben-yehuda/abbreviations`, { headers: { "user-agent": "Googlebot" } });
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("Ben-Yehuda Dictionary Abbreviations");
  expect(html).toContain("opening grammatical labels");
  expect(html).toContain('href="/ben-yehuda"');
});

it("keeps script-closing Ben-Yehuda crawler queries inert in real HTML responses", async () => {
  const query = '</script><script id="injected">alert(1)</script><!--';
  const response = await fetch(`${baseUrl}/ben-yehuda?q=${encodeURIComponent(query)}`, {
    headers: { "user-agent": "Googlebot" },
  });
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).not.toContain('<script id="injected">');
  expect(html).not.toContain(query);
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  expect(json).toBeDefined();
  expect(JSON.parse(json!).name).toContain(query);
  expect(json).toContain("\\u003c/script\\u003e");
});

it("safely handles replacement metacharacters and both template branches", () => {
  const text = "</script>$&$`$'&\u2028\u2029";
  for (const template of ['<head></head>', '<head><script type="application/ld+json">{}</script></head>']) {
    const html = injectJsonLd(template, { text });
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
    expect(JSON.parse(json).text).toBe(text);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  }
});

it("puts bet before gimel in the aleph crawler listing regardless of vowels", async () => {
  const { bodyContent } = await renderSeoEnhancement("/ben-yehuda/headwords/א");
  const bet = bodyContent.indexOf(`>${"אֲבִי"}</a>`);
  const gimel = bodyContent.indexOf(`>${"אֱגוֹד"}</a>`);
  expect(bet).toBeGreaterThan(-1);
  expect(gimel).toBeGreaterThan(bet);
});
