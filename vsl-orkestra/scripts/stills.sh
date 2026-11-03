#!/bin/bash
# Stills de conferência: bash scripts/stills.sh PASTA "tempo1 tempo2 ..." [props-json]
OUT=$1; TEMPOS=$2; PROPS=${3:-'{"buffetName":"seu buffet"}'}
mkdir -p "$OUT"
npx remotion bundle --out-dir /tmp/vsl-bundle > /dev/null 2>&1
for t in $TEMPOS; do
  fr=$(python3 -c "print(round($t*30))")
  npx remotion still /tmp/vsl-bundle OrkestraVSL "$OUT/s-$(printf '%05.1f' $t).png" --frame=$fr --scale=0.5 --props="$PROPS" > /dev/null 2>&1 || echo "falhou $t"
done
