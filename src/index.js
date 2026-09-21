import "dotenv/config";
import assert from "node:assert";
import { ReqResClient } from "./ReqResClient.js";
import { withCache, withRetry, withTimeout } from "./tasks.js";
import { withLogging, withValidation } from "./colleagues.js";
import { createHttpError, createRawRequest } from "./utils/http.js";
import { delay } from "./utils/delay.js";
import {
  ALLOWED_STATUSES,
  CACHE_STUB_TTL_MS,
  CACHE_TTL_MS,
  DELAY_QUERY,
  DEMO_USER_IDS,
  MAX_RETRIES,
  NETWORK_ERROR_MESSAGE,
  NOT_FOUND_STATUS,
  SERVER_ERROR_STATUS,
  STUB_ERROR_BODY,
  STUB_RESULT,
  TIMEOUT_ERROR_MESSAGE,
  TIMEOUT_MS,
  UNAUTHORIZED_STATUS,
  UNKNOWN_USER_ID,
  USERS_ENDPOINT,
} from "../config/constants.js";

const client = new ReqResClient();
const rawRequest = createRawRequest(client.apiKey);
const USERS_URL = `${client.baseUrl}${USERS_ENDPOINT}`;

/**
 * Wraps an async function and counts how many times it was called.
 * The wrapped function receives the current call number as its first
 * argument, followed by the caller's own arguments.
 * @param {Function} fn - function to wrap, called as fn(callNumber, ...args)
 * @returns {Function} wrapped function with a `.calls` counter
 */
function counted(fn) {
  const wrapper = async (...args) => {
    wrapper.calls += 1;
    return fn(wrapper.calls, ...args);
  };
  wrapper.calls = 0;
  return wrapper;
}

/**
 * Builds a stub that throws `error` on every call except the last one
 * (MAX_RETRIES), where it returns STUB_RESULT instead. Used to simulate a
 * flaky dependency that recovers right before retries run out.
 * @param {Error} error - error to throw on non-final attempts
 * @returns {Function} function of (callNumber) => result
 */
function failsUntilLast(error) {
  return (callNumber) => {
    if (callNumber < MAX_RETRIES) {
      throw error;
    }
    return STUB_RESULT;
  };
}

/**
 * Creates a counted stub simulating a server that always answers 500.
 * @returns {Function} counted function returning a raw 500 Response
 */
function fakeBrokenServer() {
  return counted(
    () => new Response(STUB_ERROR_BODY, { status: SERVER_ERROR_STATUS }),
  );
}

/**
 * Part 3: fetches several users in parallel and checks the shape of the
 * resulting email list.
 * @returns {Promise<void>}
 */
async function runIntegrationFlow() {
  const responses = await Promise.all(
    DEMO_USER_IDS.map((id) => client.getUser(id)),
  );
  const emails = responses.map((res) => res.data.email);

  assert(Array.isArray(emails), "emails should be an array");
  assert.strictEqual(emails.length, DEMO_USER_IDS.length, "wrong emails count");
}

/**
 * Part 4: verifies withRetry's smart-retry behavior — network errors and
 * 5xx are retried, 4xx are not, and the last error is thrown when every
 * attempt fails.
 * @returns {Promise<void>}
 */
async function runRetryChecks() {
  const realUser = counted((_n, id) => client.getUser(id));
  await withRetry(realUser, MAX_RETRIES)(DEMO_USER_IDS[0]);
  assert.strictEqual(realUser.calls, 1, "success should take one attempt");

  const missingUser = counted((_n, id) => client.getUser(id));
  await assert.rejects(
    () => withRetry(missingUser, MAX_RETRIES)(UNKNOWN_USER_ID),
    { status: NOT_FOUND_STATUS },
  );
  assert.strictEqual(missingUser.calls, 1, "404 should NOT be retried");

  const authError = counted(() => {
    throw createHttpError(UNAUTHORIZED_STATUS);
  });
  await assert.rejects(() => withRetry(authError, MAX_RETRIES)(), {
    status: UNAUTHORIZED_STATUS,
  });
  assert.strictEqual(authError.calls, 1, "401 should NOT be retried");

  const flaky500 = counted(
    failsUntilLast(createHttpError(SERVER_ERROR_STATUS)),
  );
  assert.strictEqual(await withRetry(flaky500, MAX_RETRIES)(), STUB_RESULT);
  assert.strictEqual(flaky500.calls, MAX_RETRIES);

  const flakyNetwork = counted(
    failsUntilLast(new TypeError(NETWORK_ERROR_MESSAGE)),
  );
  assert.strictEqual(await withRetry(flakyNetwork, MAX_RETRIES)(), STUB_RESULT);
  assert.strictEqual(flakyNetwork.calls, MAX_RETRIES);

  // all attempts failed, the last error must be thrown
  const alwaysDown = counted(() => {
    throw createHttpError(SERVER_ERROR_STATUS);
  });
  await assert.rejects(() => withRetry(alwaysDown, MAX_RETRIES)(), {
    status: SERVER_ERROR_STATUS,
  });
  assert.strictEqual(alwaysDown.calls, MAX_RETRIES);
}

