import express from "express";
import type { Server } from "node:http";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createSearchRouter } from "./search";
import { textSearchResponseSchema } from "@workspace/db";

const realFetch = globalThis.fetch;
let server: Server;
let base: string;
const upstream = vi.fn();
beforeEach(async () => {
  upstream.mockReset();
  vi.stubGlobal("fetch", upstream);
  server = express().use(createSearchRouter()).listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/search/text`;
});
afterEach(async () => {
  vi.unstubAllGlobals();
  await new Promise<void>(resolve => server.close(() => resolve()));
});

it.each([false, true])("paginates distinct passages without skipping with uneven duplicates=%s", async duplicates => {
  const refs = Array.from({ length: 7 }, (_, i) => `Genesis 1:${i + 1}`);
  const raw = refs.flatMap((ref, i) => Array(duplicates ? i % 3 + 1 : 1).fill(ref));
  upstream.mockImplementation(async (_url, options) => {
    const body = JSON.parse(options.body);
    expect(body.collapse).toEqual({ field: "ref.keyword" });
    expect(body.aggs.unique_refs.cardinality.field).toBe("ref.keyword");
    expect(body.sort).toContainEqual({ "ref.keyword": {} });
    const grouped = [...new Set(raw)];
    return Response.json({
      hits: { total: { value: raw.length }, hits: grouped.slice(body.from, body.from + body.size)
        .map(ref => ({ _source: { ref, path: "Tanakh/Torah/Genesis", exact: "text" } })) },
      aggregations: { unique_refs: { value: grouped.length } }
    });
  });
  const seen: string[] = [];
  for (let page = 1; page <= 4; page++) {
    const response = await realFetch(`${base}?query=test&pageSize=3&page=${page}`);
    expect(response.status).toBe(200);
    const data = textSearchResponseSchema.parse(await response.json());
    expect(data).toMatchObject({ total: 7, totalPages: 3, totalIsApproximate: true, page });
    seen.push(...data.results.map((r: { ref: string }) => r.ref));
  }
  expect(seen).toEqual(refs);
  expect(upstream.mock.calls.map(([, options]) => JSON.parse(options.body).from)).toEqual([0, 3, 6, 9]);
});

it("returns an empty result set with zero pages", async () => {
  upstream.mockResolvedValue(Response.json({ hits: { hits: [] }, aggregations: { unique_refs: { value: 0 } } }));
  const response = await realFetch(`${base}?query=nothing`);
  expect(await response.json()).toMatchObject({ results: [], total: 0, totalPages: 0 });
});

it.each([{ timed_out: true }, { _shards: { failed: 1 } }, {}])("rejects incomplete upstream counts: %j", async data => {
  upstream.mockResolvedValue(Response.json({ hits: { hits: [] }, ...data }));
  expect((await realFetch(`${base}?query=test`)).status).toBe(502);
});

it("rejects fractional pagination", async () => {
  expect((await realFetch(`${base}?query=test&page=1.5`)).status).toBe(400);
  expect(upstream).not.toHaveBeenCalled();
});
