#!/bin/bash
# Narração final = narração v1 até 44,40 s (na pausa depois de "quem já quer fechar.") + frase final v2
# a partir de 44,75 s. Gera public/audio/narracao.mp3.
set -e
cd "$(dirname "$0")/../public/audio"
ffmpeg -v error -y -i narracao-v1.mp3 -i frase-final-v2.mp3 -filter_complex \
"[0:a]atrim=0:44.40,afade=t=out:st=44.36:d=0.04,aresample=44100,apad=pad_dur=0.35[a];\
[1:a]aresample=44100[b];[a][b]concat=n=2:v=0:a=1[o]" -map "[o]" -c:a libmp3lame -b:a 192k narracao.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 narracao.mp3
