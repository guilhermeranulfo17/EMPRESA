#!/usr/bin/env bash
# usage: finish2.sh VDIR COMPID DUR OUT.mp4   (VDIR: bottom.mp4, tempos.json, hits.json; Remotion composition COMPID)
set -e; V=$1; ID=$2; D=$3; OUT=$4; T=$(cd "$(dirname "$0")" && pwd); PY=/home/user/EMPRESA/.claude/skills/effects/.venv/bin/python
SK=/home/user/EMPRESA/.claude/skills/reels-split-motion/scripts; RMO=${RMO:?set RMO to the Remotion project folder}
(cd $RMO && npx remotion render src/index.ts $ID $V/motion_ex.mp4 --concurrency=3 ${GL:+--gl=$GL} --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --log=error > $V/render_ex.log 2>&1)
cd $V
[ -f bottom_dn.mp4 ] || ffmpeg -v error -y -i bottom.mp4 -map 0:v -map 0:a -c:v copy -af 'afftdn=nr=12:nf=-40:tn=1' -c:a aac -b:a 192k bottom_dn.mp4
python3 -c "
import json;t=json.load(open('tempos.json'));json.dump({'hook':[],'mute':[],'segs':[[x['s'],x['e'],x['text']] for x in t]},open('legendas.json','w'),ensure_ascii=False)"
python3 $SK/caps_split.py legendas.json legendas.ass > /dev/null
$PY $T/sfxkit.py hits_ex.json tempos.json $D sfx_ex.wav > /dev/null
[ -f trilha.wav ] || $PY $T/drama.py trilha.wav --dur $D --lufs -32 > /dev/null
bash $SK/compose.sh $V/motion_ex.mp4 bottom_dn.mp4 legendas.ass trilha.wav sfx_ex.wav $OUT 1.0 -7 1.0
i=0; for f in 0.04 0.18 0.32 0.46 0.6 0.74 0.88 0.97; do t=$(python3 -c "print($D*$f)"); ffmpeg -v error -y -ss $t -i $OUT -frames:v 1 -vf scale=270:480 ex$i.jpg; i=$((i+1)); done
ffmpeg -v error -y -i ex%d.jpg -vf tile=8x1 check_ex.jpg
