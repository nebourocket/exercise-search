// 検索のしくみ (画面に依存しない純粋な関数だけを置いています)。
// ブラウザでは window.ExSearch、Node では require() で同じものを使えます。
(function (root) {
  "use strict";

  // 日本語・中国語・英語のふだんの言い方を、データ側の英語の言葉へ読み替える辞書です。
  // 左が検索で使われる言葉、右がデータに出てくる英語 (複数可) です。
  // "bp:legs" などは wger の大まかな部位で、種目名の "legs" と混ざらないよう印を付けています。
  const BACK = ["lats", "middle back", "lower back", "traps", "bp:back"];
  const ARMS = ["biceps", "triceps", "forearms", "bp:arms"];
  const LEGS = ["quadriceps", "hamstrings", "calves", "glutes", "adductors", "abductors", "bp:legs", "bp:calves"];
  const SYNONYMS = {
    // ---- 部位 (日本語) ----
    "胸": ["chest"], "大胸筋": ["chest"], "胸筋": ["chest"], "胸板": ["chest"], "バスト": ["chest"],
    "肩": ["shoulders"], "三角筋": ["shoulders"], "肩幅": ["shoulders"],
    "腹": ["abdominals"], "お腹": ["abdominals"], "おなか": ["abdominals"], "腹筋": ["abdominals"], "体幹": ["abdominals"],
    "腹斜筋": ["abdominals"], "脇腹": ["abdominals"], "わき腹": ["abdominals"], "くびれ": ["abdominals"], "シックスパック": ["abdominals"],
    "背中": BACK, "背筋": BACK, "広背筋": ["lats"], "僧帽筋": ["traps"], "肩甲骨": ["middle back", "traps"],
    "腰": ["lower back"], "脊柱起立筋": ["lower back"],
    "上腕二頭筋": ["biceps"], "二頭": ["biceps"], "力こぶ": ["biceps"],
    "上腕三頭筋": ["triceps"], "三頭": ["triceps"], "二の腕": ["triceps"], "振袖": ["triceps"],
    "腕": ARMS, "前腕": ["forearms"], "握力": ["forearms"],
    "脚": LEGS, "足": LEGS, "下半身": LEGS, "足腰": LEGS,
    "太もも": ["quadriceps", "hamstrings"], "大腿四頭筋": ["quadriceps"], "四頭": ["quadriceps"], "前もも": ["quadriceps"],
    "ハムストリング": ["hamstrings"], "ハムストリングス": ["hamstrings"], "ハム": ["hamstrings"], "もも裏": ["hamstrings"], "裏もも": ["hamstrings"],
    "太ももの裏": ["hamstrings"], "太もも裏": ["hamstrings"], "ももの裏": ["hamstrings"], "太ももの前": ["quadriceps"], "太ももの内側": ["adductors"],
    "お尻の横": ["abductors", "glutes"], "背中の上": ["traps", "middle back"], "背中の下": ["lower back"], "腰回り": ["lower back", "abdominals"],
    "ふくらはぎ": ["calves"], "カーフ": ["calf", "calves"],
    "尻": ["glutes"], "お尻": ["glutes"], "おしり": ["glutes"], "ヒップ": ["glutes", "hip"], "臀部": ["glutes"], "大臀筋": ["glutes"], "中臀筋": ["abductors", "glutes"],
    "内転筋": ["adductors"], "内もも": ["adductors"], "外転筋": ["abductors"], "首": ["neck"],
    // ---- 器具・種類 (日本語) ----
    "ダンベル": ["dumbbell"], "バーベル": ["barbell"], "自重": ["body only"], "器具なし": ["body only"], "家で": ["body only"], "自宅": ["body only"],
    "ケーブル": ["cable"], "マシン": ["machine"], "ケトルベル": ["kettlebells"],
    "チューブ": ["bands"], "バンド": ["bands"], "メディシンボール": ["medicine ball"],
    "バランスボール": ["exercise ball"], "フォームローラー": ["foam roll"], "ezバー": ["e-z curl bar"], "懸垂バー": ["pull-up bar"], "鉄棒": ["pull-up bar"],
    "ストレッチ": ["stretch", "stretching"], "有酸素": ["cardio"], "プライオメトリクス": ["plyometrics"],
    "パワーリフティング": ["powerlifting"], "ウエイトリフティング": ["olympic weightlifting"], "ストロングマン": ["strongman"],
    // ---- よく使う種目名 (日本語) ----
    "ベンチプレス": ["bench press"], "ベンチ": ["bench"], "スクワット": ["squat"],
    "デッドリフト": ["deadlift"], "懸垂": ["pull-up", "pullup", "chin-up"], "チンニング": ["chin-up", "pull-up"],
    "プルアップ": ["pull-up", "pullup"], "腕立て伏せ": ["push-up", "pushup"], "腕立て": ["push-up", "pushup"],
    "プッシュアップ": ["push-up", "pushup"], "ランジ": ["lunge"], "カール": ["curl"],
    "プレス": ["press"], "ロウ": ["row"], "ロー": ["row"], "フライ": ["fly", "flye"],
    "レイズ": ["raise"], "クランチ": ["crunch"], "プランク": ["plank"], "ディップス": ["dip"],
    "シュラッグ": ["shrug"], "エクステンション": ["extension"], "スナッチ": ["snatch"],
    "クリーン": ["clean"], "ジャーク": ["jerk"], "ヒップスラスト": ["hip thrust"],
    "ブリッジ": ["bridge"], "ジャンプ": ["jump"], "スイング": ["swing"],

    // ---- 部位 (中国語・簡体字) ----
    "胸肌": ["chest"], "胸部": ["chest"], "胸大肌": ["chest"],
    "肩膀": ["shoulders"], "肩部": ["shoulders"], "三角肌": ["shoulders"],
    "腹肌": ["abdominals"], "腹部": ["abdominals"], "核心": ["abdominals"], "马甲线": ["abdominals"], "人鱼线": ["abdominals"], "腹斜肌": ["abdominals"], "小肚子": ["abdominals"],
    "背": BACK, "背部": BACK, "背肌": BACK, "背阔肌": ["lats"], "斜方肌": ["traps"], "下背": ["lower back"], "腰部": ["lower back"],
    "手臂": ARMS, "胳膊": ARMS, "臂": ARMS, "肱二头肌": ["biceps"], "二头肌": ["biceps"], "二头": ["biceps"],
    "肱三头肌": ["triceps"], "三头肌": ["triceps"], "三头": ["triceps"], "拜拜肉": ["triceps"], "前臂": ["forearms"],
    "腿": LEGS, "腿部": LEGS, "下肢": LEGS, "大腿": ["quadriceps", "hamstrings"], "股四头肌": ["quadriceps"], "大腿前侧": ["quadriceps"],
    "腘绳肌": ["hamstrings"], "大腿后侧": ["hamstrings"], "小腿": ["calves"],
    "臀": ["glutes"], "臀部": ["glutes"], "屁股": ["glutes"], "翘臀": ["glutes"], "臀大肌": ["glutes"], "臀中肌": ["abductors", "glutes"],
    "大腿内侧": ["adductors"], "内收肌": ["adductors"], "外展肌": ["abductors"], "脖子": ["neck"], "颈部": ["neck"],
    // ---- 器具・種類・種目 (中国語) ----
    "哑铃": ["dumbbell"], "杠铃": ["barbell"], "徒手": ["body only"], "自重": ["body only"], "在家": ["body only"],
    "绳索": ["cable"], "拉索": ["cable"], "器械": ["machine"], "壶铃": ["kettlebells"], "弹力带": ["bands"], "单杠": ["pull-up bar"],
    "拉伸": ["stretch", "stretching"], "有氧": ["cardio"],
    "卧推": ["bench press"], "深蹲": ["squat"], "硬拉": ["deadlift"], "引体向上": ["pull-up", "pullup", "chin-up"],
    "俯卧撑": ["push-up", "pushup"], "弓步": ["lunge"], "弯举": ["curl"], "推举": ["press"], "划船": ["row"],
    "飞鸟": ["fly", "flye"], "平板支撑": ["plank"], "卷腹": ["crunch"], "臀桥": ["glute bridge", "bridge", "hip thrust"],

    // ---- ふだんの英語 ----
    "abs": ["abdominals"], "core": ["abdominals"], "sixpack": ["abdominals"], "six-pack": ["abdominals"], "obliques": ["abdominals"],
    "pecs": ["chest"], "delts": ["shoulders"], "butt": ["glutes"], "booty": ["glutes"], "bum": ["glutes"], "glute": ["glutes"],
    "thighs": ["quadriceps", "hamstrings"], "quads": ["quadriceps"], "hams": ["hamstrings"], "hamstring": ["hamstrings"], "calf": ["calves"],
    "arms": ARMS, "legs": LEGS, "back": BACK, "lowerback": ["lower back"], "upperback": ["middle back", "traps"],
    "bodyweight": ["body only"], "home": ["body only"], "kettlebell": ["kettlebells"], "band": ["bands"],
  };

  // 「ここを鍛えたい」のような文から取り除く言い回しです (意味は部位の言葉だけに残します)。
  const INTENT_PATTERNS = [
    // 日本語: 〜を鍛えたい・引き締めたい・大きくしたい など
    /(を|が|も)?(鍛え|きたえ|引き締め|ひきしめ|大きく|おおきく|太く|細く|強く|伸ばし|のばし|ほぐし|ストレッチし|トレーニングし|筋トレし|効かせ|育て|デカく|でかく|絞り|しぼり|鍛|引き締)(たい|る|ます|ましょう|られる|たいです)?/g,
    /(に効く|に効かせる|向け|のため|ための|の筋トレ|のトレーニング|の種目|のメニュー|筋肉|メニュー|種目|トレーニング|筋トレ|エクササイズ|やり方|方法|したい|たい|です|ください|教えて)/g,
    // 中国語: 想练・锻炼・训练 など
    /(我想|想要|想|要|怎么|如何|练习|锻炼|训练|练|增肌|强化|塑形|瘦|减|的|肌肉|动作|方法|一下|吗|呢)/g,
    // 英語: I want to train my ... など
    /\b(i|want|wanna|to|my|the|a|an|for|how|do|exercises?|workouts?|train(ing)?|work(ing)?|build(ing)?|strengthen(ing)?|tone|toning|grow|get|bigger|stronger|target(ing)?|hit|best|some|me|show|good|of|at|in|on|with|and|using|that|which|what|can|is|are)\b/g,
  ];
  // 文の中で区切りとして読み飛ばす文字 (助詞・句読点など)。
  const SKIP = /[\s,.!?、。！？・を|が|の|に|へ|と|や|で|は]/;

  // 比べやすい形にそろえます (小文字、記号を空白に、全角英数を半角に)。
  function normalize(s) {
    return String(s || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[-_/()'",.（）「」]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 1 種目ぶんの「探される文字列」を前もって作っておきます。翻訳した名前 (i18n) も入れます。
  function buildIndex(exercises, i18n) {
    const tr = i18n || {};
    return exercises.map((ex) => {
      const t = tr[ex.id] || {};
      const names = [ex.name, ...(ex.aliases || []), t.ja && t.ja.name, t.zh && t.zh.name].filter(Boolean);
      const name = normalize(names.join(" | "));
      const rest = normalize([
        ex.category, ex.equipment, ex.level, ex.force, ex.mechanic,
        ex.bodyPart && "bp:" + ex.bodyPart,
        ...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || []),
      ].filter(Boolean).join(" "));
      return { ex, name, hay: name + " | " + rest, primary: ex.primaryMuscles || [], bp: ex.bodyPart ? "bp:" + ex.bodyPart : "" };
    });
  }

  const KEYS = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);
  // 部位だけを表す読み替え (筋肉名と "bp:" の部位) かどうか。部位で探したときの並べ方に使います。
  const isMuscleTerm = (t) => MUSCLES.includes(t) || t.startsWith("bp:");
  const STRENGTH = ["strength", "powerlifting", "olympic weightlifting", "strongman", "plyometrics"];

  // 検索語を「どれか 1 つが当たればよい候補」の組に分けます。
  // 例: "胸 ダンベル" → [{alts:["胸","chest"]}, {alts:["ダンベル","dumbbell"]}] (両方とも当たる必要がある)
  // 辞書で読み替えた組には word (入力された言葉) と terms (データ側の言葉) を付けます。
  function parseQuery(q) {
    let s = String(q || "").normalize("NFKC").toLowerCase();
    // 「二の腕」のように辞書の言葉の中に助詞が入っているものを壊さないよう、言い回しを消す前に辞書の言葉を守ります。
    const kept = [];
    for (const k of KEYS) {
      if (!/[^\x00-\x7f]/.test(k)) continue;
      let i;
      while ((i = s.indexOf(k)) !== -1) {
        kept.push({ at: i, k });
        s = s.slice(0, i) + "\u0000".repeat(k.length) + s.slice(i + k.length);
      }
    }
    for (const re of INTENT_PATTERNS) s = s.replace(re, (m) => " ".repeat(m.length));
    const groups = [];
    const pushWord = (w) => {
      const t = normalize(w);
      if (!t) return;
      const syn = SYNONYMS[t];
      groups.push(syn ? { word: t, terms: syn, alts: [t, ...syn.map(normalize)] } : { alts: [t] });
    };
    // 前から読み、守った辞書の言葉・英数字の単語・その他の文字のかたまりに分けます。
    let i = 0, buf = "";
    const flush = () => { if (buf.trim()) pushWord(buf); buf = ""; };
    const keptAt = new Map(kept.map((x) => [x.at, x.k]));
    while (i < s.length) {
      if (s[i] === "\u0000") {
        flush();
        const k = keptAt.get(i);
        groups.push({ word: k, terms: SYNONYMS[k], alts: [normalize(k), ...SYNONYMS[k].map(normalize)] });
        i += k.length;
        continue;
      }
      const ch = s[i];
      const ascii = /[a-z0-9\-]/.test(ch);
      if (SKIP.test(ch) && !ascii) { flush(); i++; continue; }
      // 英数字とそれ以外が切り替わるところでも区切ります。
      if (buf && /[a-z0-9\-]/.test(buf[buf.length - 1]) !== ascii) flush();
      buf += ch;
      i++;
    }
    flush();
    // 同じ組が重なったら 1 つにします。
    const seen = new Set();
    return groups.filter((g) => {
      const key = g.alts.join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 候補のどれかが含まれていれば当たりです。"push up" は "pushup" とも比べます。
  function hit(hay, alts) {
    return alts.some((a) => hay.includes(a) || hay.replace(/ /g, "").includes(a.replace(/ /g, "")));
  }

  const FILTER_KEYS = ["muscle", "equipment", "category", "level", "force", "mechanic"];
  const MUSCLES = ["abdominals", "abductors", "adductors", "biceps", "calves", "chest", "forearms", "glutes", "hamstrings",
    "lats", "lower back", "middle back", "neck", "quadriceps", "shoulders", "traps", "triceps"];

  // 筋肉 → wger の大まかな部位。筋肉が書かれていない wger の種目を、部位の絞り込みで拾うために使います。
  const MUSCLE_BODYPART = {
    chest: "chest", lats: "back", "middle back": "back", "lower back": "back", traps: "back",
    quadriceps: "legs", hamstrings: "legs", glutes: "legs", adductors: "legs", abductors: "legs",
    calves: "calves", shoulders: "shoulders", biceps: "arms", triceps: "arms", forearms: "arms", abdominals: "abs",
  };

  function passFilters(ex, f) {
    if (f.muscle) {
      const primary = ex.primaryMuscles || [];
      const ms = f.includeSecondary ? [...primary, ...(ex.secondaryMuscles || [])] : primary;
      const byPart = !primary.length && ex.bodyPart && MUSCLE_BODYPART[f.muscle] === ex.bodyPart;
      if (!ms.includes(f.muscle) && !byPart) return false;
    }
    if (f.equipment && (ex.equipment || "none") !== f.equipment) return false;
    for (const k of ["category", "level", "force", "mechanic"]) {
      if (f[k] && ex[k] !== f[k]) return false;
    }
    return true;
  }

  // 検索して、名前に当たったもの・主に使う筋肉が一致するものほど上に並べて返します。
  function search(index, q, filters) {
    const groups = parseQuery(q);
    const f = filters || {};
    const out = [];
    for (const row of index) {
      if (!passFilters(row.ex, f)) continue;
      if (!groups.every((g) => hit(row.hay, g.alts))) continue;
      let score = 0;
      for (const g of groups) {
        if (g.terms && g.terms.every(isMuscleTerm)) {
          // 部位で探したとき: 主に使う筋肉が一致するものを上に、筋トレ系を少し優先します (名前の一致は見ません)。
          if (g.terms.some((t) => row.primary.includes(t))) score += 3;
          else if (row.bp && g.terms.includes(row.bp)) score += 2;
          if (STRENGTH.includes(row.ex.category)) score += 1;
          continue;
        }
        if (g.alts.some((a) => row.name.startsWith(a))) score += 3;
        else if (hit(row.name, g.alts)) score += 2;
      }
      out.push({ ex: row.ex, score });
    }
    // 当たり具合が同じなら、画像のある種目を先にします。
    const pic = (ex) => (ex.images && ex.images.length ? 1 : 0);
    out.sort((a, b) => b.score - a.score || pic(b.ex) - pic(a.ex) || a.ex.name.localeCompare(b.ex.name));
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
  // wger の種目には筋肉が書かれていないものがあるので、そのときは大まかな部位 (bodyPart) で決めます。
  const PFC_BODYPART = { abs: "腹", arms: "腕", back: "背中", calves: "脚", chest: "胸", legs: "脚", shoulders: "肩", cardio: "その他" };
  // name を渡すと、その名前 (画面の言語の名前) で記録します。渡さなければ英語名です。
  function pfcUrl(ex, name) {
    const p = new URLSearchParams();
    p.set("exercise", String(name || ex.name).slice(0, 40));
    p.set("muscle", PFC_MUSCLE[(ex.primaryMuscles || [])[0]] || PFC_BODYPART[ex.bodyPart] || "その他");
    return PFC_URL + "?" + p.toString();
  }

  const api = {
    SYNONYMS, JA_SYNONYMS: SYNONYMS, FILTER_KEYS, MUSCLES, MUSCLE_BODYPART, PFC_MUSCLE, PFC_BODYPART,
    normalize, buildIndex, parseQuery, search, pfcUrl,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ExSearch = api;
})(typeof window !== "undefined" ? window : globalThis);
