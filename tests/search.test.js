// 検索のテストです。実行: node tests/search.test.js
"use strict";
const assert = require("assert");
const path = require("path");
const S = require("../search.js");
const free = require(path.join(__dirname, "..", "data", "exercises.json"));
const wger = require(path.join(__dirname, "..", "data", "wger.json"));
const data = free.concat(wger);
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
t("wger の種目を取り込んでいる (合わせて 1,500 種目以上)", () => assert.ok(wger.length > 500 && data.length > 1500));
t("id が重ならない", () => assert.strictEqual(new Set(data.map((e) => e.id)).size, data.length));
t("名前が重ならない (大文字小文字・記号を無視)", () => {
  const k = data.map((e) => e.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
  assert.strictEqual(new Set(k).size, k.length);
});
t("wger の種目は全部に出典・ライセンスがある", () => {
  wger.forEach((e) => assert.ok(e.attribution && e.attribution.url && e.attribution.licenses.length && e.attribution.licenses.every((l) => l.name && l.url), e.id));
});
t("wger の画像は https の wger.de だけ", () => {
  wger.forEach((e) => [...e.images, e.thumb].filter(Boolean).forEach((u) => assert.ok(u.startsWith("https://wger.de/"), u)));
});
t("筋肉の無い wger の種目は大まかな部位で PFC に渡す", () => {
  const u = new URL(S.pfcUrl({ name: "X", primaryMuscles: [], bodyPart: "legs" }));
  assert.strictEqual(u.searchParams.get("muscle"), "脚");
  wger.forEach((e) => assert.ok(S.PFC_MUSCLE[e.primaryMuscles[0]] || S.PFC_BODYPART[e.bodyPart], e.id));
});
t("日本語の「脚」で wger の legs も当たる", () => {
  assert.ok(S.search(idx, "脚", {}).some((e) => e.source === "wger" && !e.primaryMuscles.length));
});
t("「背中」は種目名の back には当たらない", () => {
  assert.ok(!names("背中").includes("Backward Medicine Ball Throw"));
});
t("部位で絞ると、筋肉の無い wger の種目も大まかな部位で拾う", () => {
  const r = S.search(idx, "", { muscle: "lats" });
  assert.ok(r.some((e) => e.source === "wger" && !e.primaryMuscles.length && e.bodyPart === "back"));
  assert.ok(!r.some((e) => e.source === "wger" && !e.primaryMuscles.length && e.bodyPart !== "back"));
});
console.log(`${n} tests passed`);
