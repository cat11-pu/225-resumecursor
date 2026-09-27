import fs from "node:fs";
import { advanceCursor } from "./cursor.js";
import { replayChain } from "./resume.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/batches.json", "utf8"));
const view = render(spec);

emit("游标终值 =", view.cursor);
emit("推进条数 =", view.applied);
emit("重复条数 =", view.duplicates);
emit("缺口位置列表 =", JSON.stringify(view.gaps));
emit("缺口缺条合计 =", view.missing);
emit("重放后游标 =", view.replay_cursor);
emit("重放推进条数 =", view.replay_applied);
emit("重放重复条数 =", view.replay_duplicates);
emit("批条数 =", view.count);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  replayChain({ cursor: 0, batches: [-1] });
  emit("序号写错的错误码", "没有报错");
} catch (error) {
  emit("序号写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  replayChain({ cursor: 0, batches: [2, 1] });
  emit("乱序写错的错误码", "没有报错");
} catch (error) {
  emit("乱序写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "游标终值": 5,
  "推进条数": 2,
  "重复条数": 1,
  "缺口位置列表": [
    4,
    5
  ],
  "缺口缺条合计": 3,
  "重放后游标": 5,
  "重放推进条数": 0,
  "重放重复条数": 3,
  "批条数": 5,
  "序号写错的错误码": "E_BAD_SEQ",
  "乱序写错的错误码": "E_OUT_OF_ORDER"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
