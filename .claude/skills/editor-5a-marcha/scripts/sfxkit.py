"""Place SFX Kit sounds on a timeline.
usage: sfxkit.py hits.json speech.json DUR out.wav
  hits.json:   [[moment_s, "sound-id", gain_db(optional), rate(optional)], ...]
  speech.json: transcribe_medium output of the final clip ([{s,e,text}]); used for under_voiceover_db
start = moment - sync.at/rate; lowered by under_voiceover_db when the body overlaps speech."""
import json, sys, os
import numpy as np, soundfile as sf
KIT = '/home/user/EMPRESA/sfx-kit'
hits, sp, dur, out = json.load(open(sys.argv[1])), json.load(open(sys.argv[2])), float(sys.argv[3]), sys.argv[4]
speech = [(x['s'], x['e']) for x in sp] if sp and isinstance(sp[0], dict) else sp
db = {s['id']: s for s in json.load(open(f'{KIT}/sounds.json'))['sounds']}
SR = 48000; mix = np.zeros((int((dur + 2) * SR), 2), np.float32)
for h in hits:
    t, sid = h[0], h[1]; g = h[2] if len(h) > 2 else 0.0; rate = h[3] if len(h) > 3 else 1.0
    s = db[sid]; a, sr = sf.read(f"{KIT}/{s['file']}", dtype='float32', always_2d=True)
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
    if sr != SR or rate != 1.0:
        n = int(len(a) * SR / sr / rate); x = np.linspace(0, len(a) - 1, n)
        a = np.stack([np.interp(x, np.arange(len(a)), a[:, c]) for c in range(2)], 1).astype(np.float32)
    st = t - s['sync']['at'] / rate
    b0, b1 = st + s['timing']['onset'] / rate, st + s['timing']['body_end'] / rate
    if any(b0 < e and b1 > s0 for s0, e in speech): g += s.get('under_voiceover_db', 0)
    if st < 0: a = a[int(-st * SR):]; st = 0
    i = int(st * SR); j = min(len(mix), i + len(a))
    mix[i:j] += a[:j - i] * 10 ** (g / 20)
    print(f'{t:6.2f} {sid:32s} start {st:6.2f} gain {g:+.1f}')
mix = mix[:int((dur) * SR)]
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
sf.write(out, mix, SR, subtype='PCM_24'); print('ok', out)