/**
 * Bonus 2: verifies withTimeout aborts a slow request and lets a normal
 * one complete.
 * @returns {Promise<void>}
 */
async function runTimeoutChecks() {
  const getUserWithTimeout = withTimeout(
    client.getUser.bind(client),
    TIMEOUT_MS,
  );
  await getUserWithTimeout(DEMO_USER_IDS[0]);

  const slowRequest = withTimeout(rawRequest, TIMEOUT_MS);
  await assert.rejects(() => slowRequest(`${USERS_URL}${DELAY_QUERY}`), {
    message: TIMEOUT_ERROR_MESSAGE,
  });
}

/**
 * Bonus 3: verifies withCache reuses a result within ttlMs and refreshes
 * it after the ttl expires.
 * @returns {Promise<void>}
 */
async function runCacheChecks() {
  const getUser = counted((_n, id) => client.getUser(id));
  const cachedGetUser = withCache(getUser, CACHE_TTL_MS);

  const first = await cachedGetUser(DEMO_USER_IDS[0]);
  const second = await cachedGetUser(DEMO_USER_IDS[0]);
  assert.deepStrictEqual(first, second, "cached data should be the same");
  assert.strictEqual(getUser.calls, 1, "second call went to the network");

  // after ttl it has to call the function again
  const shortLived = counted(() => STUB_RESULT);
  const cachedShortLived = withCache(shortLived, CACHE_STUB_TTL_MS);
  await cachedShortLived(DEMO_USER_IDS[0]);
  await delay(CACHE_STUB_TTL_MS * 2);
  await cachedShortLived(DEMO_USER_IDS[0]);
  assert.strictEqual(shortLived.calls, 2, "cache did not expire");
}

/**
 * Bonus 1: composes withLogging, withRetry and withValidation together and
 * checks how decorator order changes what withLogging can see.
 * When withLogging wraps everything from the outside, it only logs one
 * [Call]/[API Error] pair for the whole operation — retries happening
 * inside stay invisible to it. When withLogging is placed innermost
 * (around the raw fetch), it logs every attempt as [Success], because raw
 * fetch does not throw on 5xx; the real error only appears later, once
 * withValidation inspects the status code.
 * @returns {Promise<void>}
 */
async function runCompositionChecks() {
  const superFetch = withLogging(
    withRetry(withValidation(rawRequest, ALLOWED_STATUSES), MAX_RETRIES),
  );
  await superFetch(`${USERS_URL}/${DEMO_USER_IDS[1]}`);

  // logging on the outside: one [Call] and one [API Error] for the whole
  // thing, the retries inside are not visible
  const outer = fakeBrokenServer();
  const loggedOutside = withLogging(
    withRetry(withValidation(outer, ALLOWED_STATUSES), MAX_RETRIES),
  );
  await assert.rejects(() => loggedOutside(), { status: SERVER_ERROR_STATUS });
  assert.strictEqual(outer.calls, MAX_RETRIES);

  // logging on the inside: it only sees the raw fetch, and fetch does not
  // throw on 500, so every attempt is [Success] and the error comes later
  // from withValidation
  const inner = fakeBrokenServer();
  const loggedInside = withRetry(
    withValidation(withLogging(inner), ALLOWED_STATUSES),
    MAX_RETRIES,
  );
  await assert.rejects(() => loggedInside(), { status: SERVER_ERROR_STATUS });
  assert.strictEqual(inner.calls, MAX_RETRIES);
}

/**
 * Entry point: runs every check for Sprint 2 in sequence, then triggers
 * the `this`-context demo.
 * @returns {Promise<void>}
 */
async function main() {
  await runIntegrationFlow();
  await runRetryChecks();
  await runTimeoutChecks();
  await runCacheChecks();
  await runCompositionChecks();
  client.testContext();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
