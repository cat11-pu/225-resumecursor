import assert from "node:assert";
import { advanceCursor } from "../cursor.js";
import { replayChain } from "../resume.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("advanceCursor returns a cursor", () => {
  assert.strictEqual(typeof advanceCursor(0, 1).cursor, "number");
});

check("advanceCursor returns a kind", () => {
  assert.strictEqual(typeof advanceCursor(0, 1).kind, "string");
});

check("replayChain returns gaps", () => {
  assert.ok(Array.isArray(replayChain({ cursor: 0, batches: [] }).gaps));
});

check("render exposes order flag", () => {
  assert.strictEqual(typeof render({ cursor: 0, batches: [] }).order_ok, "boolean");
});

check("render counts batches", () => {
  assert.strictEqual(typeof render({ cursor: 0, batches: [] }).count, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
