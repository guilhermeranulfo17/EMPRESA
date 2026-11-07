"""Tight cuts: trim each range to the speech inside it and split out internal pauses.
usage: refine.py SRC cuts.json out.json [--gap 0.14] [--pre 0.03] [--post 0.06] [--rel 32]
A frame (10 ms) is speech when it is within REL dB of the range's loudest frame. Pauses of GAP s or more
inside a range are removed. Each kept piece starts PRE before its first speech frame and ends POST after
its last one (so the last letter of the word stays)."""
import argparse, json, os, subprocess, tempfile
import numpy as np, soundfile as sf
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('cuts'); ap.add_argument('out')
ap.add_argument('--gap', type=float, default=0.14); ap.add_argument('--pre', type=float, default=0.03)
ap.add_argument('--post', type=float, default=0.06); ap.add_argument('--rel', type=float, default=32)
A = ap.parse_args()
w = os.path.join(tempfile.mkdtemp(), 'a.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', A.src, '-map', '0:a:0', '-ac', '1', '-ar', '16000', w], check=True)
a, sr = sf.read(w, dtype='float32'); h = int(0.01 * sr)
out = {}
for k, rngs in json.load(open(A.cuts)).items():
    res = []
    for rg in rngs:
        s, e = rg[0], rg[1]; hard = len(rg) > 2
        s0 = max(0, s - 0.15); seg = a[int(s0 * sr):int((e + 0.15) * sr)]
        db = np.array([20 * np.log10(np.sqrt(np.mean(seg[i:i + h] ** 2)) + 1e-9) for i in range(0, len(seg) - h, h)])
        # noise floor of the take's surroundings (10th percentile over +-3 s): speech must clear it by 8 dB
        w0, w1 = int(max(0, s - 3) * sr), int((e + 3) * sr); ctx_ = a[w0:w1]
        cdb = np.array([20 * np.log10(np.sqrt(np.mean(ctx_[i:i + h] ** 2)) + 1e-9) for i in range(0, len(ctx_) - h, h)])
        floor = np.percentile(cdb, 10)
        thr = max(db.max() - A.rel, floor + 8); on = db > thr
        # only consider frames inside [s, e] (+ small slack) as candidates
        idx = np.arange(len(on)) * 0.01 + s0
        on &= (idx >= s - (0 if hard else 0.08)) & (idx <= e + (0 if hard else 0.12))
        runs, i = [], 0
        while i < len(on):
            if on[i]:
                j = i
                while j < len(on) and on[j]: j += 1
                runs.append([idx[i], idx[j - 1] + 0.01]); i = j
            else: i += 1
        merged = []
        for r in runs:
            if merged and r[0] - merged[-1][1] < A.gap: merged[-1][1] = r[1]
            else: merged.append(r)
        merged = [m for m in merged if m[1] - m[0] >= 0.06]
        for m in merged: res.append([round(max(m[0] - A.pre, s - 0.03 if hard else 0), 3), round(min(m[1] + A.post, e) if hard else m[1] + A.post, 3)])
    out[k] = res
    print(k, ' '.join(f'{x:.2f}-{y:.2f}' for x, y in res))
json.dump(out, open(A.out, 'w'), indent=1)
