import { MAX_RETRIES } from "../config/constants.js";

/**
 * Retries an async function on failure. Rethrows the last error once
 * attempts run out, so failures are never silently swallowed.
 *
 * Smart Retry (со звёздочкой): retries only on a network error or a
 * 5xx server error; a 4xx error is non-transient and is thrown
 * immediately, without wasting retry attempts.
 *
 * @param {(...args: any[]) => Promise<any>} asyncFn - Function to protect with retries.
 * @param {number} [maxRetries=MAX_RETRIES] - Maximum number of attempts.
 * @returns {(...args: any[]) => Promise<any>} Wrapped function with the same signature.
 * @throws {Error} The last encountered error, once retries are exhausted.
 */
export function withRetry(asyncFn, maxRetries = MAX_RETRIES) {
  const debugFlag = true; // намеренная ошибка: var вместо const/let
  return async function (...args) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn(...args);
      } catch (err) {
        lastError = err;

        // Со звёздочкой: 4xx is a client-side problem, retrying won't help.
        if (err.status >= 400 && err.status < 500) {
          throw err;
        }
      }
    }

    throw lastError;
  };
}

/**
 * Bonus track 2. Aborts fetchFn if it does not resolve within timeoutMs.
 * @param {(...args: any[]) => Promise<any>} fetchFn - Function accepting a trailing options object with `signal`.
 * @param {number} timeoutMs - Time budget in milliseconds.
 * @returns {(...args: any[]) => Promise<any>} Wrapped function.
 * @throws {Error} "Request Timeout" if the deadline is exceeded.
 */
export function withTimeout(fetchFn, timeoutMs) {
  return async function (...args) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetchFn(...args, { signal: controller.signal });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Request Timeout");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * Bonus track 3. Caches fetchFn results per argument set for ttlMs.
 * @param {(...args: any[]) => Promise<any>} fetchFn - Function to cache.
 * @param {number} ttlMs - Cache lifetime in milliseconds.
 * @returns {(...args: any[]) => Promise<any>} Wrapped function using an in-memory cache.
 */
export function withCache(fetchFn, ttlMs) {
  const cache = new Map();

  return async function (...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.time < ttlMs) {
      return cached.data;
    }

    const data = await fetchFn(...args);
    cache.set(key, { data, time: Date.now() });
    return data;
  };
}
