export type GeminiRequestResult = {
  response: Response;
  payload: any;
  attempts: number;
};

type RetryOptions = {
  maxAttempts?: number;
  timeoutMs?: number;
  fetcher?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
};

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function retryDelay(response: Response | undefined, attempt: number): number {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 1500);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay) && dateDelay > 0) return Math.min(dateDelay, 1500);
  }
  return attempt === 1 ? 600 : 1200;
}

/**
 * Retries only transient Gemini overload/server/network failures.
 * Three bounded attempts with a 12-second timeout fit the API route's 60-second budget, including guide loading.
 */
export async function requestGeminiWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions = {},
): Promise<GeminiRequestResult> {
  const maxAttempts = options.maxAttempts ?? 3;
  const timeoutMs = options.timeoutMs ?? 12000;
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response: Response | undefined;
    try {
      response = await fetcher(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      let payload: any = {};
      try {
        payload = await response.clone().json();
      } catch {
        // Preserve the HTTP response even when the provider returns a non-JSON body.
      }
      if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === maxAttempts) {
        return { response, payload, attempts: attempt };
      }
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
    }
    await sleep(retryDelay(response, attempt));
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini request failed.");
}
