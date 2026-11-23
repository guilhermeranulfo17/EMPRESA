#!/usr/bin/env bash
# Mixagem do estilo aprovado: voz isolada por cima (comprimida), música presente que abaixa só um pouco nas falas.
# uso: mix_musica.sh VOZ.wav MUSICA.wav SFX.wav IMAGEM.mp4 SAIDA.mp4 [GANHO_MUSICA=0.85] [RAZAO=2] [JANELA_EXTRA="a,b,fator"]
#   JANELA_EXTRA abaixa a música só num trecho (ex.: fala caindo no refrão): "40.8,47.6,0.72"
# Alvo: voz 6 a 9 dB acima da música nas falas, -14 LUFS, pico abaixo de -1 dBTP (o limitador deixa ~-3).
set -e
VOZ="$1"; MUS="$2"; FX="$3"; IMG="$4"; OUT="$5"; MG="${6:-0.85}"; RT="${7:-2}"; JX="${8:-0,0,1}"
IFS=, read -r JA JB JF <<< "$JX"
T=$(mktemp -d)
VOL="volume='$MG*if(between(t,$JA,$JB),$JF,1)':eval=frame"
ffmpeg -v error -y -i "$VOZ" -i "$MUS" -i "$FX" -filter_complex \
"[0:a]acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-15:TP=-2:LRA=9,aresample=48000,asplit=2[voz][key];\
[1:a]aresample=48000,$VOL[mus];[mus][key]sidechaincompress=threshold=0.04:ratio=$RT:attack=25:release=450:makeup=1[duck];\
[2:a]aresample=48000[fx];[voz][duck][fx]amix=inputs=3:duration=first:normalize=0[pre]" -map "[pre]" -c:a pcm_s24le "$T/pre.wav"
J=$(ffmpeg -i "$T/pre.wav" -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -v error -y -i "$T/pre.wav" -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5,aresample=192000,alimiter=limit=0.70:attack=1:release=80:level=false,aresample=48000" -c:a pcm_s24le "$T/post.wav"
ffmpeg -v error -y -i "$IMG" -i "$T/post.wav" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 11M -bufsize 22M -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart -shortest "$OUT"
ffmpeg -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
