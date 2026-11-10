#!/usr/bin/env bash
# 種目データを元のリポジトリ (free-exercise-db) の最新版に入れ替えます。
# 実行: bash tools/update_data.sh   (そのあと node tests/search.test.js で確かめます)
set -euo pipefail
cd "$(dirname "$0")/.."
curl -fsSL -o data/exercises.json https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json
node -e 'const d=require("./data/exercises.json"); if(!Array.isArray(d)||d.length<500) throw new Error("unexpected data"); console.log(d.length+" exercises")'
