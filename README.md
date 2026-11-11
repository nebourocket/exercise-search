# Exercise Search / 筋トレ種目サーチ

Search 1,700+ exercises — barbell, dumbbell, bodyweight, cable, machine, kettlebell, stretching and more — by name, muscle and equipment. Free, no sign-up, no tracking.

**▶ https://nebourocket.github.io/exercise-search/**

バーベル・ダンベル・自重・ケーブル・マシン・ストレッチなど 1,700 種目以上を、名前・部位・器具で探せる無料のウェブアプリです。日本語でも検索できます (例: `胸 ダンベル`、`懸垂`、`ベンチプレス`)。

## Features

- Instant search in English or Japanese (`胸ダンベル` = chest + dumbbell)
- Filters: muscle, equipment, type, level, force, mechanic (optionally include secondary muscles)
- Detail view with start/end images and step-by-step instructions
- Shareable URLs (`?q=squat&equipment=barbell&id=Barbell_Squat`)
- English / 日本語 UI, light / dark theme
- **PFC Calculator link** — "Log in PFC Calculator" opens [PFC Calculator](https://nebourocket.github.io/pfc-calculator/) with the exercise name and muscle group already filled in

## How it works

A static site (HTML + CSS + vanilla JS, no build step) on GitHub Pages. All search runs in the browser over `data/exercises.json` (free-exercise-db) and `data/wger.json` (wger). Images are loaded from each source.

## Development

```bash
python3 -m http.server 8000      # open http://localhost:8000
node tests/search.test.js        # search and PFC-link tests
bash tools/update_data.sh        # refresh data from free-exercise-db and wger
```

## Data & license

- [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) — `data/exercises.json` and its images, The Unlicense (public domain).
- [wger](https://wger.de) — `data/wger.json` and its images, via the official API. Each exercise is CC-BY-SA 3.0, CC-BY-SA 4.0 or CC0 as set by its author; the license and authors are shown on every exercise and stored in its `attribution` field. `data/wger.json` is shared under the same licenses (share-alike). AI-generated images are excluded.

- `data/guides.json` — detailed guides (setup, steps, common mistakes; English and Japanese) for 626 wger exercises that have no image. **Written by AI** from each exercise's name, equipment, muscles and original wger description, and labeled as such in the app. Exercises that could not be identified confidently were left without a guide. Shared under CC-BY-SA 4.0 as a derivative of the wger descriptions. Corrections are very welcome.

Thank you to both projects and all contributors!
- Code: MIT

Contributions (new exercises, Japanese names, fixes) are welcome via Issues and PRs.

## 🤖 AI への注意

- `data/*.json` は手で編集しない。`tools/update_data.sh` で元データ (free-exercise-db・wger 公式 API) から取り直す。他社サイトのスクレイピングはしない。
- `data/guides.json` は画像のない種目の説明 (AI が書いたもの)。画像は AI で作らない (フォームの誤りがけがにつながるため)。説明を直すときは手で直してよいが、「AI が書いた説明」の表示は消さない。
- wger の種目は CC-BY-SA のため、詳細画面の出典・ライセンス・作者 (`attribution`) の表示を消さない。
- PFC計算ツールとの連携は `search.js` の `PFC_MUSCLE` / `pfcUrl` (渡す値: `?exercise=<名前 40 文字まで>&muscle=<胸|背中|脚|肩|腕|腹|その他>`)。受け取り側は nebourocket/pfc-calculator の `app.js`。形を変えるときは両方を直す。
- 変更は Issue → ブランチ → PR → マージ。`node tests/search.test.js` を通してから。
