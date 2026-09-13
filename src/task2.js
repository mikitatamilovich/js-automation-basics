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

const RAW_PRICE_SAMPLE = "1 500 $";
const PARSED_PRICE_SAMPLE = 1500;

const INVENTORY_ITEM_ID = 1;
const INVENTORY_ITEM_LABEL = "Phone";
const INVENTORY_ITEM_AMOUNT = 2;
const INVENTORY_ITEM_STATUS = "in_stock";

const INVENTORY_DATA = [
  {
    id: INVENTORY_ITEM_ID,
    label: INVENTORY_ITEM_LABEL,
    rawPrice: RAW_PRICE_SAMPLE,
    amount: INVENTORY_ITEM_AMOUNT,
    status: INVENTORY_ITEM_STATUS,
  },
];

assert.strictEqual(
  parseRawPrice(RAW_PRICE_SAMPLE),
  PARSED_PRICE_SAMPLE,
  "Clean: failed to strip spaces and currency sign correctly",
);
assert.strictEqual(parseRawPrice(null), 0, "Clean: did not guard against null");
assert.strictEqual(
  parseRawPrice(undefined),
  0,
  "Clean: did not guard against undefined",
);

assert.deepStrictEqual(
  getAvailableFor(INVENTORY_DATA),
  getAvailable(INVENTORY_DATA),
  "Filter: for-loop and array-method versions return different results",
);
assert.deepStrictEqual(
  getLabelsUpperFor(INVENTORY_DATA),
  getLabelsUpper(INVENTORY_DATA),
  "Transform: for-loop and array-method versions return different results",
);
assert.strictEqual(
  getTotalFor(INVENTORY_DATA),
  getTotal(INVENTORY_DATA),
  "Aggregate: for-loop and array-method versions return different results",
);
