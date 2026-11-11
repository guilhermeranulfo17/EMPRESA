"""Mixagem do vídeo de vendas v2: vozes (posições de src/v2/linha.json), trilha Mixkit em duas partes
(tensa e baixa até a virada; aberta e alegre depois), efeitos do SFX Kit, ducking da trilha sob a voz e
normalização final em -14 LUFS (pico abaixo de -1 dBTP).
Saída: public/v2/audio/mix.wav  |  uso: python3 scripts/v2/mixar.py"""
import json, subprocess

L = json.load(open("src/v2/linha.json"))
DUR = L["duracao"]
A = "public/v2/audio"
KIT = "../sfx-kit/sounds"
TMP = "/tmp/claude-0"

# efeitos: (arquivo do kit, momento em que o evento acontece, sync.at do som, ganho dB)
SFX = [
    ("notifications/notification-message-in-soft.wav", 1.90, 0.046, -6),   # chega a mensagem da Mariana
    ("whooshes/whoosh-medium-soft.wav", 5.60, 0.229, -14),
    ("notifications/notification-message-in-soft.wav", 10.35, 0.046, -9),  # "Outro buffet"
    ("impacts/impact-medium-soft.wav", 12.45, 0.013, -10),                  # título "Quem responde primeiro, fecha."
    ("whooshes/whoosh-medium-soft.wav", 14.15, 0.229, -7),                 # virada
    ("shimmers/shimmer-short-soft.wav", 14.30, 0.012, -12),
    ("whooshes/whoosh-medium-soft.wav", 15.65, 0.229, -13),
    ("interface/click-tap-soft.wav", 17.95, 0.009, -10),                   # pacote
    ("interface/click-tap-soft.wav", 18.50, 0.009, -10),                   # convidados
    ("interface/click-tap-soft.wav", 19.05, 0.009, -10),                   # continuar
    ("interface/click-tap-soft.wav", 19.75, 0.009, -10),                   # mesa temática
    ("pops/pop-small-in.wav", 20.95, 0.010, -9),                           # valor na hora
    ("whooshes/whoosh-medium-soft.wav", 22.60, 0.229, -13),
    ("notifications/notification-success-soft.wav", 23.00, 0.0, -8),      # pedido pronto
    ("whooshes/whoosh-medium-soft.wav", 27.70, 0.229, -14),
    ("interface/click-tap-soft.wav", 29.60, 0.009, -10),                   # desconto em R$
    ("pops/pop-small-in.wav", 30.30, 0.010, -10),                          # total novo
    ("pops/pop-small-in.wav", 30.95, 0.010, -11),                          # mensagem pronta
    ("whooshes/whoosh-medium-soft.wav", 32.10, 0.229, -12),
    ("pops/pop-small-in.wav", 33.30, 0.010, -11),                          # seta
    ("whooshes/whoosh-medium-soft.wav", 37.75, 0.229, -12),
    ("pops/pop-small-in.wav", 38.70, 0.010, -9),                           # oferta 1
    ("pops/pop-small-in.wav", 40.10, 0.010, -9),                           # oferta 2
    ("pops/pop-small-in.wav", 41.80, 0.010, -9),                           # oferta 3
    ("logo-stings/sting-warm-short.wav", 44.45, 0.107, -9),                # marca no fim
]


def sh(args):
    subprocess.run(args, check=True)


# 1) voz: cada trecho na sua posição; a cliente com leve cor de áudio de WhatsApp
inputs, filt = [], []
for i, v in enumerate(L["voz"]):
    inputs += ["-i", f"{A}/{v['arq']}.mp3"]
    cor = ",highpass=f=180,lowpass=f=7500,acompressor=threshold=-20dB:ratio=3" if v["arq"] == "cliente" else ""
    ms = int(round(v["em"] * 1000))
    filt.append(f"[{i}:a]atrim={v['de']}:{v['ate'] + 0.06},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={v['ate'] - v['de']:.3f}:d=0.06{cor},"
                f"aresample=48000,aformat=channel_layouts=mono,adelay={ms}|{ms}[v{i}]")
n = len(L["voz"])
filt.append("".join(f"[v{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad,atrim=0:{DUR}[voz]")
sh(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[voz]", "-ac", "1", f"{TMP}/voz.wav"])

# 2) trilha: tensa (Mixkit 615 "Tapis") até a virada, alegre (Mixkit 33 "Motivating Mornings") depois.
# A virada da 33 (salto de energia aos 12 s do original) cai em 14,15 s.
VIRADA = 14.15
b_ini = VIRADA - 2.0
sh(["ffmpeg", "-loglevel", "error", "-y", "-i", "public/v2/musica/615.mp3", "-i", "public/v2/musica/33.mp3", "-filter_complex",
    f"[0:a]atrim=0:{VIRADA + 0.6},asetpts=PTS-STARTPTS,volume=-7dB,afade=t=in:d=1.2,afade=t=out:st={VIRADA - 0.35}:d=0.9,aresample=48000[a];"
    f"[1:a]atrim=10:{10 + DUR - b_ini},asetpts=PTS-STARTPTS,volume=-3dB,afade=t=in:d=1.9,afade=t=out:st={DUR - b_ini - 1.1}:d=1.1,aresample=48000,"
    f"adelay={int(b_ini * 1000)}|{int(b_ini * 1000)}[b];"
    f"[a][b]amix=inputs=2:normalize=0,apad,atrim=0:{DUR}[m]", "-map", "[m]", "-ac", "2", f"{TMP}/trilha.wav"])

# 3) efeitos
inputs, filt = [], []
for i, (arq, t, at, g) in enumerate(SFX):
    inputs += ["-i", f"{KIT}/{arq}"]
    ms = max(0, int(round((t - at) * 1000)))
    filt.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g}dB,adelay={ms}|{ms}[s{i}]")
filt.append("".join(f"[s{i}]" for i in range(len(SFX))) + f"amix=inputs={len(SFX)}:normalize=0,apad,atrim=0:{DUR}[sfx]")
sh(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[sfx]", f"{TMP}/sfx.wav"])

# 3b) níveis de referência: voz em -16 LUFS, trilha (sem ducking) em -25 LUFS
def lufs(arq):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-i", arq, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float([l for l in e.splitlines() if l.strip().startswith("I:")][-1].split()[1])
gv = -16 - lufs(f"{TMP}/voz.wav")
gm = -25 - lufs(f"{TMP}/trilha.wav")
print(f"ganho voz {gv:+.1f} dB, trilha {gm:+.1f} dB")

# 4) mix: trilha abaixa sozinha quando há fala (sidechain), efeitos por cima, voz na frente
mix = (f"[0:a]volume={gv:.2f}dB,asplit=2[vz][sc];[1:a]volume={gm:.2f}dB[mu];[mu][sc]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=400:makeup=1[md];"
       f"[vz]aformat=channel_layouts=stereo[vv];[md]anull[mm];[2:a]volume={gv - 2:.2f}dB[ss];"
       f"[vv][mm][ss]amix=inputs=3:normalize=0[pre]")
sh(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{TMP}/voz.wav", "-i", f"{TMP}/trilha.wav", "-i", f"{TMP}/sfx.wav",
    "-filter_complex", mix, "-map", "[pre]", "-ar", "48000", f"{TMP}/pre.wav"])
med = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{TMP}/pre.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
j = json.loads(med[med.rindex("{"):med.rindex("}") + 1])
sh(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{TMP}/pre.wav", "-af",
    f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000",
    "-ar", "48000", f"{A}/mix.wav"])
fim = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{A}/mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print(fim[fim.rindex("Summary"):])
