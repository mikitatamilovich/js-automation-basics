import assert from "node:assert";
import { normalizeConfig } from "./utils/config.js";

const rawConfig = {
  apiBase: "https://shop.com/api",
  headers: { auth: { token: "x-token-123" } },
};

assert.deepStrictEqual(
  normalizeConfig(rawConfig),
  { url: "https://shop.com/api", retries: 3, token: "x-token-123" },
  "normalizeConfig: happy path does not match expected shape",
);

assert.deepStrictEqual(
  normalizeConfig({ apiBase: "https://shop.com/api" }),
  { url: "https://shop.com/api", retries: 3, token: "guest_token" },
  "normalizeConfig: did not fall back to guest_token when headers are missing",
);

assert.doesNotThrow(
  () => normalizeConfig(null),
  "normalizeConfig: throws when rawConfig is null",
);
assert.deepStrictEqual(
  normalizeConfig(null),
  { url: undefined, retries: 3, token: "guest_token" },
  "normalizeConfig: did not return safe defaults when rawConfig is null",
);

assert.doesNotThrow(
  () => normalizeConfig(undefined),
  "normalizeConfig: throws when rawConfig is undefined",
);
