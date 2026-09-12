import assert from "node:assert";
import { parseRawPrice } from "./utils/parsers.js";
import {
  getAvailableFor,
  getAvailable,
  getLabelsUpperFor,
  getLabelsUpper,
  getTotalFor,
  getTotal,
} from "./utils/inventory.js";

const data = [
  { id: 1, label: "Phone", rawPrice: "1 500 $", amount: 2, status: "in_stock" },
];

assert.strictEqual(
  parseRawPrice("1 500 $"),
  1500,
  "Clean: failed to strip spaces and currency sign correctly",
);
assert.strictEqual(parseRawPrice(null), 0, "Clean: did not guard against null");
assert.strictEqual(
  parseRawPrice(undefined),
  0,
  "Clean: did not guard against undefined",
);

assert.deepStrictEqual(
  getAvailableFor(data),
  getAvailable(data),
  "Filter: for-loop and array-method versions return different results",
);
assert.deepStrictEqual(
  getLabelsUpperFor(data),
  getLabelsUpper(data),
  "Transform: for-loop and array-method versions return different results",
);
assert.strictEqual(
  getTotalFor(data),
  getTotal(data),
  "Aggregate: for-loop and array-method versions return different results",
);
