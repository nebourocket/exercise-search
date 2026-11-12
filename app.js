// 画面の動き。検索そのものは search.js にあります。
(function () {
  "use strict";
  const S = window.ExSearch;
  const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  const PAGE = 48;
  const LANGS = ["en", "ja", "zh"];
  // free-exercise-db の画像は相対パス、wger の画像は完全な URL です。
  const imgUrl = (src) => (/^https?:/.test(src) ? src : IMG_BASE + src);

  // ---------- 画面の文字 (英語・日本語・中国語) ----------
  const T = {
    en: {
      title: "Exercise Search", searchLabel: "Search exercises",
      heroTitle: "What do you want to train?", heroSub: "Tap a muscle on the body, or just type it — like “train my back” or “dumbbell chest”.",
      fewer: "Fewer exercises", more2: "More", exercisesN: (n) => `${n.toLocaleString("en")} exercises`, eqAll: "Any equipment",
      step1: "Pick a muscle", step1Hint: "Tap the body or type", step2: "Choose your equipment", step2Hint: "Anything goes",
      step3: "Open an exercise", step3Hint: "Follow the steps, then log it",
      placeholder: "e.g. train my back, dumbbell chest, pull-up",
      examples: ["Train my back", "Abs at home", "Dumbbell chest", "Glutes", "Stretching"],
      understood: "Showing exercises for", pickMuscle: "Tap a muscle", front: "Front", back: "Back",
      moreFilters: "More filters", secondary: "Include secondary muscles", reset: "Clear", more: "Show more",
      empty: "No exercises match. Remove a word or clear the filters.",
      howto: "How to", original: "Original (English)", aiTranslated: "AI translation",
      logPfc: "Log in PFC Calculator", copyLink: "Copy link", copied: "Copied!",
      dataFrom: "Exercise data and images:", bodyFrom: "Body map:", guideOnly: "Guide", source: "Source",
      guideTitle: "Detailed guide", aiBadge: "Written by AI", tipsTitle: "Common mistakes & safety",
      breathTitle: "Breathing", focusTitle: "How to really feel the target muscle",
      aiNote: "This guide was written by AI from the exercise data. It may contain mistakes — check with a coach if unsure.",
      disclaimer: "For general information only. Warm up, use safe loads, and consult a professional if you have an injury or health condition.",
      count: (n, all) => `${n.toLocaleString("en")} of ${all.toLocaleString("en")} exercises`,
      all: "All", primary: "Primary", secondaryM: "Secondary",
      muscle: "Muscle", equipment: "Equipment", category: "Type", level: "Level", force: "Force", mechanic: "Mechanic",
    },
    ja: {
      title: "筋トレ種目サーチ", searchLabel: "種目を検索",
      heroTitle: "どこを鍛えたいですか？", heroSub: "体の図の筋肉をタップするか、「二の腕を引き締めたい」のように書いてください。",
      fewer: "種目が少ない", more2: "多い", exercisesN: (n) => `${n.toLocaleString("ja")} 種目`, eqAll: "器具はなんでも",
      step1: "鍛える部位を選ぶ", step1Hint: "体をタップか、言葉で", step2: "器具を選ぶ", step2Hint: "なんでもOK",
      step3: "種目を開く", step3Hint: "やり方を見て、記録まで",
      placeholder: "例: 二の腕を引き締めたい、胸 ダンベル、懸垂",
      examples: ["二の腕を引き締めたい", "お腹を鍛えたい", "自宅で胸", "お尻 ダンベル", "ストレッチ"],
      understood: "次の部位の種目を表示中:", pickMuscle: "鍛えたい筋肉をタップ", front: "前", back: "後ろ",
      moreFilters: "そのほかの絞り込み", secondary: "補助で使う筋肉も含める", reset: "解除", more: "もっと見る",
      empty: "当てはまる種目がありません。言葉を減らすか、絞り込みを解除してください。",
      howto: "やり方", original: "原文 (英語)", aiTranslated: "AI 翻訳",
      logPfc: "PFC計算ツールに記録", copyLink: "リンクをコピー", copied: "コピーしました",
      dataFrom: "種目データと画像:", bodyFrom: "体の図:", guideOnly: "説明あり", source: "出典",
      guideTitle: "詳しい説明", aiBadge: "AI が書いた説明", tipsTitle: "よくある間違いと注意点",
      breathTitle: "呼吸", focusTitle: "狙った部位に効かせるコツ",
      aiNote: "この説明は、種目のデータをもとに AI が書いた文章です。間違いを含むことがあります。不安なときはトレーナーに確かめてください。",
      disclaimer: "一般的な情報です。ウォームアップをして無理のない重さで行い、けがや持病がある場合は専門家に相談してください。",
      count: (n, all) => `${all.toLocaleString("ja")} 種目中 ${n.toLocaleString("ja")} 件`,
      all: "すべて", primary: "主に使う筋肉", secondaryM: "補助で使う筋肉",
      muscle: "部位", equipment: "器具", category: "種類", level: "レベル", force: "動き", mechanic: "関節",
    },
    zh: {
      title: "健身动作搜索", searchLabel: "搜索动作",
      heroTitle: "你想练哪里？", heroSub: "点击人体图上的肌肉，或直接输入，例如“想练臀部”。",
      fewer: "动作较少", more2: "较多", exercisesN: (n) => `${n.toLocaleString("zh")} 个动作`, eqAll: "器械不限",
      step1: "选择部位", step1Hint: "点击人体图或输入", step2: "选择器械", step2Hint: "不限",
      step3: "打开动作", step3Hint: "按步骤练，再记录",
      placeholder: "例如：想练臀部、哑铃 胸、引体向上",
      examples: ["想练臀部", "在家练腹肌", "哑铃 胸", "背部", "拉伸"],
      understood: "正在显示以下部位的动作：", pickMuscle: "点击想练的肌肉", front: "正面", back: "背面",
      moreFilters: "更多筛选", secondary: "包含辅助肌群", reset: "清除", more: "显示更多",
      empty: "没有找到动作。请减少关键词或清除筛选。",
      howto: "动作要领", original: "原文（英文）", aiTranslated: "AI 翻译",
      logPfc: "记录到 PFC Calculator", copyLink: "复制链接", copied: "已复制",
      dataFrom: "动作数据与图片：", bodyFrom: "人体图：", guideOnly: "有说明", source: "来源",
      guideTitle: "详细说明", aiBadge: "AI 撰写", tipsTitle: "常见错误与注意事项",
      breathTitle: "呼吸", focusTitle: "让目标肌肉发力的要点",
      aiNote: "本说明由 AI 根据动作数据撰写，可能有错误。如有疑问，请咨询教练。",
      disclaimer: "仅供一般参考。请充分热身、使用安全的重量；如有伤病或健康问题，请咨询专业人士。",
      count: (n, all) => `共 ${all.toLocaleString("zh")} 个动作，找到 ${n.toLocaleString("zh")} 个`,
      all: "全部", primary: "主要肌群", secondaryM: "辅助肌群",
      muscle: "部位", equipment: "器械", category: "类型", level: "难度", force: "发力", mechanic: "关节",
    },
  };
  // データの値 (筋肉・器具・種類など) の日本語名と中国語名。
  const V = {
    ja: {
      abdominals: "腹筋", abductors: "外転筋 (お尻の横)", adductors: "内転筋 (内もも)", biceps: "上腕二頭筋",
      calves: "ふくらはぎ", chest: "胸", forearms: "前腕", glutes: "お尻", hamstrings: "ハムストリング",
      lats: "広背筋", "lower back": "腰 (脊柱起立筋)", "middle back": "背中の中部", neck: "首",
      quadriceps: "大腿四頭筋", shoulders: "肩", traps: "僧帽筋", triceps: "上腕三頭筋",
      barbell: "バーベル", dumbbell: "ダンベル", "body only": "自重", cable: "ケーブル", machine: "マシン",
      kettlebells: "ケトルベル", bands: "チューブ・バンド", "medicine ball": "メディシンボール",
      "exercise ball": "バランスボール", "foam roll": "フォームローラー", "e-z curl bar": "EZ バー",
      other: "その他", none: "器具なし・不明", "pull-up bar": "懸垂バー", bench: "ベンチ",
      strength: "筋トレ", stretching: "ストレッチ", plyometrics: "プライオメトリクス", powerlifting: "パワーリフティング",
      "olympic weightlifting": "ウエイトリフティング", strongman: "ストロングマン", cardio: "有酸素",
      beginner: "初級", intermediate: "中級", expert: "上級", push: "押す", pull: "引く", static: "静止",
      compound: "多関節", isolation: "単関節",
      "bp:legs": "脚", "bp:back": "背中", "bp:arms": "腕", "bp:calves": "ふくらはぎ", "bp:abs": "腹筋", "bp:chest": "胸", "bp:shoulders": "肩", "bp:cardio": "有酸素",
    },
    zh: {
      abdominals: "腹肌", abductors: "外展肌（臀外侧）", adductors: "内收肌（大腿内侧）", biceps: "肱二头肌",
      calves: "小腿", chest: "胸部", forearms: "前臂", glutes: "臀部", hamstrings: "腘绳肌",
      lats: "背阔肌", "lower back": "下背（竖脊肌）", "middle back": "中背部", neck: "颈部",
      quadriceps: "股四头肌", shoulders: "肩部", traps: "斜方肌", triceps: "肱三头肌",
      barbell: "杠铃", dumbbell: "哑铃", "body only": "徒手", cable: "绳索", machine: "器械",
      kettlebells: "壶铃", bands: "弹力带", "medicine ball": "药球", "exercise ball": "瑜伽球",
      "foam roll": "泡沫轴", "e-z curl bar": "曲杆", other: "其他", none: "无器械/未注明", "pull-up bar": "单杠", bench: "训练凳",
      strength: "力量训练", stretching: "拉伸", plyometrics: "增强式训练", powerlifting: "力量举",
      "olympic weightlifting": "举重", strongman: "大力士", cardio: "有氧",
      beginner: "初级", intermediate: "中级", expert: "高级", push: "推", pull: "拉", static: "静态",
      compound: "多关节", isolation: "单关节",
      "bp:legs": "腿部", "bp:back": "背部", "bp:arms": "手臂", "bp:calves": "小腿", "bp:abs": "腹肌", "bp:chest": "胸部", "bp:shoulders": "肩部", "bp:cardio": "有氧",
    },
    en: { none: "not specified", "body only": "bodyweight", "e-z curl bar": "EZ bar", kettlebells: "kettlebell", "bp:legs": "legs", "bp:back": "back", "bp:arms": "arms", "bp:calves": "calves", "bp:abs": "abs", "bp:chest": "chest", "bp:shoulders": "shoulders", "bp:cardio": "cardio" },
  };

  // 体の図: 筋肉 → wger の重ね図の番号 (前 f / 後ろ b)。図に無い筋肉 (前腕・腰など) はボタンだけで選びます。
  const MAP = {
    chest: { f: [4] }, shoulders: { f: [2] }, biceps: { f: [1, 13] }, abdominals: { f: [6, 14] }, quadriceps: { f: [10] },
    triceps: { b: [5] }, traps: { b: [9] }, lats: { b: [12] }, glutes: { b: [8] }, hamstrings: { b: [11] }, calves: { b: [7, 15] },
  };
  const ov = (kind, n) => `assets/muscles/${kind}${n}.svg`;
  // 筋肉が書かれていない wger の種目は、大まかな部位で図に色を付けます。
  const BP_MUSCLES = {
    back: ["lats", "traps"], legs: ["quadriceps", "hamstrings", "glutes", "calves"], arms: ["biceps", "triceps"],
    abs: ["abdominals"], chest: ["chest"], shoulders: ["shoulders"], calves: ["calves"],
  };
  const musclesOf = (ex) => ((ex.primaryMuscles || []).length ? ex.primaryMuscles : BP_MUSCLES[ex.bodyPart] || []);

  // ---------- 言語 ----------
  function guessLang() {
    const n = (navigator.language || "").toLowerCase();
    return n.startsWith("ja") ? "ja" : n.startsWith("zh") ? "zh" : "en";
  }
  let lang = "en";
  try {
    const p = new URLSearchParams(location.search).get("lang");
    lang = LANGS.includes(p) ? p : localStorage.getItem("exs-lang") || guessLang();
  } catch (e) {
    lang = guessLang();
  }
  if (!LANGS.includes(lang)) lang = "en";
  const tr = (k) => T[lang][k];
  const val = (v) => (V[lang] && V[lang][v]) || V.en[v] || v;

  const $ = (id) => document.getElementById(id);
  const els = {
    q: $("q"), filters: $("filters"), secondary: $("secondary"), count: $("count"), results: $("results"),
    more: $("more"), empty: $("empty"), reset: $("reset"), lang: $("lang"), detail: $("detail"),
    examples: $("examples"), understood: $("understood"), chips: $("muscle-chips"), bodymap: $("bodymap"),
    eq: $("eq-chips"), tip: $("map-tip"), steps: $("steps"),
  };

  let data = [], index = [], byId = new Map(), current = [], shown = 0;
  let guides = {}; // AI が書いた詳しい説明 (data/guides.json)
  let i18n = {};   // 種目名と手順の翻訳 (data/i18n.json)
  const filters = {};
  let heat = {};      // 今の検索条件 (部位の指定を除く) での、筋肉ごとの種目数
  let eqCount = {};   // 今の検索条件 (器具の指定を除く) での、器具ごとの種目数
  let introDone = false;

  function el(tag, props, kids) {
    const n = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "text") n.textContent = props[k];
      else if (k === "class") n.className = props[k];
      else n.setAttribute(k, props[k]);
    }
    (kids || []).forEach((c) => c && n.appendChild(c));
    return n;
  }
  // 画面の言語での種目名。翻訳が無ければ英語名です。
  const nameOf = (ex) => (lang !== "en" && i18n[ex.id] && i18n[ex.id][lang] && i18n[ex.id][lang].name) || ex.name;

  // ---------- 体の図 ----------
  // 重ね図を一度だけ読み込み、クリックした点に色が付いているかで筋肉を決めます (当たり判定の形を手で描かないため)。
  const hitCanvas = {};
  function loadHitMaps() {
    for (const [muscle, sides] of Object.entries(MAP)) {
      for (const side of ["f", "b"]) {
        for (const n of sides[side] || []) {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth || 200;
            c.height = img.naturalHeight || 369;
            c.getContext("2d", { willReadFrequently: true }).drawImage(img, 0, 0);
            (hitCanvas[side] = hitCanvas[side] || []).push({ muscle, c });
          };
          img.src = ov("m", n);
        }
      }
    }
  }
  function muscleAt(side, e, stack) {
    const r = stack.getBoundingClientRect();
    const scale = 200 / r.width; // 横幅 200 を基準に、左上をそろえて重ねています。
    const x = (e.clientX - r.left) * scale;
    const y = (e.clientY - r.top) * scale;
    for (const { muscle, c } of hitCanvas[side] || []) {
      if (x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
      if (c.getContext("2d", { willReadFrequently: true }).getImageData(Math.floor(x), Math.floor(y), 1, 1).data[3] > 40) return muscle;
    }
    return null;
  }
  // 図の上に、選んだ筋肉 (濃い色) ・補助の筋肉 (黄色) ・マウスの下の筋肉 (薄い色) を重ねます。
  function paintMap(root, selected, hover, secondary) {
    root.querySelectorAll(".fig-stack").forEach((stack) => {
      const sideEl = stack.closest("[data-side]");
      const side = sideEl && sideEl.dataset.side === "back" ? "b" : "f";
      stack.querySelectorAll(".ov").forEach((n) => n.remove());
      const add = (muscles, kind, cls) => {
        for (const m of muscles) for (const n of (MAP[m] && MAP[m][side]) || []) {
          stack.appendChild(el("img", { class: "ov" + (cls ? " " + cls : ""), src: ov(kind, n), alt: "" }));
        }
      };
      add((secondary || []).filter((m) => !(selected || []).includes(m)), "s");
      add(selected || [], "m");
      if (hover && !(selected || []).includes(hover)) add([hover], "m", "hover");
    });
  }
  // ヒーローの体の図: 種目が多い筋肉ほど濃い赤 (1 色の濃淡)。選んだ筋肉は光らせ、ほかは薄くします。
  function paintHeat(hover) {
    const max = Math.max(1, ...Object.values(heat));
    els.bodymap.querySelectorAll(".fig-stack").forEach((stack) => {
      const side = stack.closest("[data-side]").dataset.side === "back" ? "b" : "f";
      stack.querySelectorAll(".ov").forEach((n) => n.remove());
      for (const [m, sides] of Object.entries(MAP)) {
        const c = heat[m] || 0;
        const sel = filters.muscle === m;
        if (!c && !sel && hover !== m) continue;
        // 面積ではなく濃さで数を表すので、平方根でならして小さい数も見えるようにします。
        let a = 0.18 + 0.82 * Math.sqrt(c / max);
        if (filters.muscle && !sel) a *= 0.45;
        if (sel) a = 1;
        for (const n of sides[side] || []) {
          const img = el("img", { class: "ov" + (sel ? " sel" : "") + (hover === m ? " hover" : ""), src: ov("m", n), alt: "" });
          img.style.opacity = String(hover === m ? Math.max(a, 0.85) : a);
          stack.appendChild(img);
        }
      }
    });
    if (!introDone && Object.keys(heat).length) {
      introDone = true;
      els.bodymap.classList.add("intro");
      setTimeout(() => els.bodymap.classList.remove("intro"), 1200);
    }
  }
  function showTip(stack, e, m) {
    if (!m) { els.tip.hidden = true; return; }
    const r = els.bodymap.getBoundingClientRect();
    els.tip.textContent = "";
    els.tip.appendChild(el("b", { text: val(m) }));
    els.tip.append(tr("exercisesN")(heat[m] || 0));
    els.tip.style.left = `${e.clientX - r.left}px`;
    els.tip.style.top = `${e.clientY - r.top}px`;
    els.tip.hidden = false;
  }
  function setupBodyMap() {
    els.bodymap.querySelectorAll(".fig").forEach((fig) => {
      const side = fig.dataset.side === "back" ? "b" : "f";
      const stack = fig.querySelector(".fig-stack");
      let last = null;
      stack.addEventListener("mousemove", (e) => {
        const m = muscleAt(side, e, stack);
        if (m === last) return;
        last = m;
        stack.style.cursor = m ? "pointer" : "default";
        paintHeat(m);
        els.chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("hover", c.dataset.m === m));
      });
      stack.addEventListener("mousemove", (e) => showTip(stack, e, muscleAt(side, e, stack)));
      stack.addEventListener("mouseleave", () => { last = null; els.tip.hidden = true; syncMuscleUi(); });
      stack.addEventListener("click", (e) => {
        const m = muscleAt(side, e, stack);
        if (m) setMuscle(filters.muscle === m ? undefined : m);
      });
    });
  }
  function setMuscle(m) {
    filters.muscle = m;
    syncMuscleUi();
    run();
  }
  function syncMuscleUi() {
    paintHeat(null);
    els.chips.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(c.dataset.m === filters.muscle));
      c.classList.remove("hover");
    });
  }
  function buildMuscleChips() {
    els.chips.textContent = "";
    [...S.MUSCLES].sort((a, b) => val(a).localeCompare(val(b), lang)).forEach((m) => {
      const b = el("button", { type: "button", class: "chip", "data-m": m, "aria-pressed": "false" }, [document.createTextNode(val(m) + " "), el("small", { text: "" })]);
      b.addEventListener("click", () => setMuscle(filters.muscle === m ? undefined : m));
      b.addEventListener("mouseenter", () => paintHeat(m));
      b.addEventListener("mouseleave", () => syncMuscleUi());
      els.chips.appendChild(b);
    });
  }

  // ---------- 絞り込み ----------
  function buildFilters() {
    const values = {};
    S.FILTER_KEYS.forEach((k) => (values[k] = new Set()));
    data.forEach((ex) => {
      (ex.primaryMuscles || []).forEach((m) => values.muscle.add(m));
      values.equipment.add(ex.equipment || "none");
      ["category", "level", "force", "mechanic"].forEach((k) => ex[k] && values[k].add(ex[k]));
    });
    const order = { level: ["beginner", "intermediate", "expert"] };
    els.filters.textContent = "";
    S.FILTER_KEYS.filter((k) => k !== "muscle" && k !== "equipment").forEach((k) => {
      const s = el("select", { "aria-label": tr(k), "data-key": k });
      s.appendChild(el("option", { value: "", text: `${tr(k)}: ${tr("all")}` }));
      const list = order[k] || [...values[k]].sort((a, b) => val(a).localeCompare(val(b), lang));
      list.forEach((v) => s.appendChild(el("option", { value: v, text: val(v) })));
      s.value = filters[k] || "";
      s.classList.toggle("on", !!s.value);
      s.addEventListener("change", () => {
        filters[k] = s.value || undefined;
        s.classList.toggle("on", !!s.value);
        run();
      });
      els.filters.appendChild(s);
    });
  }

  // 器具のボタン。今の条件で多い順に並べ、件数を添えます。
  function buildEquipment() {
    els.eq.textContent = "";
    // 「不明」「その他」は選ぶ意味が薄いので最後に回します。
    const last = (k) => (k === "none" || k === "other" ? 1 : 0);
    const list = Object.entries(eqCount).sort((a, b) => last(a[0]) - last(b[0]) || b[1] - a[1]).map(([k]) => k);
    if (filters.equipment && !list.includes(filters.equipment)) list.unshift(filters.equipment);
    const total = Object.values(eqCount).reduce((a, b) => a + b, 0);
    const mk = (key, label, n) => {
      const b = el("button", { type: "button", "aria-pressed": String((filters.equipment || "") === key) }, [document.createTextNode(label + " "), el("small", { text: n.toLocaleString(lang) })]);
      b.addEventListener("click", () => { filters.equipment = key || undefined; run(); });
      els.eq.appendChild(b);
    };
    mk("", tr("eqAll"), total);
    list.forEach((k) => mk(k, val(k), eqCount[k] || 0));
  }
  // 使い方の 3 段を、今の状態に合わせて灯します。
  function updateSteps() {
    const terms = [];
    for (const g of S.parseQuery(els.q.value)) for (const t of g.terms || []) if (S.MUSCLES.includes(t) || t.startsWith("bp:")) terms.push(t);
    const picked = filters.muscle ? val(filters.muscle) : terms.length ? [...new Set(terms.map(val))].slice(0, 2).join(", ") : "";
    const s1 = els.steps.querySelector('[data-step="1"]'), s2 = els.steps.querySelector('[data-step="2"]'), s3 = els.steps.querySelector('[data-step="3"]');
    s1.classList.toggle("done", !!picked);
    $("step1-state").textContent = picked || tr("step1Hint");
    // 「お尻 ダンベル」のように言葉で器具を書いたときも、器具を選んだことにします。
    const EQ = new Set(Object.keys(eqCount).concat(["body only"]));
    const eqWords = [];
    for (const g of S.parseQuery(els.q.value)) for (const t of g.terms || []) if (EQ.has(t)) eqWords.push(t);
    const eqPicked = filters.equipment ? val(filters.equipment) : eqWords.length ? val(eqWords[0]) : "";
    s2.classList.toggle("done", !!eqPicked);
    $("step2-state").textContent = eqPicked || tr("step2Hint");
    s1.classList.toggle("next", !picked);
    s2.classList.toggle("next", !!picked && !eqPicked);
    s3.classList.toggle("next", !!picked && !!eqPicked);
  }
  function buildExamples() {
    els.examples.textContent = "";
    tr("examples").forEach((x) => {
      const b = el("button", { type: "button", text: x });
      b.addEventListener("click", () => { els.q.value = x; run(); });
      els.examples.appendChild(b);
    });
  }

  function applyLang() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.title = tr("title");
    document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = tr(n.dataset.i18n)));
    document.querySelectorAll("[data-i18n-placeholder]").forEach((n) => (n.placeholder = tr(n.dataset.i18nPlaceholder)));
    els.lang.value = lang;
    buildFilters();
    buildMuscleChips();
    buildExamples();
    syncMuscleUi();
  }

  // ---------- 一覧 ----------
  function thumb(ex) {
    const src = ex.thumb || ex.images[0];
    if (src) return el("div", { class: "thumb" }, [el("img", { alt: "", loading: "lazy", width: "320", height: "240", src: imgUrl(src) })]);
    // 画像の無い種目は、使う筋肉を体の図で見せます。
    const box = el("div", { class: "thumb map" }, ["front", "back"].map((side) =>
      el("div", { "data-side": side }, [el("div", { class: "fig-stack mini" }, [el("img", { class: "fig-base", src: `assets/muscles/${side}.svg`, alt: "", loading: "lazy" })])])));
    paintMap(box, musclesOf(ex), null, ex.secondaryMuscles || []);
    if (guides[ex.id]) box.appendChild(el("span", { class: "flag", text: tr("guideOnly") }));
    return box;
  }
  function card(ex) {
    const name = nameOf(ex);
    const tags = el("ul", { class: "tags" }, [
      ...(ex.primaryMuscles || []).map((m) => el("li", { class: "m", text: val(m) })),
      el("li", { text: val(ex.equipment || "none") }),
      ex.level && el("li", { text: val(ex.level) }),
    ]);
    const body = el("div", { class: "body" }, [el("h3", { text: name }), name !== ex.name && el("p", { class: "en", text: ex.name }), tags]);
    const b = el("button", { type: "button", class: "card" }, [thumb(ex), body]);
    b.addEventListener("click", () => openDetail(ex.id, true));
    return el("li", null, [b]);
  }
  function renderMore() {
    const frag = document.createDocumentFragment();
    current.slice(shown, shown + PAGE).forEach((ex) => frag.appendChild(card(ex)));
    els.results.appendChild(frag);
    shown = Math.min(current.length, shown + PAGE);
    els.more.hidden = shown >= current.length;
  }

  // 「二の腕を引き締めたい」などを、どの部位として受け取ったかを見せます。
  function showUnderstood() {
    const terms = [];
    for (const g of S.parseQuery(els.q.value)) {
      const ms = (g.terms || []).filter((t) => S.MUSCLES.includes(t) || t.startsWith("bp:"));
      // 「背中」→ 広背筋・背中の中部… のように多いときは、入力された言葉のまま 1 つで見せます。
      if (ms.length > 3) terms.push(g.word);
      else ms.forEach((t) => terms.push(val(t)));
    }
    const uniq = [...new Set(terms)];
    els.understood.textContent = "";
    els.understood.hidden = !uniq.length;
    if (uniq.length) {
      els.understood.append(tr("understood") + " ");
      uniq.forEach((t) => els.understood.appendChild(el("b", { text: t })));
    }
  }

  function run(keepUrl) {
    filters.includeSecondary = els.secondary.checked;
    current = S.search(index, els.q.value, filters);
    // 体の図とボタンの件数: それぞれ自分の絞り込みを外した数を数えます (選び直しやすくするため)。
    heat = {};
    for (const ex of S.search(index, els.q.value, { ...filters, muscle: undefined })) for (const m of musclesOf(ex)) heat[m] = (heat[m] || 0) + 1;
    eqCount = {};
    for (const ex of S.search(index, els.q.value, { ...filters, equipment: undefined })) { const k = ex.equipment || "none"; eqCount[k] = (eqCount[k] || 0) + 1; }
    els.chips.querySelectorAll(".chip").forEach((c) => {
      const n = heat[c.dataset.m] || 0;
      c.querySelector("small").textContent = n.toLocaleString(lang);
      c.classList.toggle("zero", !n);
    });
    buildEquipment();
    syncMuscleUi();
    updateSteps();
    shown = 0;
    els.results.textContent = "";
    renderMore();
    els.count.textContent = tr("count")(current.length, data.length);
    els.empty.hidden = current.length > 0;
    showUnderstood();
    if (!keepUrl) writeUrl();
  }

  // 検索の状態を URL に残して、そのまま共有できるようにします。
  function writeUrl(id) {
    const p = new URLSearchParams();
    if (els.q.value.trim()) p.set("q", els.q.value.trim());
    S.FILTER_KEYS.forEach((k) => filters[k] && p.set(k, filters[k]));
    if (els.secondary.checked) p.set("secondary", "1");
    if (lang !== guessLang()) p.set("lang", lang);
    if (id) p.set("id", id);
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }
  function readUrl() {
    const p = new URLSearchParams(location.search);
    els.q.value = p.get("q") || "";
    S.FILTER_KEYS.forEach((k) => (filters[k] = p.get(k) || undefined));
    els.secondary.checked = p.get("secondary") === "1";
    return p.get("id");
  }

  // ---------- 詳細 ----------
  function fillList(id, items) {
    const box = $(id);
    box.textContent = "";
    // 元データに空の行がまれにあるので、空の手順は出しません。
    items.filter((x) => String(x).trim()).forEach((x) => box.appendChild(el("li", { text: x })));
  }
  function openDetail(id, updateUrl) {
    const ex = byId.get(id);
    if (!ex) return;
    const name = nameOf(ex);
    $("d-name").textContent = name;
    $("d-sub").textContent = name !== ex.name ? ex.name : "";
    const imgs = $("d-images");
    imgs.textContent = "";
    ex.images.forEach((src, i) => imgs.appendChild(el("img", { src: imgUrl(src), alt: `${name} ${i + 1}`, loading: "lazy" })));
    imgs.hidden = !ex.images.length;
    document.querySelector(".d-top").classList.toggle("noimg", !ex.images.length);
    paintMap($("d-map"), musclesOf(ex), null, ex.secondaryMuscles || []);
    const tags = $("d-tags");
    tags.textContent = "";
    [ex.category, ex.equipment || "none", ex.level, ex.force, ex.mechanic].filter(Boolean)
      .forEach((v) => tags.appendChild(el("li", { text: val(v) })));
    const dl = $("d-muscles");
    dl.textContent = "";
    dl.appendChild(el("dt", { text: tr("primary") }));
    dl.appendChild(el("dd", { text: (ex.primaryMuscles || []).map(val).join(", ") || (ex.bodyPart ? val("bp:" + ex.bodyPart) : "—") }));
    if ((ex.secondaryMuscles || []).length) {
      dl.appendChild(el("dt", { class: "sec", text: tr("secondaryM") }));
      dl.appendChild(el("dd", { text: ex.secondaryMuscles.map(val).join(", ") }));
    }

    // AI が書いた詳しい説明 (画像か手順の文章が無い種目)。その言語が無ければ英語で出します。
    const gAll = guides[ex.id];
    const g = gAll && (gAll[lang] || gAll.en);
    $("d-guide").hidden = !g;
    if (g) {
      const note = $("d-guide-note");
      note.textContent = g.note || "";
      note.hidden = !g.note;
      $("d-guide-setup").textContent = g.setup;
      fillList("d-guide-steps", g.steps);
      fillList("d-guide-tips", g.tips);
      // 呼吸と「効かせるコツ」は、新しい形の説明にだけあります。
      $("d-guide-breath").textContent = g.breathing || "";
      $("d-guide-breath-box").hidden = !g.breathing;
      fillList("d-guide-focus", g.focus || []);
      $("d-guide-focus-box").hidden = !(g.focus || []).length;
    }

    // 元データの手順。英語以外では AI 翻訳を出し、原文も開けるようにします。
    const en = ex.instructions || [];
    const t = lang !== "en" && i18n[ex.id] && i18n[ex.id][lang];
    const translated = t && t.steps && en.length && t.steps.length === en.length ? t.steps : null;
    $("d-howto").hidden = !en.length;
    // 詳しい説明がある種目では、こちらは「元の説明」です。
    $("d-howto-title").textContent = gAll ? (translated ? tr("howto") : tr("original")) : tr("howto");
    $("d-tr-badge").hidden = !translated;
    fillList("d-steps", translated || en);
    $("d-orig").hidden = !translated;
    $("d-orig").open = false;
    fillList("d-orig-steps", translated ? en : []);

    // wger の種目は CC-BY-SA などのため、出典・ライセンス・作者を必ず出します。
    const credit = $("d-credit");
    credit.textContent = "";
    credit.append(tr("source") + ": ");
    if (ex.attribution) {
      const a = ex.attribution;
      credit.appendChild(el("a", { href: a.url, target: "_blank", rel: "noopener", text: "wger" }));
      a.licenses.forEach((l) => {
        credit.append(" · ");
        credit.appendChild(el("a", { href: l.url, target: "_blank", rel: "noopener", text: l.name }));
      });
      const who = [a.author, ...a.imageAuthors].filter(Boolean);
      if (who.length) credit.append(" · " + [...new Set(who)].join(", "));
    } else {
      credit.appendChild(el("a", { href: "https://github.com/yuhonas/free-exercise-db", target: "_blank", rel: "noopener", text: "free-exercise-db" }));
      credit.append(" · Unlicense");
    }
    // PFC計算ツールは日本語のアプリなので、日本語表示のときだけ日本語名で記録します。
    $("d-pfc").href = S.pfcUrl(ex, lang === "ja" ? name : undefined);
    $("d-share").textContent = tr("copyLink");
    if (updateUrl) writeUrl(id);
    if (!els.detail.open) els.detail.showModal();
  }

  els.detail.addEventListener("close", () => writeUrl());
  $("d-close").addEventListener("click", () => els.detail.close());
  els.detail.addEventListener("click", (e) => { if (e.target === els.detail) els.detail.close(); });
  $("d-share").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      $("d-share").textContent = tr("copied");
    } catch (e) { /* コピーできない環境ではアドレス欄から共有してもらいます */ }
  });

  let timer = 0;
  els.q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => run(), 120); });
  els.secondary.addEventListener("change", () => run());
  els.more.addEventListener("click", renderMore);
  els.reset.addEventListener("click", () => {
    els.q.value = "";
    S.FILTER_KEYS.forEach((k) => (filters[k] = undefined));
    els.secondary.checked = false;
    buildFilters();
    syncMuscleUi();
    run();
    els.q.focus();
  });
  els.lang.addEventListener("change", () => {
    lang = LANGS.includes(els.lang.value) ? els.lang.value : "en";
    try { localStorage.setItem("exs-lang", lang); } catch (e) { /* 覚えられなくても動きます */ }
    applyLang();
    run();
  });

  setupBodyMap();
  loadHitMaps();
  // 翻訳ファイルが無くても英語で動くよう、読めなかったものは空にします。
  const load = (u) => fetch(u).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  Promise.all(["data/exercises.json", "data/wger.json", "data/guides.json", "data/i18n.json"].map(load))
    .then(([free, wger, guideMap, tr18]) => {
      data = [].concat(free, wger);
      guides = guideMap;
      i18n = tr18;
      index = S.buildIndex(data, i18n);
      byId = new Map(data.map((ex) => [ex.id, ex]));
      const id = readUrl();
      applyLang();
      run(true);
      if (id) openDetail(id, false);
    });
})();
