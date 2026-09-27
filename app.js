// app.js：渲染结果
import { advanceCursor } from "./cursor.js";
import { replayChain } from "./resume.js";

export function render(spec) {
  const batches = spec.batches || [];
  const view = replayChain(spec);
  const cursor = view.cursor || 0;
  const gaps = view.gaps || [];
  const again = replayChain({ cursor: cursor, batches: batches });
  return { cursor: cursor, applied: view.applied || 0, duplicates: view.duplicates || 0,
           gaps: gaps, missing: view.missing || 0, kinds: view.kinds || [],
           first_gap_at: gaps.length ? gaps[0] : 0, order_ok: view.order_ok !== false,
           count: batches.length, replay_cursor: again.cursor || 0,
           replay_applied: again.applied || 0, replay_duplicates: again.duplicates || 0,
           tail: advanceCursor(0, 1).cursor };
}
