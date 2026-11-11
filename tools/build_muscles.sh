#!/usr/bin/env bash
# 体の図を wger のリポジトリから取り、筋肉の重ね図を 2 色 (主=赤・補助=黄、Nord) に塗り直して assets/muscles/ に置きます。
# 元の図: Wikimedia Commons "Muscular_system.svg" / "Muscular_system-back.svg" (Termininja, CC BY-SA 3.0)、wger が部位ごとに分けたもの。
# 実行: bash tools/build_muscles.sh
set -euo pipefail
cd "$(dirname "$0")/.."
B=https://raw.githubusercontent.com/wger-project/wger/master/wger/core/static/images/muscles
out=assets/muscles
mkdir -p "$out"
curl -fsSL -o "$out/front.svg" "$B/muscular_system_front.svg"
curl -fsSL -o "$out/back.svg" "$B/muscular_system_back.svg"
for n in $(seq 1 15); do
  svg=$(curl -fsSL "$B/main/muscle-$n.svg")
  printf '%s' "$svg" | sed 's/#fc0000/#bf616a/gI' > "$out/m$n.svg"
  printf '%s' "$svg" | sed 's/#fc0000/#ebcb8b/gI' > "$out/s$n.svg"
done
ls "$out" | wc -l
