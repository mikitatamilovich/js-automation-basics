import assert from "node:assert";
import { normalizeConfig } from "./utils/config.js";
import { DEFAULT_RETRIES, DEFAULT_AUTH_TOKEN } from "../config/constants.js";

const API_BASE_URL = "https://shop.com/api";
const AUTH_TOKEN_SAMPLE = "x-token-123";
const INVALID_RAW_CONFIG = "not-an-object";

const RAW_CONFIG_WITH_TOKEN = {
  apiBase: API_BASE_URL,
  headers: { auth: { token: AUTH_TOKEN_SAMPLE } },
};

const RAW_CONFIG_WITHOUT_HEADERS = {
  apiBase: API_BASE_URL,
};

assert.deepStrictEqual(
  normalizeConfig(RAW_CONFIG_WITH_TOKEN),
  { url: API_BASE_URL, retries: DEFAULT_RETRIES, token: AUTH_TOKEN_SAMPLE },
  "normalizeConfig: happy path does not match expected shape",
);

assert.deepStrictEqual(
  normalizeConfig(RAW_CONFIG_WITHOUT_HEADERS),
  { url: API_BASE_URL, retries: DEFAULT_RETRIES, token: DEFAULT_AUTH_TOKEN },
  "normalizeConfig: did not fall back to guest_token when headers are missing",
);

assert.doesNotThrow(
  () => normalizeConfig(null),
  "normalizeConfig: should not throw when rawConfig is null (per assignment DoD)",
);
assert.deepStrictEqual(
  normalizeConfig(null),
  { url: undefined, retries: DEFAULT_RETRIES, token: DEFAULT_AUTH_TOKEN },
  "normalizeConfig: did not return safe defaults when rawConfig is null",
);

assert.doesNotThrow(
  () => normalizeConfig(undefined),
  "normalizeConfig: should not throw when rawConfig is undefined (per assignment DoD)",
);

assert.throws(
  () => normalizeConfig(INVALID_RAW_CONFIG),
  TypeError,
  "normalizeConfig: should throw when rawConfig is not an object (Fail Fast on invalid type)",
);
