import express from "express";
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { createJastrowRouter } from "./jastrow";

const searchEntries = vi.hoisted(() => vi.fn());
vi.mock("../storage", () => ({ storage: { searchEntries } }));

const app = express();
app.use(createJastrowRouter());
let server: ReturnType<typeof app.listen>;
let base: string;

beforeAll(async () => {
  server = await new Promise<ReturnType<typeof app.listen>>(resolve => {
    const started = app.listen(0, () => resolve(started));
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test listener");
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});
beforeEach(() => searchEntries.mockReset());

it("caches successful results and filters cached homographs by stable ID", async () => {
  searchEntries.mockResolvedValue([{ rid: "Q00001" }, { rid: "Q00002" }]);
  const q = encodeURIComponent("cache-example");
  const first = await fetch(`${base}/api/jastrow/search?query=${q}&rid=Q00002`);
  const second = await fetch(`${base}/api/jastrow/search?query=${q}&rid=Q00001`);
  expect(await first.json()).toEqual([{ rid: "Q00002" }]);
  expect(await second.json()).toEqual([{ rid: "Q00001" }]);
  expect(searchEntries).toHaveBeenCalledTimes(1);
});

it("does not cache empty results, which may represent upstream failure", async () => {
  searchEntries.mockResolvedValueOnce([]).mockResolvedValueOnce([{ rid: "Q00003" }]);
  const q = encodeURIComponent("previously-empty");
  expect(await (await fetch(`${base}/api/jastrow/search?query=${q}`)).json()).toEqual([]);
  expect(await (await fetch(`${base}/api/jastrow/search?query=${q}`)).json()).toEqual([{ rid: "Q00003" }]);
  expect(searchEntries).toHaveBeenCalledTimes(2);
});

it("coalesces simultaneous lookups of the same query", async () => {
  searchEntries.mockImplementation(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [{ rid: "Q00004" }];
  });
  const q = encodeURIComponent("simultaneous-example");
  const responses = await Promise.all([
    fetch(`${base}/api/jastrow/search?query=${q}`),
    fetch(`${base}/api/jastrow/search?query=${q}`),
  ]);
  expect(await Promise.all(responses.map(r => r.json()))).toEqual([
    [{ rid: "Q00004" }], [{ rid: "Q00004" }],
  ]);
  expect(searchEntries).toHaveBeenCalledTimes(1);
});
