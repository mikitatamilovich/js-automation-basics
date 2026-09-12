import { DEFAULT_RETRIES, DEFAULT_AUTH_TOKEN } from "../../config/constants.js";

/**
 * Normalizes a raw backend config into a flat, predictable shape.
 * @param {Object|null|undefined} [rawConfig]
 * @returns {{url: string|undefined, retries: number, token: string}}
 */

export function normalizeConfig(rawConfig) {
  const { apiBase, retries = DEFAULT_RETRIES, headers } = rawConfig ?? {};
  const token = headers?.auth?.token ?? DEFAULT_AUTH_TOKEN;

  return {
    url: apiBase,
    retries,
    token,
  };
}
