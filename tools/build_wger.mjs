// wger (https://wger.de) の公式 API から種目を取り、free-exercise-db と同じ形にそろえて data/wger.json に書き出します。
// 実行: node tools/build_wger.mjs   (そのあと node tests/search.test.js で確かめます)
// wger のデータは種目ごとに CC-BY-SA 3/4 または CC0 です。出典・ライセンス・作者は各種目の attribution に残します。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://wger.de/api/v2/exerciseinfo/?limit=200";
const EN = 2; // wger の英語の language id です。

// wger の筋肉名 → free-exercise-db の筋肉名。前鋸筋は対応する区分が無いので外します。
const MUSCLE = {
  Glutes: "glutes", Lats: "lats", Shoulders: "shoulders", Quads: "quadriceps", Chest: "chest",
  Abs: "abdominals", "Obliquus externus abdominis": "abdominals", Biceps: "biceps", Brachialis: "biceps",
  Triceps: "triceps", Trapezius: "traps", Hamstrings: "hamstrings", Calves: "calves", Soleus: "calves",
};
// 器具は 1 つにまとめます。上ほど優先です (ベンチやマットは「台」なので、ほかの器具があればそちらにします)。
const EQUIPMENT = [
  ["Barbell", "barbell"], ["SZ-Bar", "e-z curl bar"], ["Dumbbell", "dumbbell"], ["Kettlebell", "kettlebells"],
  ["Cable machine", "cable"], ["Resistance band", "bands"], ["Swiss Ball", "exercise ball"],
  ["Pull-up bar", "pull-up bar"], ["Bench", "bench"], ["Incline bench", "bench"], ["Gym mat", "body only"],
  ["none (bodyweight exercise)", "body only"],
];

function decode(s) {
  return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}
// 説明の HTML を手順の配列にします (<li> か <p> ごとに 1 手順)。
function steps(html) {
  const parts = /<li[\s>]/.test(html) ? html.split(/<li[^>]*>/).slice(1) : html.split(/<\/p>|<br\s*\/?>|\n{2,}/);
  return parts.map((p) => decode(p.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()).filter(Boolean);
}

async function fetchAll(first) {
  const out = [];
  let url = first;
  while (url) {
    const r = await fetch(url, { headers: { "User-Agent": "exercise-search-builder (+https://github.com/nebourocket/exercise-search)" } });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    const j = await r.json();
    out.push(...j.results);
    url = j.next;
  }
  return out;
}

const free = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "exercises.json"), "utf8"));
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const seen = new Set(free.map((e) => key(e.name)));

const raw = await fetchAll(API);
// ライセンスは種目・説明文・画像それぞれに付いているので、id から名前と URL を引けるようにします。
const LICENSES = new Map((await fetchAll("https://wger.de/api/v2/license/")).map((l) => [l.id, l]));
const lic = (id) => LICENSES.get(id);
const out = [];
for (const e of raw) {
  const t = e.translations.find((x) => x.language === EN);
  if (!t || !t.name.trim()) continue;
  const name = t.name.trim();
  if (seen.has(key(name))) continue; // 同じ名前の種目は free-exercise-db の方を残します。
  seen.add(key(name));
  const uniq = (a) => [...new Set(a)];
  const primary = uniq(e.muscles.map((m) => MUSCLE[m.name_en || m.name]).filter(Boolean));
  const secondary = uniq(e.muscles_secondary.map((m) => MUSCLE[m.name_en || m.name]).filter(Boolean))
    .filter((m) => !primary.includes(m));
  const eqNames = e.equipment.map((q) => q.name);
  const eq = EQUIPMENT.find(([w]) => eqNames.includes(w));
  const imgs = e.images.filter((i) => !i.is_ai_generated).sort((a, b) => b.is_main - a.is_main);
  out.push({
    id: `wger-${e.id}`,
    name,
    aliases: (t.aliases || []).map((a) => a.alias).filter(Boolean),
    force: null, level: null, mechanic: null,
    equipment: eq ? eq[1] : null,
    primaryMuscles: primary,
    secondaryMuscles: secondary,
    bodyPart: e.category.name.toLowerCase(),
    instructions: steps(t.description || ""),
    category: e.category.name === "Cardio" ? "cardio" : "strength",
    images: imgs.map((i) => i.image),
    thumb: imgs.length ? (imgs[0].thumbnails && imgs[0].thumbnails.medium) || imgs[0].image : null,
    source: "wger",
    attribution: {
      url: `https://wger.de/en/exercise/${e.id}/view/`,
      // 種目・説明文・画像に付いたライセンスを全部並べます (重なりは 1 つに)。
      licenses: uniq([e.license.id, t.license, ...imgs.map((i) => i.license)].filter((id) => lic(id)))
        .map((id) => ({ name: lic(id).short_name, url: lic(id).url })),
      author: t.license_author || e.license_author || "",
      imageAuthors: uniq(imgs.map((i) => i.license_author).filter(Boolean)),
    },
  });
}
// API の形が変わって空になったときに、黙って空のデータで上書きしないようにします。
if (out.length < 300) throw new Error(`unexpected wger data: only ${out.length} exercises`);
out.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(ROOT, "data", "wger.json"), JSON.stringify(out));
console.log(`wger: ${raw.length} fetched, ${out.length} written (duplicates of free-exercise-db removed)`);
