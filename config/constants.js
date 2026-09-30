/**
 * Max number of attempts for withRetry.
 * @type {number}
 */
export const MAX_RETRIES = 3;

/**
 * User id that always returns 404.
 * @type {number}
 */
export const UNKNOWN_USER_ID = 9999;

/**
 * User ids for the Promise.all demo.
 * @type {number[]}
 */
export const DEMO_USER_IDS = [1, 2, 3];

/**
 * Users endpoint path.
 * @type {string}
 */
export const USERS_ENDPOINT = "/api/users";

/**
 * Query string that makes the server answer after 3 seconds.
 * @type {string}
 */
export const DELAY_QUERY = "?delay=3";

/**
 * Header name for the API key.
 * @type {string}
 */
export const API_KEY_HEADER = "x-api-key";

/**
 * Delay of the this-context demo, in ms.
 * @type {number}
 */
export const CONTEXT_DEMO_DELAY_MS = 1000;

/**
 * First status code treated as a server error.
 * @type {number}
 */
export const SERVER_ERROR_STATUS = 500;

/**
 * Status code for a missing resource.
 * @type {number}
 */
export const NOT_FOUND_STATUS = 404;

/**
 * Status code for an authentication error.
 * @type {number}
 */
export const UNAUTHORIZED_STATUS = 401;

/**
 * Statuses that count as success in withValidation.
 * @type {number[]}
 */
export const ALLOWED_STATUSES = [200, 201];

/**
 * Time budget for withTimeout, in ms (must be less than the 3s delay).
 * @type {number}
 */
export const TIMEOUT_MS = 2000;

/**
 * Name of the error fetch throws when a request is aborted.
 * @type {string}
 */
export const ABORT_ERROR_NAME = "AbortError";

/**
 * Message of the error thrown by withTimeout.
 * @type {string}
 */
export const TIMEOUT_ERROR_MESSAGE = "Request Timeout";

/**
 * Cache lifetime for the real request check, in ms.
 * @type {number}
 */
export const CACHE_TTL_MS = 5000;

/**
 * Short cache lifetime for the expiry check, in ms.
 * @type {number}
 */
export const CACHE_STUB_TTL_MS = 50;

/**
 * Message of the fake network error used in checks.
 * @type {string}
 */
export const NETWORK_ERROR_MESSAGE = "fetch failed";

/**
 * Value returned by the stubs used in checks.
 * @type {string}
 */
export const STUB_RESULT = "ok";

/**
 * Body of the fake 500 response used in checks.
 * @type {string}
 */
export const STUB_ERROR_BODY = "server error";
