"""Divide um áudio de fala em trechos (ilhas entre silêncios) e transcreve cada um com o Whisper local
(sherpa-onnx, modelo já baixado pela skill editar-video). Serve para conferir em que trecho cada palavra do
roteiro foi dita. uso: python3 ilhas.py AUDIO [limiar_dB] [min_silencio_s]"""
import os, re, subprocess, sys, json
import numpy as np, soundfile as sf, sherpa_onnx
audio = sys.argv[1]; lim = sys.argv[2] if len(sys.argv) > 2 else "-38"; dmin = sys.argv[3] if len(sys.argv) > 3 else "0.12"
wav = "/tmp/claude-0/ilhas.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", audio, "-ac", "1", "-ar", "16000", wav], check=True)
x, sr = sf.read(wav, dtype="float32")
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", f"silencedetect=n={lim}dB:d={dmin}", "-f", "null", "-"], capture_output=True, text=True).stderr
ini = [float(v) for v in re.findall(r"silence_start: ([\d.]+)", log)]
fim = [float(v) for v in re.findall(r"silence_end: ([\d.]+)", log)]
dur = len(x) / sr
cortes = [0.0]
for a, b in zip(ini, fim + [dur]):
    cortes += [a, b]
cortes.append(dur)
ilhas = [(cortes[i], cortes[i + 1]) for i in range(0, len(cortes) - 1, 2) if cortes[i + 1] - cortes[i] > 0.08]
m = os.path.expanduser("~/.cache/editar-video/sherpa-onnx-whisper-small")
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{m}/small-encoder.int8.onnx", decoder=f"{m}/small-decoder.int8.onnx", tokens=f"{m}/small-tokens.txt", language="pt", task="transcribe", num_threads=4)
out = []
for a, b in ilhas:
    s = r.create_stream(); s.accept_waveform(sr, x[max(0, int((a - 0.05) * sr)):int((b + 0.05) * sr)]); r.decode_stream(s)
    out.append({"ini": round(a, 3), "fim": round(b, 3), "texto": s.result.text.strip()})
    print(f"{a:6.2f} {b:6.2f}  {s.result.text.strip()}")
json.dump(out, open(os.path.splitext(audio)[0] + ".ilhas.json", "w"), ensure_ascii=False, indent=1)
