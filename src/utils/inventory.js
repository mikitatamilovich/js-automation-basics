import { STATUS_IN_STOCK } from "../../config/constants.js";
import { parseRawPrice } from "./parsers.js";

/**
 * Throws if items is not an array. Shared guard for every function below.
 * @param {unknown} items
 * @throws {TypeError} if items is not an array
 */
function assertIsArray(items) {
  if (!Array.isArray(items)) {
    throw new TypeError("Expected items to be an array");
  }
}

/**
 * Filters in-stock items using a classic for loop.
 * @param {Array<Object>} items
 * @returns {Array<Object>}
 * @throws {TypeError} if items is not an array
 */
export function getAvailableFor(items) {
  assertIsArray(items);
  const result = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].status === STATUS_IN_STOCK) {
      result.push(items[i]);
    }
  }
  return result;
}

/**
 * Filters in-stock items using Array.prototype.filter.
 * @param {Array<Object>} items
 * @returns {Array<Object>}
 * @throws {TypeError} if items is not an array
 */
export function getAvailable(items) {
  assertIsArray(items);
  return items.filter((item) => item.status === STATUS_IN_STOCK);
}

/**
 * Extracts uppercase item labels using a classic for loop.
 * @param {Array<Object>} items
 * @returns {Array<string>}
 * @throws {TypeError} if items is not an array
 */
export function getLabelsUpperFor(items) {
  assertIsArray(items);
  const result = [];
  for (let i = 0; i < items.length; i++) {
    result.push(items[i].label.toUpperCase());
  }
  return result;
}

/**
 * Extracts uppercase item labels using Array.prototype.map.
 * @param {Array<Object>} items
 * @returns {Array<string>}
 * @throws {TypeError} if items is not an array
 */
export function getLabelsUpper(items) {
  assertIsArray(items);
  return items.map((item) => item.label.toUpperCase());
}

/**
 * Calculates the total cart value using a classic for loop.
 * @param {Array<Object>} items
 * @returns {number}
 * @throws {TypeError} if items is not an array
 */
export function getTotalFor(items) {
  assertIsArray(items);
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += parseRawPrice(items[i].rawPrice) * items[i].amount;
  }
  return total;
}

/**
 * Calculates the total cart value using Array.prototype.reduce.
 * @param {Array<Object>} items
 * @returns {number}
 * @throws {TypeError} if items is not an array
 */
export function getTotal(items) {
  assertIsArray(items);
  return items.reduce(
    (sum, item) => sum + parseRawPrice(item.rawPrice) * item.amount,
    0,
  );
}
