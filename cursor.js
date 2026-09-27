// cursor.js：推一格游标（基线：一律当重传、游标不动）
export function advanceCursor(cursor, seq) {
  return { cursor: cursor, kind: "duplicate" };
}
