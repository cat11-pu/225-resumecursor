// cursor.js：推一格游标。正好接在游标后面才推进，其余原样返回游标。
function badSeq(message) {
  const error = new Error(message);
  error.code = "E_BAD_SEQ";
  return error;
}

export function advanceCursor(cursor, seq) {
  if (!Number.isInteger(cursor) || cursor < 0) throw badSeq("cursor 不是非负整数");
  if (!Number.isInteger(seq) || seq < 0) throw badSeq("seq 不是非负整数");
  if (seq === cursor + 1) return { cursor: seq, kind: "advance" };
  if (seq <= cursor) return { cursor: cursor, kind: "duplicate" };
  return { cursor: cursor, kind: "gap" };
}
