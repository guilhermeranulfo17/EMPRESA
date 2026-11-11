"""Busca vídeos no Mixkit e monta uma folha de miniaturas para escolher olhando.
uso: python3 mixkit_busca.py PASTA_SAIDA termo1 termo2 ...   (termo = slug da página, ex.: phone-night)
Cada termo gera PASTA/termo.jpg (folha) e PASTA/termo.txt (id | título)."""
import html, re, subprocess, sys, pathlib, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"}

def baixar(url, destino=None):
    r = subprocess.run(["curl", "-sL", "--max-time", "40", "-A", UA["User-Agent"], url] + (["-o", str(destino)] if destino else []), capture_output=True)
    return r.stdout

def buscar(termo, saida, limite=24):
    h = baixar(f"https://mixkit.co/free-stock-video/{termo}/").decode("utf8", "ignore")
    itens = []
    for m in re.finditer(r'<img src="https://assets\.mixkit\.co/videos/(\d+)/[^"]+" class="item-grid-video-player__thumb" alt="([^"]*)"', h):
        if m.group(1) not in [i[0] for i in itens]:
            itens.append((m.group(1), html.unescape(m.group(2))))
    itens = itens[:limite]
    pasta = saida / f"_{termo}"
    pasta.mkdir(parents=True, exist_ok=True)
    arqs = []
    for k, (vid, titulo) in enumerate(itens):
        a = pasta / f"{k:02d}.jpg"
        baixar(f"https://assets.mixkit.co/videos/{vid}/{vid}-thumb-360-0.jpg", a)
        b = pasta / f"{k:02d}t.jpg"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(a), "-vf",
                        f"scale=384:216:force_original_aspect_ratio=decrease,pad=384:216:(ow-iw)/2:(oh-ih)/2,drawtext=text='{vid}':x=6:y=6:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.7", str(b)])
        if b.exists():
            arqs.append(b)
    (saida / f"{termo}.txt").write_text("\n".join(f"{v} | {t}" for v, t in itens))
    if arqs:
        lista = pasta / "l.txt"
        lista.write_text("".join(f"file '{a}'\nduration 1\n" for a in arqs))
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-vf", "tile=5x5", "-frames:v", "1", str(saida / f"{termo}.jpg")])
    print(termo, len(itens))

saida = pathlib.Path(sys.argv[1]); saida.mkdir(parents=True, exist_ok=True)
for t in sys.argv[2:]:
    buscar(t, saida)
