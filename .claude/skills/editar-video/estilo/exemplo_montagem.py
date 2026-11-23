"""EXEMPLO (vídeo de divulgação do Outside Experience, aprovado). Copie e troque CENAS, VOZES, TITULOS e MUSICA_INICIO.
Versão 3 do vídeo de divulgação: Ekballo de fundo, só as falas do áudio original (voz isolada),
animações no estilo do logo e imagem tratada (menos ruído, mais nitidez, cor moderna, aproximação lenta).
Gera final.mp4 (60 s, 1080x1920)."""
import json
import os
import subprocess

W = os.path.dirname(os.path.abspath(__file__))
SRC, FPS, DUR = f"{W}/src", 30, 60.0
MUSICA_INICIO = 399.216  # 6:39,2 da música: a pancada de 7:12,2 cai em 33,0 s do vídeo


def run(cmd):
    subprocess.run(cmd, check=True)


# (início, duração, arquivo, início na fonte, velocidade)
CENAS = [
    (0.00, 6.10, "m2", 0.00, 1.0),    # Guilherme: terceira onda
    (6.10, 1.40, "v6", 0.30, 1.0),    # ALGUÉM PRECISA IR
    (7.50, 2.95, "v4", 24.05, 1.0),   # Espírito do Senhor (sincronizado)
    (10.45, 2.05, "v1", 6.60, 1.0),   # Bíblia em Lucas
    (12.50, 3.00, "m3", 1.00, 1.0),   # plateia ouvindo
    (15.50, 3.40, "v7", 5.25, 1.0),   # dia a dia (sincronizado)
    (18.90, 3.35, "v6", 1.90, 1.0),   # rua
    (22.25, 1.95, "v7", 15.35, 1.0),  # pregando o evangelho (sincronizado)
    (24.20, 3.00, "v2", 0.50, 0.8),   # dons
    (27.20, 2.80, "m4", 0.30, 1.0),   # chamado
    (30.00, 3.00, "v3", 5.00, 0.8),   # existe mais
    (33.00, 1.86, "m7", 2.00, 1.0),   # ESSE DIA É PRA VOCÊ (pancada da música)
    (34.86, 1.86, "m6", 3.50, 1.0),
    (36.72, 1.86, "v2", 6.00, 0.8),   # 10 salvações
    (38.58, 1.24, "m5", 0.50, 1.0),
    (39.82, 1.18, "v5", 7.50, 1.0),
    (41.00, 3.00, "v4", 2.05, 1.0),   # aquele que anuncia (sincronizado)
    (44.00, 3.50, "m5", 2.50, 1.0),
    (47.50, 4.50, "m1", 1.00, 1.0),   # a fé não foi feita
    (52.00, 8.00, "m6", 0.00, 0.8),   # fundo do encerramento
]

# falas (voz isolada): (início no vídeo, arquivo, de, até)
VOZES = [(0.45, "m2", 0.45, 5.95), (7.50, "v4", 24.05, 31.30), (15.50, "v7", 5.25, 12.00),
         (22.25, "v7", 15.35, 17.30), (41.00, "v4", 2.05, 8.45)]

# animações: (início, nome, centro vertical na tela)
BAIXO, MEIO = 1290, 960
TITULOS = [
    (0.25, "onda", BAIXO), (2.65, "trabalhadores", BAIXO), (6.10, "alguem", MEIO),
    (7.60, "espirito", BAIXO), (12.90, "boasnovas", BAIXO), (15.55, "diaadia", BAIXO),
    (22.25, "pregando", BAIXO), (24.45, "dons", BAIXO), (27.35, "chamado", BAIXO),
    (30.15, "mais", BAIXO), (33.00, "pravoce", 560), (36.85, "salvacoes", BAIXO),
    (42.00, "anuncia", BAIXO), (47.60, "fe", BAIXO),
]
FLASHES = [6.10, 33.00]

