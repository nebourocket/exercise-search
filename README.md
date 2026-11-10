# Exercise Search / 筋トレ種目サーチ

Search 870+ exercises — barbell, dumbbell, bodyweight, cable, machine, kettlebell, stretching and more — by name, muscle and equipment. Free, no sign-up, no tracking.

**▶ https://nebourocket.github.io/exercise-search/**

バーベル・ダンベル・自重・ケーブル・マシン・ストレッチなど 870 種目以上を、名前・部位・器具で探せる無料のウェブアプリです。日本語でも検索できます (例: `胸 ダンベル`、`懸垂`、`ベンチプレス`)。

## Features

- Instant search in English or Japanese (`胸ダンベル` = chest + dumbbell)
- Filters: muscle, equipment, type, level, force, mechanic (optionally include secondary muscles)
- Detail view with start/end images and step-by-step instructions
- Shareable URLs (`?q=squat&equipment=barbell&id=Barbell_Squat`)
- English / 日本語 UI, light / dark theme
- **PFC Calculator link** — "Log in PFC Calculator" opens [PFC Calculator](https://nebourocket.github.io/pfc-calculator/) with the exercise name and muscle group already filled in

## How it works

A static site (HTML + CSS + vanilla JS, no build step) on GitHub Pages. All search runs in the browser over `data/exercises.json`. Images are loaded from the free-exercise-db repository.

## Development

```bash
python3 -m http.server 8000      # open http://localhost:8000
node tests/search.test.js        # search and PFC-link tests
bash tools/update_data.sh        # refresh data from free-exercise-db
```

## Data & license

- Exercise data and images: [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) — The Unlicense (public domain). Thank you!
- Code: MIT

Contributions (new exercises, Japanese names, fixes) are welcome via Issues and PRs.

## 🤖 AI への注意

- `data/exercises.json` は手で編集しない。`tools/update_data.sh` で元データから取り直す。他社サイトのスクレイピングはしない。
- PFC計算ツールとの連携は `search.js` の `PFC_MUSCLE` / `pfcUrl` (渡す値: `?exercise=<名前 40 文字まで>&muscle=<胸|背中|脚|肩|腕|腹|その他>`)。受け取り側は nebourocket/pfc-calculator の `app.js`。形を変えるときは両方を直す。
- 変更は Issue → ブランチ → PR → マージ。`node tests/search.test.js` を通してから。
