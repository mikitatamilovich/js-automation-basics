import { API_KEY_HEADER, SERVER_ERROR_STATUS } from "../../config/constants.js";

/**
 * Creates an error with the http status attached to it.
 * @param {number} status - HTTP status code
 * @param {string} [body] - response text, added to the message
 * @returns {Error} error with a `status` field
 */
export function createHttpError(status, body) {
  const err = new Error(body ? `HTTP ${status}: ${body}` : `HTTP ${status}`);
  err.status = status;
  return err;
}

/**
 * Network errors (no status) and 5xx can be retried, 4xx can not.
 * @param {Error} err - caught error
 * @returns {boolean} true if it makes sense to try again
 */
export function isRetryableError(err) {
  const status = err?.status;
  return status === undefined || status >= SERVER_ERROR_STATUS;
}

/**
 * Builds a fetch that adds the api key and returns the raw Response.
 * @param {string} apiKey - value for the x-api-key header
 * @returns {Function} request function
 */
export function createRawRequest(apiKey) {
  return function (url, options = {}) {
    return fetch(url, {
      ...options,
      headers: { [API_KEY_HEADER]: apiKey, ...options.headers },
    });
  };
}
