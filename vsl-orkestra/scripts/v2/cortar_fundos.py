"""Corta os vídeos de fundo (Mixkit, licença livre) em planos verticais 1080x1920 a 30 qps, um arquivo por plano.
Cada plano: (nome, id do Mixkit, início no original em s, duração em s, centro do recorte 0..1, velocidade).
Saída em public/v2/fundos/<nome>.mp4 (sem áudio)."""
import subprocess, json, os
B = "public/v2/bruto"; S = "public/v2/fundos"; os.makedirs(S, exist_ok=True)
PLANOS = [
    ("s1a", 31414, 0.5, 2.4, 0.45, 1.0),   # quarto escuro, despertador na mesinha
    ("s1b", 39782, 1.0, 3.9, 0.42, 1.0),   # Mariana na cama mandando a mensagem
    ("s2a", 4672, 4.0, 2.3, 0.50, 1.0),    # buffet servindo no meio de uma festa
    ("s2b", 50754, 0.5, 1.4, 0.45, 1.0),   # dormindo
    ("s3a", 50813, 1.0, 2.7, 0.40, 1.0),   # de manhã, respondendo no celular
    ("s3b", 8745, 1.0, 2.3, 0.55, 1.0),    # ela no sofá, sorrindo e digitando
    ("s3c", 8745, 8.0, 2.2, 0.57, 1.0),
    ("s4", 22066, 5.4, 1.8, 0.50, 1.5),    # cortina abrindo para a luz da manhã
    ("s5a", 10445, 0.5, 3.9, 0.52, 1.0),   # à noite no sofá, tranquila, no celular
    ("s5b", 39789, 5.0, 3.9, 0.62, 1.0),
    ("s6a", 31408, 3.2, 2.9, 0.33, 1.0),   # manhã, café, mão pegando
    ("s6b", 50768, 2.0, 2.9, 0.55, 1.0),   # café da manhã com o celular
    ("s7a", 4817, 1.0, 2.5, 0.25, 1.0),    # dona confiante no escritório
    ("s7b", 4817, 6.5, 2.6, 0.30, 1.0),
    ("s8a", 5111, 2.5, 3.2, 0.50, 1.0),    # bolo de aniversário
    ("s8c", 5101, 3.6, 3.1, 0.50, 1.0),    # mesa de festa com balões caindo
    ("s9a", 34367, 0.0, 3.4, 0.50, 1.0),   # luzes em movimento (fundo da marca)
    ("s9b", 34367, 6.0, 3.6, 0.35, 1.0),
    ("s10", 32001, 3.0, 2.9, 0.52, 1.0),   # pai e filha, presente de aniversário
]
import sys
so = sys.argv[1:]
for nome, vid, ini, dur, cx, vel in PLANOS:
    if so and nome not in so: continue
    src = f"{B}/{vid}.mp4"
    w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip().split(",")[:2])
    cw = min(w, round(h * 9 / 16 / 2) * 2)
    x = max(0, min(w - cw, round(w * cx - cw / 2)))
    vf = f"setpts=PTS/{vel},crop={cw}:{h}:{x}:0,scale=1080:1920:flags=lanczos,fps=30,format=yuv420p"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(ini), "-t", str(dur * vel), "-i", src, "-vf", vf,
                    "-an", "-c:v", "libx264", "-crf", "17", "-preset", "medium", f"{S}/{nome}.mp4"], check=True)
    print(nome, vid, f"{w}x{h}", "x", x)
json.dump([{"nome": n, "mixkit": v} for n, v, *_ in PLANOS], open(f"{S}/planos.json", "w"))
