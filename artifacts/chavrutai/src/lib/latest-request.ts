/** Ensures only the most recent navigation can update a reader. */
export class LatestRequest {
  private generation = 0;
  private controller?: AbortController;

  begin() {
    this.invalidate();
    this.controller = new AbortController();
    const generation = this.generation;
    return {
      signal: this.controller.signal,
      isCurrent: () => this.generation === generation,
    };
  }

  invalidate() {
    this.generation++;
    this.controller?.abort();
    this.controller = undefined;
  }
}
