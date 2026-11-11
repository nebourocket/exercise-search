// 画面の動き。検索そのものは search.js にあります。
(function () {
  "use strict";
  const S = window.ExSearch;
  const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  const PAGE = 48;
  // free-exercise-db の画像は相対パス、wger の画像は完全な URL です。
  const imgUrl = (src) => (/^https?:/.test(src) ? src : IMG_BASE + src);

  // 画面の文字 (英語と日本語)。
  const T = {
    en: {
      title: "Exercise Search", searchLabel: "Search exercises",
      placeholder: "e.g. bench press, dumbbell chest, pull-up",
      secondary: "Include secondary muscles", reset: "Clear filters", more: "Show more",
      empty: "No exercises found. Try fewer words or clear the filters.",
      howto: "How to", logPfc: "Log in PFC Calculator", copyLink: "Copy link", copied: "Copied!",
      dataFrom: "Exercise data and images:", noImage: "No image", noImageGuide: "No image · detailed guide", source: "Source",
      guideTitle: "Detailed guide", aiBadge: "Written by AI", tipsTitle: "Common mistakes & safety",
      aiNote: "This exercise has no image, so this text was written by AI from the original description. It may contain mistakes — check with a coach if unsure.",
      howtoOrig: "Original description",
      disclaimer: "For general information only. Warm up, use safe loads, and consult a professional if you have an injury or health condition.",
      count: (n, all) => `${n.toLocaleString("en")} of ${all.toLocaleString("en")} exercises`,
      all: "All", primary: "Primary", secondaryM: "Secondary",
      muscle: "Muscle", equipment: "Equipment", category: "Type", level: "Level", force: "Force", mechanic: "Mechanic",
      lang: "日本語",
    },
    ja: {
      title: "筋トレ種目サーチ", searchLabel: "種目を検索",
      placeholder: "例: ベンチプレス、胸 ダンベル、懸垂、squat",
      secondary: "補助で使う筋肉も含める", reset: "絞り込みを解除", more: "もっと見る",
      empty: "見つかりませんでした。言葉を減らすか、絞り込みを解除してください。",
      howto: "やり方 (英語)", logPfc: "PFC計算ツールに記録", copyLink: "リンクをコピー", copied: "コピーしました",
      dataFrom: "種目データと画像:", noImage: "画像なし", noImageGuide: "画像なし・詳しい説明あり", source: "出典",
      guideTitle: "詳しい説明", aiBadge: "AI が書いた説明", tipsTitle: "よくある間違いと注意点",
      aiNote: "この種目には画像がないため、元の説明をもとに AI が書いた文章です。間違いを含むことがあります。不安なときはトレーナーに確かめてください。",
      howtoOrig: "元の説明 (英語)",
      disclaimer: "一般的な情報です。ウォームアップをして無理のない重さで行い、けがや持病がある場合は専門家に相談してください。",
      count: (n, all) => `${all.toLocaleString("ja")} 種目中 ${n.toLocaleString("ja")} 件`,
      all: "すべて", primary: "主に使う筋肉", secondaryM: "補助で使う筋肉",
      muscle: "部位", equipment: "器具", category: "種類", level: "レベル", force: "動き", mechanic: "関節",
      lang: "English",
    },
  };
  // データの値の日本語名。
  const V_JA = {
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
    beginner: "初級", intermediate: "中級", expert: "上級",
    push: "押す", pull: "引く", static: "静止",
    compound: "多関節", isolation: "単関節",
  };
  const V_EN = { none: "none / unspecified" };

  let lang = "en";
  try {
    const saved = localStorage.getItem("exs-lang");
    lang = saved || (/^ja\b/i.test(navigator.language || "") ? "ja" : "en");
  } catch (e) {
    lang = /^ja\b/i.test(navigator.language || "") ? "ja" : "en";
  }
  const tr = (k) => T[lang][k];
  const val = (v) => (lang === "ja" ? V_JA[v] || v : V_EN[v] || v);

  const $ = (id) => document.getElementById(id);
  const els = {
    q: $("q"), filters: $("filters"), secondary: $("secondary"), count: $("count"), results: $("results"),
    more: $("more"), empty: $("empty"), reset: $("reset"), lang: $("lang"), detail: $("detail"),
  };

  let data = [], index = [], byId = new Map(), current = [], shown = 0;
  let guides = {}; // 画像のない種目の、AI が書いた詳しい説明 (data/guides.json)
  const filters = {};
  const selects = {};

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

  // 絞り込みのセレクトを、データに実際に出てくる値から作ります。
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
    S.FILTER_KEYS.forEach((k) => {
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
      selects[k] = s;
      els.filters.appendChild(s);
    });
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.title = tr("title");
    document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = tr(n.dataset.i18n)));
    document.querySelectorAll("[data-i18n-placeholder]").forEach((n) => (n.placeholder = tr(n.dataset.i18nPlaceholder)));
    els.lang.textContent = tr("lang");
    buildFilters();
  }

  function card(ex) {
    const src = ex.thumb || ex.images[0];
    const img = src
      ? el("img", { alt: "", loading: "lazy", width: "320", height: "240", src: imgUrl(src) })
      : el("div", { class: "noimg", text: tr(guides[ex.id] ? "noImageGuide" : "noImage") });
    const tags = el("ul", { class: "tags" }, [
      ...(ex.primaryMuscles || []).map((m) => el("li", { class: "m", text: val(m) })),
      el("li", { text: val(ex.equipment || "none") }),
      ex.level && el("li", { text: val(ex.level) }),
    ]);
    const b = el("button", { type: "button", class: "card" }, [img, el("div", { class: "body" }, [el("h2", { text: ex.name }), tags])]);
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

  function run(keepUrl) {
    filters.includeSecondary = els.secondary.checked;
    current = S.search(index, els.q.value, filters);
    shown = 0;
    els.results.textContent = "";
    renderMore();
    els.count.textContent = tr("count")(current.length, data.length);
    els.empty.hidden = current.length > 0;
    if (!keepUrl) writeUrl();
  }

  // 検索の状態を URL に残して、そのまま共有できるようにします。
  function writeUrl(id) {
    const p = new URLSearchParams();
    if (els.q.value.trim()) p.set("q", els.q.value.trim());
    S.FILTER_KEYS.forEach((k) => filters[k] && p.set(k, filters[k]));
    if (els.secondary.checked) p.set("secondary", "1");
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

  function openDetail(id, updateUrl) {
    const ex = byId.get(id);
    if (!ex) return;
    $("d-name").textContent = ex.name;
    const imgs = $("d-images");
    imgs.textContent = "";
    ex.images.forEach((src, i) => imgs.appendChild(el("img", { src: imgUrl(src), alt: `${ex.name} ${i + 1}`, loading: "lazy" })));
    imgs.hidden = !ex.images.length;
    const tags = $("d-tags");
    tags.textContent = "";
    [ex.category, ex.equipment || "none", ex.level, ex.force, ex.mechanic].filter(Boolean)
      .forEach((v) => tags.appendChild(el("li", { text: val(v) })));
    const dl = $("d-muscles");
    dl.textContent = "";
    dl.appendChild(el("dt", { text: tr("primary") }));
    dl.appendChild(el("dd", { text: (ex.primaryMuscles || []).map(val).join(", ") || "—" }));
    if ((ex.secondaryMuscles || []).length) {
      dl.appendChild(el("dt", { text: tr("secondaryM") }));
      dl.appendChild(el("dd", { text: ex.secondaryMuscles.map(val).join(", ") }));
    }
    const ol = $("d-steps");
    ol.textContent = "";
    (ex.instructions || []).forEach((s) => ol.appendChild(el("li", { text: s })));
    const hasSteps = !!(ex.instructions || []).length;
    ol.hidden = !hasSteps;
    const g = guides[ex.id] && guides[ex.id][lang];
    const howto = document.querySelector('[data-i18n="howto"]');
    howto.hidden = !hasSteps;
    howto.textContent = tr(g ? "howtoOrig" : "howto");
    $("d-guide").hidden = !g;
    if (g) {
      $("d-guide-setup").textContent = g.setup;
      for (const [id, list] of [["d-guide-steps", g.steps], ["d-guide-tips", g.tips]]) {
        const box = $(id);
        box.textContent = "";
        list.forEach((x) => box.appendChild(el("li", { text: x })));
      }
    }
    // wger の種目は CC-BY-SA などのため、出典・ライセンス・作者を必ず出します。
    const credit = $("d-credit");
    credit.textContent = "";
    if (ex.attribution) {
      const a = ex.attribution;
      credit.append(tr("source") + ": ");
      credit.appendChild(el("a", { href: a.url, target: "_blank", rel: "noopener", text: "wger" }));
      a.licenses.forEach((l) => {
        credit.append(" · ");
        credit.appendChild(el("a", { href: l.url, target: "_blank", rel: "noopener", text: l.name }));
      });
      const who = [a.author, ...a.imageAuthors].filter(Boolean);
      if (who.length) credit.append(" · " + [...new Set(who)].join(", "));
    } else {
      credit.append(tr("source") + ": ");
      credit.appendChild(el("a", { href: "https://github.com/yuhonas/free-exercise-db", target: "_blank", rel: "noopener", text: "free-exercise-db" }));
      credit.append(" · Unlicense");
    }
    $("d-pfc").href = S.pfcUrl(ex);
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
    run();
    els.q.focus();
  });
  els.lang.addEventListener("click", () => {
    lang = lang === "en" ? "ja" : "en";
    try { localStorage.setItem("exs-lang", lang); } catch (e) { /* 覚えられなくても動きます */ }
    applyLang();
    run(true);
  });

  Promise.all(["data/exercises.json", "data/wger.json", "data/guides.json"].map((u) => fetch(u).then((r) => r.json())))
    .then(([free, wger, guideMap]) => {
      data = free.concat(wger);
      guides = guideMap;
      index = S.buildIndex(data);
      byId = new Map(data.map((ex) => [ex.id, ex]));
      const id = readUrl();
      applyLang();
      run(true);
      if (id) openDetail(id, false);
    });
})();
