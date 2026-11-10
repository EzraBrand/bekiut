/** Deadline includes downloading the body, not just receiving HTTP headers. */
export const SEFARIA_TIMEOUT_MS = 8_000;
export const SEFARIA_TIMEOUT_MESSAGE = "Sefaria is taking too long to respond. Please try again shortly.";

export class SefariaTimeoutError extends Error {
  constructor() {
    super(SEFARIA_TIMEOUT_MESSAGE);
    this.name = "SefariaTimeoutError";
  }
}

export async function fetchSefaria(
  input: string,
  init: RequestInit = {},
  timeoutMs = SEFARIA_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const signal = init.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal });
    // Buffer under the same deadline; callers can retain their existing JSON/status handling.
    const body = await response.arrayBuffer();
    return new Response([204, 205, 304].includes(response.status) ? null : body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    if (controller.signal.aborted) throw new SefariaTimeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
