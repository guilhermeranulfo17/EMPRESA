#!/usr/bin/env bash
# usage: mix.sh VIDEO_WITH_FX.mp4 TRILHA.wav SFX.wav OUT.mp4 [MUSIC_GAIN=0.55]
# Voice to about -16 LUFS, music ducked under the voice, SFX at kit level; final -14 LUFS, true peak under -1 dBTP.
set -e
V="$1"; M="$2"; X="$3"; O="$4"; MG="${5:-0.55}"
ffmpeg -v error -y -i "$V" -i "$M" -i "$X" -filter_complex \
"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-16:TP=-2:LRA=11,aresample=48000,asplit=2[voz][key];\
[1:a]aresample=48000,volume=$MG[mus];[mus][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[duck];\
[2:a]anull[fx];[voz][duck][fx]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$O"
echo "Done: $O"
