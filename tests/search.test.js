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
t("詳しい説明は実在する種目に付き、日英とも揃っている", () => {
  const guides = require(path.join(__dirname, "..", "data", "guides.json"));
  const byId = new Map(data.map((e) => [e.id, e]));
  const ids = Object.keys(guides);
  assert.ok(ids.length > 400);
  for (const id of ids) {
    const e = byId.get(id);
    assert.ok(e, id);
    for (const L of ["en", "ja"]) {
      const g = guides[id][L];
      assert.ok(g.setup && g.steps.length >= 3 && g.tips.length >= 2, id + L);
    }
  }
});
t("画像のない種目には全部、説明が付いている", () => {
  const g = require(path.join(__dirname, "..", "data", "guides.json"));
  wger.filter((e) => !e.images.length).forEach((e) => assert.ok(g[e.id], e.id));
});
t("説明文が 1 つもない種目は無い", () => {
  const g = require(path.join(__dirname, "..", "data", "guides.json"));
  data.forEach((e) => assert.ok((e.instructions || []).length || g[e.id], e.id));
});
// ---- 「ここを鍛えたい」検索 ----
const muscleOf = (q) => S.parseQuery(q).flatMap((g) => g.terms || []);
t("「二の腕を引き締めたい」は上腕三頭筋として探す", () => {
  assert.deepStrictEqual(muscleOf("二の腕を引き締めたい"), ["triceps"]);
  assert.ok(S.search(idx, "二の腕を引き締めたい", {}).slice(0, 20).every((e) => e.primaryMuscles.includes("triceps")));
});
t("「お腹を鍛えたい」「太ももの裏を鍛えたい」", () => {
  assert.deepStrictEqual(muscleOf("お腹を鍛えたい"), ["abdominals"]);
  assert.deepStrictEqual(muscleOf("太ももの裏を鍛えたい"), ["hamstrings"]);
});
t("中国語「想练臀部」「我想练背」", () => {
  assert.deepStrictEqual(muscleOf("想练臀部"), ["glutes"]);
  assert.ok(muscleOf("我想练背").includes("lats"));
  assert.ok(S.search(idx, "想练臀部", {}).slice(0, 20).every((e) => e.primaryMuscles.includes("glutes")));
});
t("英語「I want to train my back」「abs at home」", () => {
  assert.ok(muscleOf("I want to train my back").includes("lats"));
  const g = S.parseQuery("abs at home");
  assert.strictEqual(g.length, 2);
  S.search(idx, "abs at home", {}).forEach((e) => assert.strictEqual(e.equipment, "body only"));
});
t("部位で探したときは主に使う筋肉が一致するものが上", () => {
  const r = S.search(idx, "お尻", {});
  assert.ok(r.slice(0, 30).every((e) => e.primaryMuscles.includes("glutes") || e.bodyPart === "legs"));
});
t("種目名の検索は今まで通り (bench press・ベンチプレス・卧推)", () => {
  assert.strictEqual(names("bench press")[0], "Bench Press");
  assert.ok(names("ベンチプレス").length > 0);
  assert.ok(names("卧推").length > 0);
});
t("翻訳した名前でも探せる", () => {
  const ix = S.buildIndex([{ id: "x", name: "Foo Bar", images: [], primaryMuscles: [] }], { x: { ja: { name: "フーバー" }, zh: { name: "富巴" } } });
  assert.strictEqual(S.search(ix, "フーバー", {}).length, 1);
  assert.strictEqual(S.search(ix, "富巴", {}).length, 1);
});
// ---- 翻訳データ ----
const i18n = require(path.join(__dirname, "..", "data", "i18n.json"));
const guidesAll = require(path.join(__dirname, "..", "data", "guides.json"));
t("全種目に日本語・中国語の名前がある", () => {
  data.forEach((e) => assert.ok(i18n[e.id] && i18n[e.id].ja.name && i18n[e.id].zh.name, e.id));
});
t("翻訳した手順は原文と同じ数", () => {
  data.forEach((e) => {
    if (!(e.instructions || []).length) return;
    // もともと AI の説明があった種目は、元の手順を翻訳していないことがあります (画面は英語の原文を出します)。
    for (const L of ["ja", "zh"]) if (guidesAll[e.id] && !(i18n[e.id][L].steps || []).length) return;
    for (const L of ["ja", "zh"]) assert.strictEqual((i18n[e.id][L].steps || []).length, (e.instructions || []).length, e.id + L);
  });
});
t("中国語にかなが混じっていない", () => {
  const kana = /[ぁ-んァ-ヶ]/;
  for (const t of Object.values(i18n)) {
    assert.ok(!kana.test(t.zh.name), t.zh.name);
    (t.zh.steps || []).forEach((s) => assert.ok(!kana.test(s), s));
  }
  for (const g of Object.values(guidesAll)) [g.zh.note || "", g.zh.setup, ...g.zh.steps, ...g.zh.tips, g.zh.breathing || "", ...(g.zh.focus || [])].forEach((s) => assert.ok(!kana.test(s), s));
});
t("新しい形の説明 (呼吸・効かせるコツ付き) は 3 言語とも同じ数で揃っている", () => {
  const v2 = Object.entries(guidesAll).filter(([, g]) => g.en.focus);
  assert.ok(v2.length > 300);
  for (const [id, g] of v2) {
    for (const L of ["en", "ja", "zh"]) {
      assert.ok(g[L].breathing && g[L].focus.length >= 3 && g[L].steps.length >= 5, id + L);
      assert.strictEqual(g[L].focus.length, g.en.focus.length, id + L);
    }
  }
});
t("AI の説明は 3 言語そろっている", () => {
  for (const [id, g] of Object.entries(guidesAll)) for (const L of ["en", "ja", "zh"]) assert.ok(g[L] && g[L].setup && g[L].steps.length >= 3, id + L);
});
t("翻訳した名前で探せる (日本語・中国語)", () => {
  const ix = S.buildIndex(data, i18n);
  assert.ok(S.search(ix, "ベンチプレス", {}).length > 0);
  assert.ok(S.search(ix, "卧推", {}).length > 0);
  assert.ok(S.search(ix, i18n["Barbell_Squat"].zh.name, {}).some((e) => e.id === "Barbell_Squat"));
});
console.log(`${n} tests passed`);
