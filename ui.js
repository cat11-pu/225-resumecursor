// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "批 " + (spec.batches || []).length + " 条，游标起点 " + (spec.cursor || 0) + "。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (spec.batches || []).forEach(function (seq, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "第 " + (spot + 1) + " 条 " + seq;
      row.appendChild(head);
      const mark = document.createElement("span");
      const kind = (view.kinds || [])[spot];
      mark.className = "chip" + (kind === "advance" ? " ok" : (kind === "gap" ? " bad" : ""));
      mark.textContent = kind === "advance" ? "推进" : (kind === "gap" ? "缺口" : "重传");
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "游标 " + view.cursor + "，推进 " + view.applied + " 条，重传 " + view.duplicates
      + " 条，缺 " + view.missing + " 条";
    parts.log.textContent = view.count + " 条批，" + (view.order_ok ? "顺序合法" : "顺序有问题");
  }

  const valueInput = document.createElement("input");
  valueInput.type = "number";
  valueInput.value = "6";
  parts.controls.appendChild(valueInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "跑一遍";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一个序号";
  addButton.addEventListener("click", function () {
    const next = Number(valueInput.value);
    spec.batches = (spec.batches || []).concat([Number.isFinite(next) ? next : 0]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const replayButton = document.createElement("button");
  replayButton.textContent = "拿终值游标重放同一批";
  replayButton.addEventListener("click", function () {
    try {
      spec.cursor = render(spec).cursor;
    } catch (error) {
      parts.log.textContent = "重放前先跑通：" + String(error && error.message ? error.message : error);
      return;
    }
    draw();
  });
  parts.controls.appendChild(replayButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一个序号";
  dropButton.addEventListener("click", function () {
    spec.batches = (spec.batches || []).slice(0, Math.max(0, (spec.batches || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  draw();
}
