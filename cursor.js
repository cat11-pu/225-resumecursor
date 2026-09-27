// cursor.js：推一格游标。kind 三值：advance 正好接在游标后面（推进）、
// duplicate 不超过游标（重传，不动）、gap 跳过两格以上（缺口，不动）。
export function advanceCursor(cursor, seq) {
  if (seq === cursor + 1) {
    return { cursor: seq, kind: "advance" };
  }
  if (seq <= cursor) {
    return { cursor: cursor, kind: "duplicate" };
  }
  return { cursor: cursor, kind: "gap" };
}
