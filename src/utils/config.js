import { DEFAULT_RETRIES, DEFAULT_AUTH_TOKEN } from "../../config/constants.js";

/**
 * Normalizes a raw backend config into a flat, predictable shape.
 * Missing config (null/undefined) is an expected case and falls back to
 * safe defaults, per the assignment spec. A value of the wrong type is
 * treated as an invalid argument and throws (Fail Fast).
 * @param {Object|null|undefined} [rawConfig]
 * @returns {{url: string|undefined, retries: number, token: string}}
 * @throws {TypeError} if rawConfig is neither null/undefined nor a plain object
 */
export function normalizeConfig(rawConfig) {
  const isMissing = rawConfig === null || rawConfig === undefined;
  const isPlainObject =
    typeof rawConfig === "object" && !Array.isArray(rawConfig);

  if (!isMissing && !isPlainObject) {
    throw new TypeError(
      "normalizeConfig: rawConfig must be an object, null, or undefined",
    );
  }

  const { apiBase, retries = DEFAULT_RETRIES, headers } = rawConfig ?? {};
  const token = headers?.auth?.token ?? DEFAULT_AUTH_TOKEN;

  return {
    url: apiBase,
    retries,
    token,
  };
}
