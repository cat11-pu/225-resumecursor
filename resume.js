// resume.js：断点续传与重放。整批一次扫描流水处理，每条只判一次。
import { advanceCursor } from "./cursor.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isSeq(value) {
  return Number.isInteger(value) && value >= 0;
}

export function replayChain(spec) {
  const seqCode = (spec && spec.seq_error_code) || "E_BAD_SEQ";
  const orderCode = (spec && spec.order_error_code) || "E_OUT_OF_ORDER";
  const start = spec && spec.cursor;
  if (!isSeq(start)) {
    throw fail(seqCode, "cursor 不是非负整数: " + String(start));
  }
  const batches = (spec && spec.batches) || [];
  let cursor = start;
  let applied = 0;
  let duplicates = 0;
  let missing = 0;
  const gaps = [];
  const kinds = [];
  let prev = -1;
  for (let i = 0; i < batches.length; i += 1) {
    const seq = batches[i];
    if (!isSeq(seq)) {
      throw fail(seqCode, "序号不是非负整数: " + String(seq));
    }
    if (seq < prev) {
      throw fail(orderCode, "序号回落: " + prev + " -> " + seq);
    }
    prev = seq;
    const step = advanceCursor(cursor, seq);
    kinds.push(step.kind);
    if (step.kind === "advance") {
      applied += 1;
      cursor = step.cursor;
    } else if (step.kind === "duplicate") {
      duplicates += 1;
    } else {
      gaps.push(i + 1);
      missing += seq - cursor - 1;
    }
  }
  return { cursor: cursor, applied: applied, duplicates: duplicates, gaps: gaps,
           missing: missing, kinds: kinds, order_ok: true };
}
