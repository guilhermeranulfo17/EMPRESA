#!/bin/bash
# Render final para o WhatsApp: master quase sem perda (CRF 10) + H.264 em duas passadas mirando ~15,5 MB.
# uso: bash scripts/final.sh "Nome do Buffet" out/arquivo.mp4
set -e
NOME=${1:-seu buffet}; SAIDA=${2:-out/orkestra-vsl.mp4}
MASTER=$(mktemp -d)/master.mp4
npx remotion render OrkestraVSL "$MASTER" --codec=h264 --crf=10 --audio-codec=aac --audio-bitrate=320k --props="{\"buffetName\":\"$NOME\"}" > /dev/null
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MASTER")
VB=$(python3 -c "print(int((15.5*8*1000*1000/$DUR - 192000)/1000))")
cd "$(dirname "$MASTER")"
ffmpeg -v error -y -i master.mp4 -c:v libx264 -preset veryslow -b:v ${VB}k -pass 1 -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -v error -y -i master.mp4 -c:v libx264 -preset veryslow -b:v ${VB}k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart saida.mp4
cd - > /dev/null
mv "$(dirname "$MASTER")/saida.mp4" "$SAIDA"
rm -rf "$(dirname "$MASTER")"
ls -la "$SAIDA"
