// 検索のしくみ (画面に依存しない純粋な関数だけを置いています)。
// ブラウザでは window.ExSearch、Node では require() で同じものを使えます。
(function (root) {
  "use strict";

  // 日本語で検索されたときに、データ側の英語の言葉へ読み替える辞書です。
  // 左が日本語、右がデータに出てくる英語 (複数可) です。
  const JA_SYNONYMS = {
    // 部位
    "胸": ["chest"], "大胸筋": ["chest"], "胸筋": ["chest"],
    "肩": ["shoulders"], "三角筋": ["shoulders"],
    "腹": ["abdominals"], "腹筋": ["abdominals"], "体幹": ["abdominals"], "腹斜筋": ["abdominals"],
    "背中": ["lats", "middle back", "lower back"], "背筋": ["lats", "middle back", "lower back"],
    "広背筋": ["lats"], "僧帽筋": ["traps"], "腰": ["lower back"],
    "上腕二頭筋": ["biceps"], "二頭": ["biceps"], "力こぶ": ["biceps"],
    "上腕三頭筋": ["triceps"], "三頭": ["triceps"], "腕": ["biceps", "triceps", "forearms"],
    "前腕": ["forearms"], "握力": ["forearms"],
    "脚": ["quadriceps", "hamstrings", "calves", "glutes"], "足": ["quadriceps", "hamstrings", "calves", "glutes"],
    "太もも": ["quadriceps", "hamstrings"], "大腿四頭筋": ["quadriceps"], "四頭": ["quadriceps"],
    "ハムストリング": ["hamstrings"], "ハム": ["hamstrings"], "もも裏": ["hamstrings"],
    "ふくらはぎ": ["calves"], "カーフ": ["calf", "calves"],
    "尻": ["glutes"], "お尻": ["glutes"], "臀部": ["glutes"], "大臀筋": ["glutes"],
    "内転筋": ["adductors"], "内もも": ["adductors"], "外転筋": ["abductors"], "首": ["neck"],
    // 器具
    "ダンベル": ["dumbbell"], "バーベル": ["barbell"], "自重": ["body only"], "器具なし": ["body only"],
    "ケーブル": ["cable"], "マシン": ["machine"], "ケトルベル": ["kettlebells"],
    "チューブ": ["bands"], "バンド": ["bands"], "メディシンボール": ["medicine ball"],
    "バランスボール": ["exercise ball"], "フォームローラー": ["foam roll"], "ezバー": ["e-z curl bar"],
    // 種類
    "ストレッチ": ["stretch", "stretching"], "有酸素": ["cardio"], "プライオメトリクス": ["plyometrics"],
    "パワーリフティング": ["powerlifting"], "ウエイトリフティング": ["olympic weightlifting"],
    "ストロングマン": ["strongman"],
    // よく使う種目名
    "ベンチプレス": ["bench press"], "ベンチ": ["bench"], "スクワット": ["squat"],
    "デッドリフト": ["deadlift"], "懸垂": ["pull-up", "pullup", "chin-up"], "チンニング": ["chin-up", "pull-up"],
    "プルアップ": ["pull-up", "pullup"], "腕立て": ["push-up", "pushup"], "腕立て伏せ": ["push-up", "pushup"],
    "プッシュアップ": ["push-up", "pushup"], "ランジ": ["lunge"], "カール": ["curl"],
    "プレス": ["press"], "ロウ": ["row"], "ロー": ["row"], "フライ": ["fly", "flye"],
    "レイズ": ["raise"], "クランチ": ["crunch"], "プランク": ["plank"], "ディップス": ["dip"],
    "シュラッグ": ["shrug"], "エクステンション": ["extension"], "スナッチ": ["snatch"],
    "クリーン": ["clean"], "ジャーク": ["jerk"], "ヒップスラスト": ["hip thrust"],
    "ブリッジ": ["bridge"], "ジャンプ": ["jump"], "スイング": ["swing"],
  };

  // 比べやすい形にそろえます (小文字、記号を空白に、全角英数を半角に)。
  function normalize(s) {
    return String(s || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[-_/()'",.]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 1 種目ぶんの「探される文字列」を前もって作っておきます。
  function buildIndex(exercises) {
    return exercises.map((ex) => {
      const name = normalize(ex.name);
      const rest = normalize([
        ex.category, ex.equipment, ex.level, ex.force, ex.mechanic,
        ...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || []),
      ].filter(Boolean).join(" "));
      return { ex, name, hay: name + " | " + rest };
    });
  }

  // 検索語を「どれか 1 つが当たればよい候補」の組に分けます。
  // 例: "胸 ダンベル" → [["chest"], ["dumbbell"]] (両方とも当たる必要がある)
  function parseQuery(q) {
    const nq = String(q || "").normalize("NFKC").toLowerCase().trim();
    if (!nq) return [];
    const groups = [];
    for (const raw of nq.split(/\s+/)) {
      const ja = JA_SYNONYMS[raw];
      if (ja) {
        groups.push(ja.map(normalize));
        continue;
      }
      // 「胸ダンベル」のように空白なしでつながった日本語も、辞書の言葉で切り分けます。
      const pieces = splitJapanese(raw);
      if (pieces) {
        for (const p of pieces) groups.push(JA_SYNONYMS[p].map(normalize));
        continue;
      }
      const t = normalize(raw);
      if (t) groups.push([t]);
    }
    return groups;
  }

  // 辞書の言葉だけで言い切れるときに限り、長い言葉から順に切り分けます。言い切れなければ null です。
  const JA_KEYS = Object.keys(JA_SYNONYMS).sort((a, b) => b.length - a.length);
  function splitJapanese(s) {
    if (!/[^\x00-\x7f]/.test(s)) return null;
    const out = [];
    let i = 0;
    while (i < s.length) {
      const k = JA_KEYS.find((key) => s.startsWith(key, i));
      if (!k) return null;
      out.push(k);
      i += k.length;
    }
    return out;
  }

  // 候補のどれかが含まれていれば当たりです。"push up" は "pushup" とも比べます。
  function hit(hay, alts) {
    return alts.some((a) => hay.includes(a) || hay.replace(/ /g, "").includes(a.replace(/ /g, "")));
  }

  const FILTER_KEYS = ["muscle", "equipment", "category", "level", "force", "mechanic"];

  function passFilters(ex, f) {
    if (f.muscle) {
      const ms = f.includeSecondary
        ? [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]
        : ex.primaryMuscles || [];
      if (!ms.includes(f.muscle)) return false;
    }
    if (f.equipment && (ex.equipment || "none") !== f.equipment) return false;
    for (const k of ["category", "level", "force", "mechanic"]) {
      if (f[k] && ex[k] !== f[k]) return false;
    }
    return true;
  }

  // 検索して、名前に当たったものほど上に並べて返します。
  function search(index, q, filters) {
    const groups = parseQuery(q);
    const f = filters || {};
    const out = [];
    for (const row of index) {
      if (!passFilters(row.ex, f)) continue;
      if (!groups.every((alts) => hit(row.hay, alts))) continue;
      let score = 0;
      for (const alts of groups) {
        if (alts.some((a) => row.name.startsWith(a))) score += 3;
        else if (hit(row.name, alts)) score += 2;
      }
      out.push({ ex: row.ex, score });
    }
    out.sort((a, b) => b.score - a.score || a.ex.name.localeCompare(b.ex.name));
    return out.map((r) => r.ex);
  }

  // PFC計算ツール (https://nebourocket.github.io/pfc-calculator/) の筋トレ記録へ渡すための読み替えです。
  // あちらの部位は 胸・背中・脚・肩・腕・腹・その他 の 7 つなので、主働筋の 1 つめで決めます。
  const PFC_URL = "https://nebourocket.github.io/pfc-calculator/";
  const PFC_MUSCLE = {
    chest: "胸",
    lats: "背中", "middle back": "背中", "lower back": "背中", traps: "背中",
    quadriceps: "脚", hamstrings: "脚", calves: "脚", glutes: "脚", adductors: "脚", abductors: "脚",
    shoulders: "肩",
    biceps: "腕", triceps: "腕", forearms: "腕",
    abdominals: "腹",
    neck: "その他",
  };
  function pfcUrl(ex) {
    const p = new URLSearchParams();
    p.set("exercise", String(ex.name).slice(0, 40));
    p.set("muscle", PFC_MUSCLE[(ex.primaryMuscles || [])[0]] || "その他");
    return PFC_URL + "?" + p.toString();
  }

  const api = { JA_SYNONYMS, FILTER_KEYS, PFC_MUSCLE, normalize, buildIndex, parseQuery, search, pfcUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ExSearch = api;
})(typeof window !== "undefined" ? window : globalThis);
