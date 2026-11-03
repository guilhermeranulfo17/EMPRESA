"""Mixagem da VSL: voz (ElevenLabs) + trilha (composta em código) + efeitos do SFX Kit.
- A voz manda: normalizada a -16 LUFS.
- Trilha com ducking: ~18 dB abaixo da voz enquanto ele fala, sobe ~8 dB nas pausas.
- Efeitos posicionados em (momento - sync.at); sob a fala descem under_voiceover_db (sfx.py da skill).
- Final em -14 LUFS, pico abaixo de -1 dBTP (loudnorm em duas passadas).
uso: python mixar.py   (gera public/audio/mix.wav e public/audio/trilha.wav)"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
AUD = os.path.join(RAIZ, "public", "audio")
KIT = os.path.join(RAIZ, "..", "sfx-kit")
SKILL = os.path.join(RAIZ, "..", ".claude", "skills", "editar-video", "scripts")
TMP = os.path.join(AUD, "_tmp")
os.makedirs(TMP, exist_ok=True)
R = json.load(open(os.path.join(RAIZ, "src", "roteiro.json")))
DUR = R["duracao"]
SR = 48000


def run(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True)


def loudnorm(src, dst, alvo, tp):
    """loudnorm em duas passadas (linear) para acertar LUFS e pico."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af",
                        f"loudnorm=I={alvo}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex("{"):])
    run("ffmpeg", "-y", "-v", "error", "-i", src, "-af",
        f"loudnorm=I={alvo}:TP={tp}:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
        f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true",
        "-ar", str(SR), "-ac", "2", dst)


# 1. voz a -16 LUFS, com 55 s
voz_wav = os.path.join(TMP, "voz.wav")
loudnorm(os.path.join(AUD, "narracao.mp3"), os.path.join(TMP, "voz_n.wav"), -16, -2)
run("ffmpeg", "-y", "-v", "error", "-i", os.path.join(TMP, "voz_n.wav"), "-af", f"apad,atrim=0:{DUR}", voz_wav)
voz, _ = sf.read(voz_wav, always_2d=True)

# 2. trilha a -16 LUFS e ducking pelos trechos de fala (scripts/alinhar.py)
trilha_wav = os.path.join(AUD, "trilha.wav")
run(sys.executable, os.path.join(AQUI, "trilha_leve.py"), os.path.join(TMP, "trilha_bruta.wav"))
loudnorm(os.path.join(TMP, "trilha_bruta.wav"), trilha_wav, -16, -2)
mus, _ = sf.read(trilha_wav, always_2d=True)
n = len(voz)
mus = np.vstack([mus, np.zeros((max(0, n - len(mus)), 2))])[:n]

sys.path.insert(0, AQUI)
from alinhar import TRECHOS  # noqa: E402
fala = [(ini, fim) for _, ini, fim in TRECHOS]
t = np.arange(n) / SR
alvo = np.full(n, -8.0)  # nas pausas: 8 dB abaixo do nível da voz
for ini, fim in fala:
    alvo[(t >= ini - 0.08) & (t <= fim + 0.12)] = -19.5
# suaviza: desce rápido (~80 ms), sobe devagar (~450 ms)
g = np.empty(n)
atual = alvo[0]
a_desce, a_sobe = 1 - np.exp(-1 / (0.08 * SR)), 1 - np.exp(-1 / (0.45 * SR))
for i in range(n):
    c = a_desce if alvo[i] < atual else a_sobe
    atual += (alvo[i] - atual) * c
    g[i] = atual
mus_d = mus * (10 ** (g / 20))[:, None]

# 3. efeitos (sfx.py da skill /editar-video)
fala_json = os.path.join(TMP, "fala.json")
json.dump({"speech": [[a, b] for a, b in fala], "duration": DUR}, open(fala_json, "w"))
cues_json = os.path.join(TMP, "cues.json")
json.dump(R["sfx"], open(cues_json, "w"))
sfx_wav = os.path.join(TMP, "sfx.wav")
print(run(sys.executable, os.path.join(SKILL, "sfx.py"), KIT, cues_json, fala_json, sfx_wav).stdout)
fx, _ = sf.read(sfx_wav, always_2d=True)
fx = np.vstack([fx, np.zeros((max(0, n - len(fx)), 2))])[:n] * (10 ** (-6 / 20))  # kit ~ -10 LUFS: abaixo da voz

# 4. soma e final a -14 LUFS / -1 dBTP
soma = voz + mus_d + fx
sf.write(os.path.join(TMP, "soma.wav"), soma, SR, subtype="FLOAT")
loudnorm(os.path.join(TMP, "soma.wav"), os.path.join(AUD, "mix.wav"), -14, -1.5)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(AUD, "mix.wav"), "-af", "ebur128=peak=true", "-f", "null", "-"],
                   capture_output=True, text=True)
resumo = r.stderr[r.stderr.rindex("Summary:"):]
print(resumo)
