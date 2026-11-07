#!/usr/bin/env bash
# usage: RMO=<remotion dir> finish.sh VDIR DUR OUT.mp4   (VDIR: bottom.mp4, tempos.json, spec.json)
set -e; V=$1; N=$2; OUT=$3; T=$(cd "$(dirname "$0")" && pwd); PY=/home/user/EMPRESA/.claude/skills/effects/.venv/bin/python

SK=/home/user/EMPRESA/.claude/skills/reels-split-motion/scripts

D=$2
RMO=${RMO:?set RMO to the Remotion project folder (copy of reels-split-motion/remotion with npm i)}
python3 -c "import json;s=json.load(open('$V/spec.json'));s['duration']=$D;json.dump(s,open('$V/props.json','w'),ensure_ascii=False)"
VID=$V/motion.mp4
if [ ! -f $VID ] || [ $V/spec.json -nt $VID ]; then (cd $RMO && npx remotion render src/index.ts Split $VID --props=$V/props.json --concurrency=3 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --log=error > $V/render.log 2>&1); fi
cd $V
python3 $T/spec2hits.py spec.json hits.json > /dev/null
# light denoise of the voice (background knocking on 07/11)
ffmpeg -v error -y -i bottom.mp4 -map 0:v -map 0:a -c:v copy -af 'afftdn=nr=12:nf=-40:tn=1' -c:a aac -b:a 192k bottom_dn.mp4
python3 -c "
import json;t=json.load(open('tempos.json'));json.dump({'hook':[],'mute':[],'segs':[[x['s'],x['e'],x['text']] for x in t]},open('legendas.json','w'),ensure_ascii=False)"
python3 $SK/caps_split.py legendas.json legendas.ass > /dev/null
$PY $T/sfxkit.py hits.json tempos.json $D sfx.wav > /dev/null
read HITS PULSE < <(python3 -c "
import json;s=json.load(open('spec.json'))['scenes'];a=[x['a'] for x in s[1:]]
print(','.join(str(v) for v in a[:3]) or '1', f'{a[0] if a else 1},{s[-1][\"a\"]}')")
$PY $T/drama.py trilha.wav --dur $D --hits $HITS --pulse $PULSE --lufs -32 > /dev/null
bash $SK/compose.sh $VID bottom_dn.mp4 legendas.ass trilha.wav sfx.wav $OUT 1.0 -7 1.0
i=0; for f in 0.05 0.2 0.35 0.5 0.62 0.75 0.87 0.97; do t=$(python3 -c "print($D*$f)"); ffmpeg -v error -y -ss $t -i $OUT -frames:v 1 -vf scale=270:480 chk$i.jpg; i=$((i+1)); done
ffmpeg -v error -y -i chk%d.jpg -vf tile=8x1 check_final.jpg
