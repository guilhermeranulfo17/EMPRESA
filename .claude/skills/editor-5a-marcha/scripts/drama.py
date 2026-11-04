"""Dark cinematic bed (original, written in code): string-like swells, a low drone, a slow heartbeat pulse
and sub hits on scene changes. No keys, no plucks.
usage: drama.py OUT.wav --dur S [--hits 7.3,15.5,...] [--pulse IN,OUT] [--bpm 70] [--lufs -30]"""
import argparse, subprocess, os, tempfile
import numpy as np, soundfile as sf
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--dur', type=float, required=True)
ap.add_argument('--hits', default=''); ap.add_argument('--pulse', default=''); ap.add_argument('--bpm', type=float, default=70)
ap.add_argument('--lufs', type=float, default=-30); ap.add_argument('--seed', type=int, default=3)
A = ap.parse_args()
SR = 48000; N = int((A.dur + 0.5) * SR); t = np.arange(N) / SR
rng = np.random.default_rng(A.seed); L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

from scipy.signal import lfilter
def lp(x, fc):  # one-pole low-pass, twice
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], lfilter([1 - a], [1, -a], x))

def strings(notes, dur, att=1.6, rel=1.4):
    n = int(dur * SR); tt = np.arange(n) / SR; l = np.zeros(n); r = np.zeros(n)
    for m in notes:
        for k, det in enumerate((-0.11, -0.04, 0.04, 0.11)):
            f = hz(m) * 2 ** (det / 12); ph = rng.uniform(0, 1)
            vib = 1 + 0.003 * np.sin(2 * np.pi * (4.6 + k * 0.3) * tt + k)
            saw = 2 * ((f * tt * vib + ph) % 1) - 1
            (l if k % 2 else r)[:] += saw
    env = np.minimum(1, tt / att) * np.minimum(1, np.maximum(0, dur - tt) / rel)
    swell = 0.75 + 0.25 * np.sin(np.pi * np.clip(tt / dur, 0, 1))
    return l * env * swell, r * env * swell

# progression (A minor, dramatic): Am  F  Dm  E   (4 bars each at 70 bpm ~ 3.43 s/bar)
bar = 4 * 60 / A.bpm
prog = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]
x = 0.0; i = 0
while x < A.dur:
    l, r = strings(prog[i % 4], bar * 2 + 1.2)
    a = int(x * SR); b = min(N, a + len(l)); L[a:b] += l[:b - a]; R[a:b] += r[:b - a]
    x += bar * 2; i += 1
L, R = lp(L, 1400) * 0.05, lp(R, 1400) * 0.05
# low drone on A
dr = (np.sin(2 * np.pi * hz(33) * t) + 0.4 * np.sin(2 * np.pi * hz(45) * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * t))
dr *= np.minimum(1, t / 2.5) * np.minimum(1, np.maximum(0, A.dur - t) / 1.5) * 0.22
L += dr; R += dr
# heartbeat pulse (low thump-thump)
def thump(f0=55, d=0.35, g=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    return g * np.sin(2 * np.pi * (f0 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
if A.pulse:
    p0, p1 = map(float, A.pulse.split(',')); beat = 60 / A.bpm; x = p0
    while x < p1:
        for dx, g in ((0, 0.55), (0.22, 0.35)):
            s = thump(g=g); a = int((x + dx) * SR); b = min(N, a + len(s)); L[a:b] += s[:b - a]; R[a:b] += s[:b - a]
        x += beat
# sub hits + a short reverse swell into each
for h in [float(v) for v in A.hits.split(',') if v]:
    s = thump(42, 1.6, 0.9); a = int(h * SR); b = min(N, a + len(s)); L[a:b] += s[:b - a]; R[a:b] += s[:b - a]
    n = int(0.9 * SR); tt = np.arange(n) / SR; nz = lp(rng.standard_normal(n), 2500) * (tt / 0.9) ** 3 * 0.25
    a = max(0, int((h - 0.9) * SR)); b = min(N, a + n); L[a:b] += nz[:b - a]; R[a:b] += nz[:b - a]
fade = np.minimum(1, np.maximum(0, (A.dur + 0.4) - t) / 1.2); L *= fade; R *= fade
mix = np.stack([L, R], 1); mix /= np.abs(mix).max() + 1e-9
tmp = os.path.join(tempfile.mkdtemp(), 'm.wav'); sf.write(tmp, mix * 0.8, SR, subtype='PCM_24')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'loudnorm=I={A.lufs}:TP=-6:LRA=11,aresample={SR}', A.out], check=True)
print('ok', A.out)
