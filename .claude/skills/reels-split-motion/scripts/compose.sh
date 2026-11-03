#!/usr/bin/env bash
# Stack the motion panel over the speaker, burn the seam captions, mix voice + music + SFX, master.
# usage: compose.sh MOTION_9x16.mp4 BOTTOM.mp4 CAPS.ass TRILHA.wav SFX.wav OUT.mp4 [HOLD_S=1.0] [SFX_DB=-7]
#   MOTION: the motion-reel render (9x16, motion drawn in the top 960 px)
#   BOTTOM: build_bottom.py output (1080x960 with the voice); its last frame is held HOLD_S seconds
set -e
MO="$1"; BO="$2"; AS="$3"; MU="$4"; FX="$5"; OUT="$6"; HOLD="${7:-1.0}"; SDB="${8:--7}"
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../../.." && pwd)"
FONTS="$ROOT/.claude/skills/effects/fonts"; ED="$ROOT/.claude/skills/editar-video/scripts"
TMP="$(mktemp -d)"
DUR=$(python3 -c "import sys;print(float(sys.argv[1])+float(sys.argv[2]))" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$BO")" "$HOLD")
ffmpeg -v error -y -i "$MO" -i "$BO" -filter_complex \
 "[0:v]crop=1080:960:0:0,fps=30,setsar=1[top];[1:v]tpad=stop_mode=clone:stop_duration=$HOLD,setsar=1[bot];[top][bot]vstack=inputs=2,ass=$AS:fontsdir=$FONTS,format=yuv420p[v];[1:a]apad=pad_dur=$HOLD,atrim=0:$DUR[a]" \
 -map "[v]" -map "[a]" -t "$DUR" -c:v libx264 -crf 18 -preset medium -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k "$TMP/fxcap.mp4"
ffmpeg -v error -y -i "$FX" -af "volume=${SDB}dB,aresample=48000" -ac 2 "$TMP/sfx.wav"
bash "$ED/mix.sh" "$TMP/fxcap.mp4" "$MU" "$TMP/sfx.wav" "$TMP/mix.mp4" 0.45 >/dev/null
ffmpeg -v error -y -i "$TMP/mix.mp4" -map 0:v -map 0:a -c:v copy \
 -af "aresample=192000,alimiter=limit=0.8:level=false:attack=0.5:release=60,aresample=48000" -c:a aac -b:a 192k -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2 | tr -s ' ' | paste -sd' '
rm -rf "$TMP"; echo "Done: $OUT ($DUR s)"