os.makedirs(f"{W}/cenas3", exist_ok=True)
lista = []
for i, (t0, dur, v, ss, vel) in enumerate(CENAS):
    n = int(round(dur * FPS))
    zoom = f"1+0.07*on/{n}" if i % 2 == 0 else f"1.07-0.07*on/{n}"
    f = []
    if vel != 1:
        f += [f"setpts=PTS/{vel}", "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1"]
    f += [
        "hqdn3d=1.5:1.5:6:6",
        "scale=1188:2112:flags=lanczos",
        f"zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS}",
        "unsharp=5:5:0.8:3:3:0.3",
        "eq=contrast=1.08:saturation=1.18:gamma=0.97",
        "colorbalance=rs=-0.03:bs=0.04:rh=0.04:gh=0.01:bh=-0.03",
        "vignette=PI/6",
        "noise=alls=3:allf=t",
        f"trim=duration={dur}", "setpts=PTS-STARTPTS",
    ]
    if t0 >= 52:
        f += ["gblur=sigma=12", "eq=brightness=-0.22:saturation=0.7"]
    out = f"{W}/cenas3/c{i:02d}.mp4"
    lista.append(f"file '{out}'")
    if os.path.exists(out) and os.environ.get("REUSAR"):
        continue
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur * vel + 0.2), "-i", f"{SRC}/{v}.mp4",
         "-vf", ",".join(f), "-an", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", out])
open(f"{W}/cenas3/lista.txt", "w").write("\n".join(lista) + "\n")
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{W}/cenas3/lista.txt", "-c", "copy", f"{W}/montagem3.mp4"])

# animações por cima + clarões nas pancadas
alturas = {}
for _, nome, _ in TITULOS:
    h = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=height", "-of", "csv=p=0",
                        f"{W}/mg/{nome}.mov"], capture_output=True, text=True).stdout.strip()
    alturas[nome] = int(h)
entradas = ["-i", f"{W}/montagem3.mp4"]
fg = []
flash = "+".join(f"0.55*max(0,1-abs(t-{x})/0.12)" for x in FLASHES)
fg.append(f"[0:v]eq=brightness='{flash}':eval=frame[b0]")
ant = "b0"
for k, (t0, nome, cy) in enumerate(TITULOS, start=1):
    entradas += ["-i", f"{W}/mg/{nome}.mov"]
    fg.append(f"[{k}:v]setpts=PTS+{t0}/TB[m{k}]")
    fg.append(f"[{ant}][m{k}]overlay=0:{cy - alturas[nome] // 2}:eof_action=pass[b{k}]")
    ant = f"b{k}"
k = len(TITULOS) + 1
entradas += ["-i", f"{W}/mg/fim.mov"]
fg.append(f"[{k}:v]setpts=PTS+52.0/TB[mf]")
fg.append(f"[{ant}][mf]overlay=0:0:eof_action=pass,fade=t=out:st=59.4:d=0.6[v]")
run(["ffmpeg", "-v", "error", "-y", *entradas, "-filter_complex", ";".join(fg), "-map", "[v]", "-t", str(DUR),
     "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", f"{W}/imagem3.mp4"])

# voz: só as falas, isoladas da música e do barulho da sala
partes, ent = [], []
for j, (at, v, a, b) in enumerate(VOZES):
    ent += ["-i", f"{W}/sep/{v}_voz.wav"]
    d = b - a
    partes.append(f"[{j}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,"
                  f"highpass=f=90,afade=t=in:d=0.06,afade=t=out:st={d - 0.22:.2f}:d=0.22,adelay={int(at * 1000)}:all=1[a{j}]")
fgv = ";".join(partes) + ";" + "".join(f"[a{j}]" for j in range(len(VOZES))) + \
    f"amix=inputs={len(VOZES)}:normalize=0,apad=whole_dur={DUR},atrim=0:{DUR}[voz]"
run(["ffmpeg", "-v", "error", "-y", *ent, "-filter_complex", fgv, "-map", "[voz]", "-ar", "48000", f"{W}/voz3.wav"])

# música: Ekballo a partir de 6:39,2, entra já forte e some no fim
run(["ffmpeg", "-v", "error", "-y", "-ss", str(MUSICA_INICIO), "-t", str(DUR), "-i", f"{W}/ekballo.wav",
     "-af", f"afade=t=in:d=0.25,afade=t=out:st={DUR - 3.0}:d=3.0", "-ar", "48000", f"{W}/musica3.wav"])

json.dump({"duration": DUR, "speech": [[at, at + (b - a)] for at, _, a, b in VOZES], "segments": []},
          open(f"{W}/fala3.json", "w"), indent=1)
print("ok")
