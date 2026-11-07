#!/usr/bin/env bash
# Transcribes each block of the bottom panel (frames.txt order): read it to catch repeated or missing words.
D=$1; PY=/home/user/EMPRESA/.claude/skills/effects/.venv/bin/python; T=$(cd "$(dirname "$0")" && pwd)
while read k f; do d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $D/${k}_bottom.mp4); printf "%s " $k; $PY $T/win.py $D/${k}_bottom.mp4 0-$d 2>/dev/null < /dev/null; done < $D/frames.txt
