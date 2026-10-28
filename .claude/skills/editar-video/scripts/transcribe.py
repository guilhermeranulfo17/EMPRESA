#!/usr/bin/env python3
"""Speech map of a video: where the speech is, and what is said in each stretch.

usage: transcribe.py VIDEO OUT.json
Prints "start-end  text" lines; OUT.json holds {"duration", "speech": [[s, e], ...], "segments": [{s, e, text}]}.
Timings are per stretch of speech (between pauses), not per word.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf, sherpa_onnx

src, out = sys.argv[1], sys.argv[2]
model = os.path.expanduser('~/.cache/editar-video/sherpa-onnx-whisper-small')
wav = os.path.join(tempfile.mkdtemp(), 'a.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '16000', wav], check=True)
a, sr = sf.read(wav, dtype='float32'); dur = len(a) / sr
log = subprocess.run(['ffmpeg', '-i', wav, '-af', 'silencedetect=n=-32dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
sil = list(zip(st, en + [dur] * (len(st) - len(en))))
edges = [0.0] + [x for s in sil for x in s] + [dur]
speech = [[round(edges[i], 2), round(edges[i + 1], 2)] for i in range(0, len(edges) - 1, 2) if edges[i + 1] - edges[i] > 0.15]
# chunks for the recogniser: whole stretches, split if longer than 25 s
chunks = []
for s, e in speech:
    while e - s > 25: chunks.append((s, s + 25)); s += 25
    chunks.append((s, e))
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{model}/small-encoder.int8.onnx', decoder=f'{model}/small-decoder.int8.onnx',
                                               tokens=f'{model}/small-tokens.txt', language='pt', task='transcribe', num_threads=4)
segs = []
for s, e in chunks:
    pad = 0.15; i0, i1 = int(max(0, s - pad) * sr), int(min(dur, e + pad) * sr)
    stm = r.create_stream(); stm.accept_waveform(sr, a[i0:i1]); r.decode_stream(stm)
    segs.append({'s': round(s, 2), 'e': round(e, 2), 'text': stm.result.text.strip()})
    print(f'{s:6.2f}-{e:6.2f}  {segs[-1]["text"]}', flush=True)
json.dump({'duration': round(dur, 3), 'speech': speech, 'segments': segs}, open(out, 'w'), ensure_ascii=False, indent=1)
