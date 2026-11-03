"""Trilha instrumental leve e moderna, composta em código (sem direitos autorais).
Fá maior, 104 BPM, I-V-vi-IV. Estrutura guiada pelo roteiro (src/roteiro.json):
  0 a 8 s     pad suave + pluck esparso (gancho, noite)
  8 a 15 s    só o pad, mais contido (a dor)
  15,3 s      a batida entra com o logo (kick leve, palmas, chimbal, baixo)
  44,6 s      a batida afina (oferta) e um acorde final abre no logo (52,15 s)
uso: python trilha_leve.py SAIDA.wav"""
import json, os, sys, wave
import numpy as np

SR = 48000
R = json.load(open(os.path.join(os.path.dirname(__file__), "..", "src", "roteiro.json")))
DUR = R["duracao"]
N = int(SR * DUR)
BPM = 104
B = 60 / BPM
BAR = 4 * B
rng = np.random.default_rng(11)
mix = np.zeros((N, 2))
t_all = np.arange(N) / SR

BATIDA_ENTRA, BATIDA_LEVE, FINAL = 15.3, 44.6, 52.15


def add(sig, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    n = min(len(sig), N - i)
    if n <= 0 or i < 0:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + n, 0] += sig[:n] * gain * l
    mix[i:i + n, 1] += sig[:n] * gain * r


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def pad(notas, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for m in notas:
        for det in (-0.06, 0.0, 0.06):
            f = hz(m) * 2 ** (det / 12)
            for h, a in ((1, 1), (2, 0.25), (3, 0.08)):
                s += a * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28))
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.7)
    return s * env * (1 + 0.1 * np.sin(2 * np.pi * 0.2 * t)) / (len(notas) * 5)


def pluck(m, dur=0.9):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    mod = np.sin(2 * np.pi * f * 2 * t) * 1.2 * np.exp(-t * 9)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 4.5) + 0.3 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 11)
    return s * np.minimum(1, t / 0.003)


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 70 * np.exp(-t * 35)
    return np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9))


def palma():
    t = np.arange(int(0.25 * SR)) / SR
    n = np.diff(rng.standard_normal(len(t) + 1))
    env = sum(np.exp(-np.maximum(0, t - d) * 40) * (t >= d) for d in (0, 0.008, 0.017)) / 3
    return n * env * 0.5


def chimbal(aberto=False):
    t = np.arange(int((0.18 if aberto else 0.045) * SR)) / SR
    n = np.diff(np.diff(rng.standard_normal(len(t) + 2)))
    return n * np.exp(-t * (16 if aberto else 80)) * 0.22


def baixo(m, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return np.tanh(1.2 * s) * np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.06)


# F - C - Dm - Bb
prog = [(53, [65, 69, 72, 77]), (48, [64, 67, 72, 76]), (50, [62, 65, 69, 74]), (46, [62, 65, 70, 74])]
nbars = int(np.ceil(DUR / BAR)) + 1
for b in range(nbars):
    t0 = b * BAR
    if t0 >= FINAL - 0.05:
        break
    raiz, ac = prog[b % 4]
    dor = 8.0 <= t0 < 15.0
    add(pad(ac, BAR + 0.5), t0, 0, 0.42 if dor else 0.5)
    arp = [ac[0] + 12, ac[2] + 12, ac[1] + 12, ac[3] + 12]
    for i in range(8):
        tt = t0 + i * B / 2
        if tt >= FINAL:
            break
        if tt < 8.0:  # gancho: só nos tempos
            if i % 2 == 0:
                add(pluck(arp[(i // 2) % 4]), tt, -0.3 if i % 4 else 0.3, 0.07)
        elif tt < BATIDA_ENTRA:  # dor: quase nada
            if i == 0:
                add(pluck(arp[0]), tt, 0, 0.05)
        else:
            add(pluck(arp[i % 4] + (12 if i == 7 else 0)), tt, 0.35 if i % 2 else -0.35, 0.075)

# batida
passo = B / 4
t = BATIDA_ENTRA
k = 0
while t < FINAL - 0.05:
    s16 = k % 16
    raiz = prog[int(t // BAR) % 4][0]
    leve = t >= BATIDA_LEVE
    if s16 in ((0, 8) if leve else (0, 6, 8, 11)):
        add(kick(), t, 0, 0.55 if leve else 0.7)
    if s16 in (0, 8):
        add(baixo(raiz - 12, B * 1.7), t, 0, 0.16)
    if s16 in (4, 12):
        add(palma(), t, 0.1, 0.32 if leve else 0.42)
    if s16 % 2 == 0:
        add(chimbal(), t, 0.3, 0.55 if s16 % 4 else 0.35)
    if s16 == 14:
        add(chimbal(True), t, 0.3, 0.35)
    t += passo
    k += 1

# entrada da batida: um "hit" leve; respiro antes do logo final
add(kick() * 1.2, BATIDA_ENTRA, 0, 0.8)
ac_final = [53 + 12, 65, 69, 72, 77]
add(pad(ac_final, DUR - FINAL + 0.3), FINAL - 0.1, 0, 0.7)
for i, m in enumerate([77, 81, 84, 89]):
    add(pluck(m, 1.6), FINAL + i * 0.09, -0.3 + 0.2 * i, 0.08)

# reverb curto (convolução FFT)
ir_t = np.arange(int(1.4 * SR)) / SR
for c in range(2):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.6)
    ir[0] = 0
    L = len(mix) + len(ir)
    F = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(mix[:, c], F) * np.fft.rfft(ir, F), F)[:N]
    mix[:, c] += wet / np.abs(ir).sum() * 5
mix *= np.minimum(1, t_all / 0.4)[:, None] * np.minimum(1, (DUR - t_all) / 1.4)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.2) * 0.85
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("trilha ok", sys.argv[1])
