/**
 * Parses a raw price string into a clean number.
 * @param {string|null|undefined} rawPrice - raw price value from the backend
 * @returns {number} clean numeric price, or 0 if it cannot be parsed
 */
export function parseRawPrice(rawPrice) {
  if (rawPrice === null || rawPrice === undefined) {
    return 0;
  }
  if (typeof rawPrice === "number") {
    return rawPrice;
  }
  const digitsOnly = String(rawPrice).replace(/[^\d]/g, "");
  return digitsOnly === "" ? 0 : Number(digitsOnly);
}
