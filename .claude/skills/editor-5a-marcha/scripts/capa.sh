#!/usr/bin/env bash
# usage: capa.sh SRC TIME "LINHA BRANCA" "LINHA AMARELA" OUT.jpg [ZOOM=1.0]
S="$1"; T="$2"; L1="$3"; L2="$4"; O="$5"; Z="${6:-1.0}"
F=/home/user/EMPRESA/.claude/skills/effects/fonts/ArchivoBlack-Regular.ttf
TM="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
ffmpeg -v error -y -ss "$T" -i "$S" -frames:v 1 -vf "scale=iw/2:ih/2,$TM,crop=iw/$Z:ih/$Z:(iw-iw/$Z)/2:(ih-ih/$Z)*0.35,scale=1080:1920:flags=lanczos,eq=contrast=1.05:saturation=1.1,drawbox=y=1250:w=iw:h=670:color=black@0.35:t=fill,drawtext=fontfile=$F:text='$L1':fontsize=${FS1:-104}:fontcolor=white:x=(w-tw)/2:y=1330:shadowcolor=black@0.6:shadowx=4:shadowy=4,drawtext=fontfile=$F:text='$L2':fontsize=100:fontcolor=0x14171C:box=1:boxcolor=0xFFD60A:boxborderw=26:x=(w-tw)/2:y=1495" -q:v 2 "$O"
