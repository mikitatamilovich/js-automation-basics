import assert from "node:assert";

const data = [
  { id: 1, label: "Phone", rawPrice: "1 500 $", amount: 2, status: "in_stock" },
];

function parseRawPrice(str) {
  if (str === null || str === undefined) {
    return 0;
  }
  const cleaned = String(str).replace(/[^\d]/g, "");
  if (cleaned === "") return 0;

  return Number(cleaned);
}

function getAvailableFor(items) {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].status === "in_stock") {
      result.push(items[i]);
    }
  }
  return result;
}

function getAvailable(items) {
  return items.filter((item) => item.status === "in_stock");
}

function getLabelsUpperFor(items) {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    result.push(items[i].label.toUpperCase());
  }
  return result;
}

function getLabelsUpper(items) {
  return items.map((item) => item.label.toUpperCase());
}

function getTotalFor(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += parseRawPrice(items[i].rawPrice) * items[i].amount;
  }
  return total;
}

function getTotal(items) {
  return items.reduce(
    (sum, item) => sum + parseRawPrice(item.rawPrice) * item.amount,
    0,
  );
}

assert.strictEqual(
  parseRawPrice("1 500 $"),
  1500,
  "Clean: не убрал пробелы и $ правильно!",
);
assert.strictEqual(parseRawPrice(null), 0, "Clean: не защитился от null!");
assert.strictEqual(
  parseRawPrice(undefined),
  0,
  "Clean: не защитился от undefined!",
);

assert.deepStrictEqual(
  getAvailableFor(data),
  getAvailable(data),
  "Filter: for-версия и Array-версия работают по-разному!",
);

assert.deepStrictEqual(
  getLabelsUpperFor(data),
  getLabelsUpper(data),
  "Transform: for-версия и Array-версия работают по-разному!",
);

assert.strictEqual(
  getTotalFor(data),
  getTotal(data),
  "Aggregate: for-версия и Array-версия работают по-разному!",
);

console.log("Все проверки прошли успешно!");
console.log("Available (for):", getAvailableFor(data));
console.log("Available (filter):", getAvailable(data));
console.log("Labels (for):", getLabelsUpperFor(data));
console.log("Labels (map):", getLabelsUpper(data));
console.log("Total (for):", getTotalFor(data));
console.log("Total (reduce):", getTotal(data));
