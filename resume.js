// resume.js：断点续传与重放（基线：游标不动）
import { advanceCursor } from "./cursor.js";

export function replayChain(spec) {
  return { cursor: spec.cursor || 0, applied: 0, duplicates: 0, gaps: [], missing: 0,
           kinds: [], order_ok: true };
}
