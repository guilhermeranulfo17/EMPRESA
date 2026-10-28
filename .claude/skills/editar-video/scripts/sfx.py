#!/usr/bin/env python3
"""Sound-effects stem from SFX Kit cues.

usage: sfx.py KIT_DIR CUES.json SPEECH.json OUT.wav
CUES.json: [{"at": 3.9, "id": "impact-medium-hard", "gain": 0}, ...]  (at = the moment on screen, gain = extra dB)
SPEECH.json: the transcribe.py output (its "speech" and "duration").
Each sound starts at at - sync.at; where its body overlaps speech it comes down by under_voiceover_db.
Writes OUT.wav (48 kHz stereo) and prints one line per placed sound.
"""
import json, sys, numpy as np, soundfile as sf
kit, cues_path, speech_path, out = sys.argv[1:5]
S = {s['id']: s for s in json.load(open(f'{kit}/sounds.json'))['sounds']}
sp = json.load(open(speech_path)); speech, dur = sp['speech'], sp['duration']
SR = 48000; track = np.zeros((int(dur * SR), 2)); placed = []
for c in json.load(open(cues_path)):
    s = S[c['id']]; a, sr = sf.read(f"{kit}/{s['file']}", always_2d=True)
    if sr != SR: raise SystemExit(f"{c['id']}: {sr} Hz")
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
    start = c['at'] - s['sync']['at']; b0, b1 = start + s['timing']['onset'], start + s['timing']['body_end']
    over = any(b0 < e and b1 > st for st, e in speech)
    g = c.get('gain', 0) + (s['under_voiceover_db'] if over else 0)
    i = int(round(start * SR)); a = a * 10 ** (g / 20)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), len(track) - i)
    if n > 0: track[i:i + n] += a[:n]
    placed.append({**c, 'start': round(start, 3), 'gain_db': g, 'over_speech': over})
    print(f"{c['at']:6.2f}s {c['id']:32s} start {start:6.3f}  {g:+.0f} dB{'  (sobre a fala)' if over else ''}")
sf.write(out, track, SR, subtype='PCM_24')
json.dump(placed, open(out.rsplit('.', 1)[0] + '.cues.json', 'w'), indent=1)
