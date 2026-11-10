// 検索のテストです。実行: node tests/search.test.js
"use strict";
const assert = require("assert");
const path = require("path");
const S = require("../search.js");
const data = require(path.join(__dirname, "..", "data", "exercises.json"));
const idx = S.buildIndex(data);
const names = (q, f) => S.search(idx, q, f).map((e) => e.name);

let n = 0;
function t(label, fn) { fn(); n++; console.log("ok", label); }

t("空の検索は全件", () => assert.strictEqual(S.search(idx, "", {}).length, data.length));
t("英語の種目名", () => assert.ok(names("bench press").some((x) => /Bench Press/i.test(x))));
t("名前が先頭一致するものが上", () => assert.ok(/^Barbell/i.test(names("barbell")[0])));
t("日本語の種目名", () => assert.ok(names("ベンチプレス").length > 0));
t("日本語の部位+器具 (空白あり)", () => {
  const r = S.search(idx, "胸 ダンベル", {});
  assert.ok(r.length > 0);
  r.forEach((e) => assert.ok(e.equipment === "dumbbell" || /dumbbell/i.test(e.name)));
});
t("日本語の部位+器具 (空白なし)", () => assert.deepStrictEqual(names("胸ダンベル"), names("胸 ダンベル")));
t("push up と pushup の両方で当たる", () => {
  assert.ok(names("pushup").length > 0);
  assert.ok(names("push up").length > 0);
});
t("器具の絞り込み", () => {
  S.search(idx, "", { equipment: "body only" }).forEach((e) => assert.strictEqual(e.equipment, "body only"));
});
t("器具なしデータは none で絞れる", () => assert.ok(S.search(idx, "", { equipment: "none" }).length > 0));
t("部位の絞り込み (主働筋のみ / 協働筋も)", () => {
  const a = S.search(idx, "", { muscle: "glutes" }).length;
  const b = S.search(idx, "", { muscle: "glutes", includeSecondary: true }).length;
  assert.ok(a > 0 && b > a);
});
t("当たらない言葉は 0 件", () => assert.strictEqual(names("zzzqqq").length, 0));
t("データの全部位が PFC計算ツールの部位に読み替えられる", () => {
  data.forEach((e) => (e.primaryMuscles || []).forEach((m) => assert.ok(S.PFC_MUSCLE[m], m)));
});
t("PFC計算ツールへの URL", () => {
  const u = new URL(S.pfcUrl({ name: "Barbell Bench Press - Medium Grip", primaryMuscles: ["chest"] }));
  assert.strictEqual(u.origin + u.pathname, "https://nebourocket.github.io/pfc-calculator/");
  assert.strictEqual(u.searchParams.get("exercise"), "Barbell Bench Press - Medium Grip");
  assert.strictEqual(u.searchParams.get("muscle"), "胸");
});
console.log(`${n} tests passed`);
