/**
 * Waits for some time.
 * @param {number} ms - time in milliseconds
 * @returns {Promise<void>} resolves after ms
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
