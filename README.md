# Exercise Search / 筋トレ種目サーチ

Search 1,700+ exercises — barbell, dumbbell, bodyweight, cable, machine, kettlebell, stretching and more — by name, body part, equipment, or simply by saying what you want to train. English, 日本語 and 中文. Free, no sign-up, no tracking.

**▶ https://nebourocket.github.io/exercise-search/**

バーベル・ダンベル・自重・ケーブル・マシン・ストレッチなど 1,700 種目以上を、名前・部位・器具、または「二の腕を引き締めたい」のような言い方で探せる無料のウェブアプリです。英語・日本語・中国語 (簡体字) で表示できます。

## Features

- **Say what you want to train** — `二の腕を引き締めたい`, `お腹を鍛えたい`, `想练臀部`, `train my back`, `abs at home`. The app shows which body part it understood and lists exercises whose primary muscle matches first.
- **Body map** — tap a muscle on the front/back figure to filter; every exercise shows its primary (red) and secondary (yellow) muscles on the figure.
- **Three languages** — UI, exercise names and instructions in English / 日本語 / 中文 (translations are AI-made and labeled; the English original is one tap away).
- Filters: muscle, equipment, type, level, force, mechanic (optionally include secondary muscles)
- Detail view with images, step-by-step instructions, and detailed guides for exercises that lack images or text
- Shareable URLs (`?q=squat&equipment=barbell&lang=ja&id=Barbell_Squat`), light / dark theme
- **PFC Calculator link** — "Log in PFC Calculator" opens [PFC Calculator](https://nebourocket.github.io/pfc-calculator/) with the exercise name and muscle group already filled in

## How it works

A static site (HTML + CSS + vanilla JS, no build step) on GitHub Pages. All search runs in the browser over `data/exercises.json` (free-exercise-db), `data/wger.json` (wger), `data/guides.json` (AI-written guides) and `data/i18n.json` (Japanese / Chinese names and instructions). Exercise images are loaded from each source; the body map lives in `assets/muscles/`.

## Development

```bash
python3 -m http.server 8000      # open http://localhost:8000
node tests/search.test.js        # search and PFC-link tests
bash tools/update_data.sh        # refresh data from free-exercise-db and wger
bash tools/build_muscles.sh      # refresh the body-map SVGs (recolored to Nord red/yellow)
```

## Data & license

- [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) — `data/exercises.json` and its images, The Unlicense (public domain).
- [wger](https://wger.de) — `data/wger.json` and its images, via the official API. Each exercise is CC-BY-SA 3.0, CC-BY-SA 4.0 or CC0 as set by its author; the license and authors are shown on every exercise and stored in its `attribution` field. `data/wger.json` is shared under the same licenses (share-alike). AI-generated images are excluded.

- `data/guides.json` — detailed guides (setup, steps, common mistakes; English, Japanese and Chinese) for every exercise that has no image or no written instructions (691 in total). **Written by AI** from each exercise's name, equipment, muscles and original wger description, and labeled as such in the app. For entries whose original has no usable instructions (other-language names, routines, machine-specific entries, swim sessions, etc.), the guide was written from researched sources or standard technique, and a note at the top of the guide says exactly what it is based on and what is unconfirmed. Every guide was then cross-reviewed by two different AI model families (Claude and GPT) against its original wger description: each proposed corrections to the other's work, and disagreements were resolved against the original description, with safety taking priority. Shared under CC-BY-SA 4.0 as a derivative of the wger descriptions. Corrections are very welcome.
- `data/i18n.json` — Japanese and Simplified Chinese names and instruction translations for all 1,781 exercises (the Chinese versions of the AI guides are in `data/guides.json`). **Machine-translated by AI** (GPT), then every item was checked step by step against the English original by a second AI (Claude) and corrected — e.g. swapped grips in names (反握/正握), left/right, merged steps, and imperial units now with metric; the app labels them "AI translation" and shows the English original. Shared under the same licenses as the source text (CC-BY-SA for wger text).
- `assets/muscles/` — body map: [Muscular_system.svg / Muscular_system-back.svg](https://commons.wikimedia.org/wiki/File:Muscular_system.svg) by Termininja (Wikimedia Commons), split into per-muscle layers by the [wger project](https://github.com/wger-project/wger); recolored here. CC BY-SA 3.0.

Thank you to both projects and all contributors!
- Code: MIT

Contributions (new exercises, Japanese names, fixes) are welcome via Issues and PRs.

## 🤖 AI への注意

- `data/*.json` は手で編集しない。`tools/update_data.sh` で元データ (free-exercise-db・wger 公式 API) から取り直す。他社サイトのスクレイピングはしない。
- `data/guides.json` は画像のない種目の説明 (AI が書いたもの)。画像は AI で作らない (フォームの誤りがけがにつながるため)。説明を直すときは手で直してよいが、「AI が書いた説明」の表示は消さない。
- `data/guides.json` の新しい形 (2026-11-12〜) は `setup`・`steps` (5〜8)・`breathing`・`focus` (狙った部位に効かせるコツ)・`tips`、日英中で数をそろえる。画像のある種目にも付ける。Claude が書き、GPT (codex) がレビューし、確かめた指摘だけを直してから出す。元データと食い違う種目や元の説明があいまいな種目は `note` にそう書く。
- wger の種目は CC-BY-SA のため、詳細画面の出典・ライセンス・作者 (`attribution`) の表示を消さない。
- PFC計算ツールとの連携は `search.js` の `PFC_MUSCLE` / `pfcUrl` (渡す値: `?exercise=<名前 40 文字まで>&muscle=<胸|背中|脚|肩|腕|腹|その他>`)。受け取り側は nebourocket/pfc-calculator の `app.js`。形を変えるときは両方を直す。
- `data/i18n.json` (種目名・手順の日本語・中国語) は AI 翻訳。「AI 翻訳」の表示と英語の原文を消さない。手順は原文と同じ数・同じ順で持つ (数がずれた翻訳は画面が原文に戻す)。
- 体の図は `assets/muscles/` (CC BY-SA 3.0)。クリックの当たり判定は重ね図の色で決めているので、当たり判定の形を手で描かない。取り直しは `tools/build_muscles.sh`。
- 「ここを鍛えたい」検索は `search.js` の `SYNONYMS` (言い方 → 部位) と `INTENT_PATTERNS` (読み飛ばす言い回し)。言い方を足したら `tests/search.test.js` にも足す。
- 変更は Issue → ブランチ → PR → マージ。`node tests/search.test.js` を通してから。
