#!/usr/bin/env bash
# Sets up the Remotion motion project in a work folder. usage: setup_remotion.sh DEST   (then: RMO=DEST finish.sh ...)
set -e; DEST=$1; HERE="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$DEST" && cp -r "$HERE/reels-split-motion/remotion/." "$DEST/"
mkdir -p "$DEST/public/fonts" && cp "$HERE/effects/fonts/ArchivoBlack-Regular.ttf" "$HERE/effects/fonts/Inter.ttf" "$DEST/public/fonts/"
cd "$DEST" && npm i --silent && echo "Remotion pronto em $DEST"
