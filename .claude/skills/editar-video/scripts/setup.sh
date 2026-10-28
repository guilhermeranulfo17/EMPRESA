#!/usr/bin/env bash
# One-time setup for /editar-video. Safe to run again: prints READY when everything is in place.
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"; ROOT="$(cd "$HERE/../../.." && pwd)"
FX="$ROOT/.claude/skills/effects"; PY="$FX/.venv/bin/python"; CACHE="$HOME/.cache/editar-video"
bash "$FX/scripts/setup.sh" | tail -1
# MediaPipe needs libEGL on Linux
if [ "$(uname)" = Linux ] && ! ldconfig -p | grep -q libEGL.so.1; then
  (apt-get install -y -q libegl1 libgles2 >/dev/null 2>&1 || (apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libegl1 libgles2 >/dev/null 2>&1)) || echo "NEED_LIBEGL"
fi
"$PY" -c "import sherpa_onnx, soundfile, librosa" 2>/dev/null || "$PY" -m pip install -q sherpa-onnx soundfile librosa
# Whisper (small, multilingual) for Portuguese timings, from GitHub releases
if [ ! -f "$CACHE/sherpa-onnx-whisper-small/small-tokens.txt" ]; then
  mkdir -p "$CACHE" && curl -sL -m 600 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 | tar xj -C "$CACHE"
fi
# SFX Kit (CC0) in the project root
[ -f "$ROOT/sfx-kit/sounds.json" ] || (git clone -q --depth 1 https://github.com/wyzowl/sfx-kit "$ROOT/sfx-kit" && rm -rf "$ROOT/sfx-kit/.git")
echo READY
