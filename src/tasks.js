import {
  ABORT_ERROR_NAME,
  MAX_RETRIES,
  TIMEOUT_ERROR_MESSAGE,
} from "../config/constants.js";
import { isRetryableError } from "./utils/http.js";

/**
 * Retries asyncFn on network errors and 5xx. Other errors (4xx) are thrown
 * right away. When attempts are over, the last error is thrown.
 * @param {Function} asyncFn - async function to wrap
 * @param {number} [maxRetries] - max number of attempts
 * @returns {Function} wrapped function
 */
export function withRetry(asyncFn, maxRetries = MAX_RETRIES) {
  if (!Number.isInteger(maxRetries) || maxRetries < 1) {
    throw new RangeError("maxRetries must be an integer >= 1");
  }

  return async function (...args) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn(...args);
      } catch (err) {
        lastError = err;
        if (!isRetryableError(err)) {
          throw err;
        }
      }
    }

    throw lastError;
  };
}

/**
 * Aborts the request if it takes longer than timeoutMs.
 * fetchFn gets `{ signal }` as the last argument and must pass it to fetch.
 * @param {Function} fetchFn - function that makes the request
 * @param {number} timeoutMs - time limit in ms
 * @returns {Function} wrapped function
 * @throws {Error} "Request Timeout" when time is up
 */
export function withTimeout(fetchFn, timeoutMs) {
  return async function (...args) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetchFn(...args, { signal: controller.signal });
    } catch (err) {
      if (err.name === ABORT_ERROR_NAME) {
        throw new Error(TIMEOUT_ERROR_MESSAGE);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * Remembers results for the same arguments for ttlMs.
 * @param {Function} fetchFn - function to cache
 * @param {number} ttlMs - how long the result lives, in ms
 * @returns {Function} wrapped function
 */
export function withCache(fetchFn, ttlMs) {
  const cache = new Map();

  return async function (...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.savedAt < ttlMs) {
      return cached.data;
    }

    const data = await fetchFn(...args);
    cache.set(key, { data, savedAt: Date.now() });
    return data;
  };
}
