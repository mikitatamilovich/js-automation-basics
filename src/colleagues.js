// teammates' decorators, only needed for the bonus 1 composition.
// swap for real imports when their code is merged
import { createHttpError } from "./utils/http.js";

/**
 * @param {Function} fetchFn - returns a raw Response
 * @param {number[]} allowedStatuses - statuses that are ok
 * @returns {Function} wrapped function that returns json
 * @throws {Error} with a `status` field if the status is not allowed
 */
export function withValidation(fetchFn, allowedStatuses) {
  return async function (...args) {
    const response = await fetchFn(...args);

    if (!allowedStatuses.includes(response.status)) {
      const errorBody = await response.text();
      throw createHttpError(response.status, errorBody);
    }

    return response.json();
  };
}

/* eslint-disable no-console */
/**
 * @param {Function} asyncFn - async function to wrap
 * @returns {Function} wrapped function
 */
export function withLogging(asyncFn) {
  return async function (...args) {
    console.log(`[Call] arguments: ${JSON.stringify(args)}`);
    const start = performance.now();

    try {
      const result = await asyncFn(...args);
      console.log(`[Success] time: ${Math.round(performance.now() - start)}ms`);
      return result;
    } catch (err) {
      const time = Math.round(performance.now() - start);
      console.error(`[API Error] ${err.message}, time: ${time}ms`);
      throw err;
    }
  };
}
/* eslint-enable no-console */
