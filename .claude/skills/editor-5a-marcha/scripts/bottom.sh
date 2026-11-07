#!/usr/bin/env bash
# Tight bottom panel, block by block. usage: bottom.sh SRC.MOV DIR
#   DIR/cuts_tight.json (from refine.py) and DIR/frames.txt ("b1 open" / "b2 close" per line, in order)
#   writes DIR/<bN>_bottom.mp4 (+ map) and DIR/bottom.mp4
set -e; SRC=$1; DIR=$2; SK="$(cd "$(dirname "$0")/../../reels-split-motion/scripts" && pwd)"; cd "$DIR"; : > list.txt
while read k f; do
  if [ "$f" = close ]; then A="--cx 0.5 --cy 0.49 --crop-h 1670"; else A="--cx 0.5 --cy 0.50 --crop-h 1920"; fi
  python3 $SK/build_bottom.py "$SRC" cuts_tight.json $k . $A --hdr --tight < /dev/null
  echo "file '${k}_bottom.mp4'" >> list.txt
done < frames.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c:v libx264 -crf 16 -preset medium -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k bottom.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 bottom.mp4
