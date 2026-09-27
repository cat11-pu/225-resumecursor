// resume.js：断点续传与重放。整批一次扫描，每条只判一次。
import { advanceCursor } from "./cursor.js";

function badSeq(message) {
  const error = new Error(message);
  error.code = "E_BAD_SEQ";
  return error;
}

function outOfOrder(message) {
  const error = new Error(message);
  error.code = "E_OUT_OF_ORDER";
  return error;
}

export function replayChain(spec) {
  const cursor0 = spec && spec.cursor !== undefined ? spec.cursor : 0;
  const batches = (spec && spec.batches) || [];
  if (!Number.isInteger(cursor0) || cursor0 < 0) throw badSeq("cursor 不是非负整数");
  for (let spot = 0; spot < batches.length; spot += 1) {
    const seq = batches[spot];
    if (!Number.isInteger(seq) || seq < 0) throw badSeq("第 " + (spot + 1) + " 条序号不是非负整数");
    if (spot > 0 && seq < batches[spot - 1]) {
      throw outOfOrder("第 " + (spot + 1) + " 条序号回落");
    }
  }
  let cursor = cursor0;
  let applied = 0;
  let duplicates = 0;
  let missing = 0;
  const gaps = [];
  const kinds = new Array(batches.length);
  for (let spot = 0; spot < batches.length; spot += 1) {
    const step = advanceCursor(cursor, batches[spot]);
    kinds[spot] = step.kind;
    if (step.kind === "advance") {
      applied += 1;
      cursor = step.cursor;
    } else if (step.kind === "duplicate") {
      duplicates += 1;
    } else {
      gaps.push(spot + 1);
      missing += batches[spot] - cursor - 1;
    }
  }
  return { cursor: cursor, applied: applied, duplicates: duplicates, gaps: gaps,
           missing: missing, kinds: kinds, order_ok: true };
}
