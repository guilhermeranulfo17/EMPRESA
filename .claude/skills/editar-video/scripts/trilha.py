"""Original instrumental bed: dark lo-fi / trap in A minor, written in code (no copyright).
usage: trilha.py OUT.wav --dur SECONDS [--drums IN,OUT] [--bpm 90]
Pads and plucks run the whole clip; drums and sub enter with an impact at IN, a riser leads into a hit at OUT."""
import numpy as np, wave, sys
import argparse
ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("--dur", type=float, required=True)
ap.add_argument("--drums", default="", help="start,end of the drum section in seconds (default: whole clip)")
ap.add_argument("--bpm", type=float, default=90); A = ap.parse_args()
SR = 44100; DUR = A.dur + 0.1; N = int(SR * DUR); BPM = A.bpm; B = 60 / BPM
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR
mix = np.zeros((N, 2))

def add(sig, at, pan=0.0, gain=1.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i+n, 0] += sig[:n] * gain * l; mix[i:i+n, 1] += sig[:n] * gain * r

def hz(m): return 440 * 2 ** ((m - 69) / 12)

def pad(notes, length):
    t = np.arange(int(length * SR)) / SR; s = np.zeros_like(t)
    for m in notes:
        for det in (-0.07, 0.0, 0.07):
            f = hz(m) * 2 ** (det / 12)
            for h, a in ((1, 1), (2, .35), (3, .15), (4, .06)):
                s += a * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28))
    env = np.minimum(1, t / 0.6) * np.minimum(1, (length - t) / 0.5)
    return s * env * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * t)) / (len(notes) * 6)

def pluck(m, length=1.2):
    t = np.arange(int(length * SR)) / SR; f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + 2 * h)) for h, a in ((1, 1), (2, .5), (3, .25), (5, .1)))
    return s * np.minimum(1, t / 0.004)

def kick():
    t = np.arange(int(0.5 * SR)) / SR; f = 45 + 95 * np.exp(-t * 30)
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7))

def snare():
    t = np.arange(int(0.35 * SR)) / SR; n = np.diff(rng.standard_normal(len(t) + 1))
    return (0.6 * n * np.exp(-t * 16) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25))

def hat(open_=False):
    t = np.arange(int((0.25 if open_ else 0.06) * SR)) / SR; n = np.diff(np.diff(rng.standard_normal(len(t) + 2)))
    return n * np.exp(-t * (14 if open_ else 70)) * 0.35

def sub(m, length):
    t = np.arange(int(length * SR)) / SR
    return np.tanh(1.5 * np.sin(2 * np.pi * hz(m) * t)) * np.minimum(1, t / .01) * np.minimum(1, (length - t) / .05)

# Am - F - C - E (dark, tense)
prog = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (48, [55, 60, 64, 67]), (52, [56, 59, 64, 68])]
bar = 4 * B
DRUMS_IN, DRUMS_OUT = (float(x) for x in A.drums.split(",")) if A.drums else (0.0, DUR - 1.5)
nbars = int(np.ceil(DUR / bar)) + 1
for b in range(nbars):
    root, ch = prog[b % 4]; t0 = b * bar
    add(pad(ch, bar + 0.4), t0, 0, 0.55)
    arp = [ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 12]
    for i, m in enumerate(arp):
        add(pluck(m), t0 + i * B / 2, 0.35 if i % 2 else -0.35, 0.10)

# drums + sub, phase-locked to the red-collage entrance
step = B / 4; t = DRUMS_IN; k = 0
while t < DRUMS_OUT:
    s16 = k % 16; root = prog[int(t // bar) % 4][0]
    if s16 in (0, 10): add(kick(), t, 0, 0.9)
    if s16 in (0, 10): add(sub(root - 12, B * (1.4 if s16 == 0 else 1.2)), t, 0, 0.32)
    if s16 in (4, 12): add(snare(), t, 0.05, 0.55)
    if s16 % 2 == 0: add(hat(), t, 0.25, 0.9 if s16 % 4 else 0.6)
    if s16 in (14, 15) and (k // 16) % 2: add(hat(), t, 0.25, 0.7)  # little roll
    t += step; k += 1
add(kick() * 1.2, DRUMS_IN, 0, 1.0)                                  # impact on the hit
# riser into the glitter-spotlight ending
rl = 1.6; tt = np.arange(int(rl * SR)) / SR
rise = np.diff(rng.standard_normal(len(tt) + 1)) * (tt / rl) ** 2 * 0.25
add(rise, DRUMS_OUT - rl, 0, 1.0)
add(kick() * 1.1, DRUMS_OUT, 0, 0.9)

# small room reverb (FFT convolution)
ir_t = np.arange(int(1.6 * SR)) / SR
for c in range(2):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 0
    L = len(mix) + len(ir); F = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(mix[:, c], F) * np.fft.rfft(ir, F), F)[:N]
    mix[:, c] += wet / np.abs(ir).sum() * 6
mix *= np.minimum(1, t_all / 0.3)[:, None] * np.minimum(1, (DUR - t_all) / 1.2)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.3) * 0.89
with wave.open(A.out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
