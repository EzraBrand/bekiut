import { describe, expect, it } from "vitest";
import { LatestRequest } from "./latest-request";

describe("Jastrow request ordering", () => {
  it("ignores an older response even when its promise resolves after the new one", async () => {
    const latest = new LatestRequest();
    const applied: string[] = [];
    let finishOld!: () => void;
    const oldRequest = latest.begin();
    const oldResponse = new Promise<void>(resolve => { finishOld = resolve; })
      .then(() => { if (oldRequest.isCurrent()) applied.push("old"); });
    const newRequest = latest.begin();
    expect(oldRequest.signal.aborted).toBe(true);
    if (newRequest.isCurrent()) applied.push("new");
    finishOld();
    await oldResponse;
    expect(applied).toEqual(["new"]);
  });

  it("invalidates pending work when returning to the empty reader or unmounting", () => {
    const latest = new LatestRequest();
    const request = latest.begin();
    latest.invalidate();
    expect(request.signal.aborted).toBe(true);
    expect(request.isCurrent()).toBe(false);
  });
});
