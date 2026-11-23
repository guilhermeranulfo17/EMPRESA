"""Animações de texto no estilo do logo OUTSIDE (estilo aprovado para os vídeos do projeto): letra condensada e pesada, cortada por uma linha diagonal.
Cada título entra com a metade de cima vindo da esquerda e a de baixo vindo da direita, encaixa,
cresce de leve enquanto fica na tela e sai se separando. Gera um .mov com transparência por título.
uso: titulos.py TITULOS.json --saida PASTA
TITULOS.json:
  {"titulos": {"nome": {"linhas": [[["ALGUÉM","b"]],[["PRECISA","b"],["IR.","l"]]], "tamanho": 260, "dur": 1.4}, ...},
   "fim": {"serif": "Experience · 2ª edição", "grande": "JANEIRO DE 2027", "medio": "UBERLÂNDIA – MG",
           "botao": "INSCREVA-SE PELO LINK DA BIO", "dur": 8}}
  cor: "b" = branco, "l" = laranja da marca. Gera PASTA/mg/NOME.mov (com transparência) e PASTA/mg/fim.mov.
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTS = f"{AQUI}/fonts"
ANTON = f"{FONTS}/Anton-Regular.ttf"
ARCHIVO = f"{FONTS}/Archivo-ExtraBold.ttf"
SERIF = f"{FONTS}/InstrumentSerif-Italic.ttf"
LOGO = os.path.join(AQUI, "..", "..", "..", "..", "outside-experience", "public", "outside-logo.png")
W = "."  # pasta de saída (trocada por --saida)
FPS = 30
LARG = 1080
BRANCO = (255, 255, 255, 255)
LARANJA = (242, 106, 27, 255)


def ease_out(p):
    p = min(1, max(0, p))
    return 1 - (1 - p) ** 3


def ease_in(p):
    p = min(1, max(0, p))
    return p ** 3


def bloco_texto(linhas, tamanho, condensar=0.9, entrelinha=0.98):
    """linhas: lista de listas de (texto, cor). Devolve imagem RGBA com o texto centralizado."""
    fonte = ImageFont.truetype(ANTON, tamanho)
    alturas, larguras, imgs = [], [], []
    for linha in linhas:
        partes = []
        for txt, cor in linha:
            bb = fonte.getbbox(txt)
            w, h = bb[2] - bb[0], tamanho
            im = Image.new("RGBA", (w + 4, int(h * 1.25)), (0, 0, 0, 0))
            ImageDraw.Draw(im).text((-bb[0] + 2, 0), txt, font=fonte, fill=cor)
            partes.append(im)
        esp = int(tamanho * 0.22)
        w = sum(p.width for p in partes) + esp * (len(partes) - 1)
        li = Image.new("RGBA", (w, partes[0].height), (0, 0, 0, 0))
        x = 0
        for p in partes:
            li.alpha_composite(p, (x, 0))
            x += p.width + esp
        li = li.resize((max(1, int(li.width * condensar)), li.height), Image.LANCZOS)
        imgs.append(li)
        larguras.append(li.width)
        alturas.append(int(tamanho * entrelinha))
    larg = max(larguras)
    if larg > LARG - 80:  # nunca passar da tela
        f = (LARG - 80) / larg
        imgs = [i.resize((int(i.width * f), int(i.height * f)), Image.LANCZOS) for i in imgs]
        alturas = [int(a * f) for a in alturas]
        larg = LARG - 80
    alt = sum(alturas) + imgs[-1].height - alturas[-1]
    bloco = Image.new("RGBA", (LARG, alt + 120), (0, 0, 0, 0))
    y = 60
    faixas = []
    for im, a in zip(imgs, alturas):
        bloco.alpha_composite(im, ((LARG - im.width) // 2, y))
        al = np.array(im)[:, :, 3].max(1)
        linhas_tinta = np.where(al > 40)[0]
        topo, fundo = (y + linhas_tinta[0], y + linhas_tinta[-1]) if len(linhas_tinta) else (y, y + a)
        faixas.append((topo, fundo))
        y += a
    bloco.info["faixas"] = faixas
    return bloco


def com_sombra(bloco, raio=22, forca=0.75):
    faixas = bloco.info.get("faixas")
    a = np.array(bloco)[:, :, 3].astype(np.float32) * forca
    sombra = Image.new("RGBA", bloco.size, (0, 0, 0, 0))
    s = np.zeros((bloco.height, bloco.width, 4), np.uint8)
    s[:, :, 3] = a.astype(np.uint8)
    sombra = Image.fromarray(s).filter(ImageFilter.GaussianBlur(raio))
    out = Image.new("RGBA", bloco.size, (0, 0, 0, 0))
    out.alpha_composite(sombra, (0, 8))
    out.alpha_composite(bloco)
    if faixas:
        out.info["faixas"] = faixas
    return out


def mascaras(w, h, faixas=None, inclinacao=-0.05):
    """corta cada linha de texto na diagonal, como o logo (sobe da esquerda para a direita).
    A parte de cima de todas as linhas forma uma metade; a de baixo, a outra."""
    yy, xx = np.mgrid[0:h, 0:w]
    faixas = faixas or [(0, h)]
    cima = np.zeros((h, w), bool)
    limites = [0] + [(faixas[i][1] + faixas[i + 1][0]) // 2 for i in range(len(faixas) - 1)] + [h]
    for k, (topo, fundo) in enumerate(faixas):
        meio = topo + (fundo - topo) * 0.58
        corte = meio + (xx - w / 2) * inclinacao
        dentro = (yy >= limites[k]) & (yy < limites[k + 1])
        cima |= dentro & (yy < corte)
    cima = cima.astype(np.uint8) * 255
    return Image.fromarray(cima), Image.fromarray(255 - cima)


def animar(base, dur, saida, entrada=0.38, saida_t=0.22, desloc=260, cresce=0.035, sai=True):
    w, h = base.size
    m_cima, m_baixo = mascaras(w, h, base.info.get("faixas"))
    cima = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cima.paste(base, (0, 0), m_cima)
    baixo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    baixo.paste(base, (0, 0), m_baixo)
    n = int(round(dur * FPS))
    os.makedirs(saida, exist_ok=True)
    for i in range(n):
        t = i / FPS
        pe = ease_out(t / entrada)
        ps = ease_in((t - (dur - saida_t)) / saida_t) if sai else 0
        dx = int((1 - pe) * desloc + ps * 70)
        alfa = min(1, t / (entrada * 0.6)) * (1 - ps)
        esc = 1 + cresce * min(1, t / dur)
        quadro = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        quadro.alpha_composite(cima, (-dx, 0))
        quadro.alpha_composite(baixo, (dx, 7))  # fresta fina, como no logo
        if esc != 1:
            q = quadro.resize((int(w * esc), int(h * esc)), Image.BICUBIC)
            quadro = q.crop(((q.width - w) // 2, (q.height - h) // 2, (q.width - w) // 2 + w, (q.height - h) // 2 + h))
        if alfa < 1:
            a = np.array(quadro)
            a[:, :, 3] = (a[:, :, 3].astype(np.float32) * alfa).astype(np.uint8)
            quadro = Image.fromarray(a)
        quadro.save(f"{saida}/f{i:04d}.png")
    return n


def codificar(pasta, mov):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{pasta}/f%04d.png",
                    "-c:v", "qtrle", "-pix_fmt", "argb", mov], check=True)


def titulo(nome, linhas, tamanho, dur, **kw):
    base = com_sombra(bloco_texto(linhas, tamanho))
    pasta = f"{W}/mg/{nome}"
    animar(base, dur, pasta, **kw)
    codificar(pasta, f"{W}/mg/{nome}.mov")
    return base.height


def encerramento(dur=8.0, serif_txt="Experience · 2ª edição", grande="JANEIRO DE 2027", medio="UBERLÂNDIA – MG", botao_txt="INSCREVA-SE PELO LINK DA BIO"):
    """logo montando pela diagonal + dados da edição aparecendo em sequência"""
    pasta = f"{W}/mg/fim"
    os.makedirs(pasta, exist_ok=True)
    logo = Image.open(LOGO).convert("RGBA")
    lw = 760
    logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    lh = logo.height
    # a diagonal do próprio logo: de (0, 72%) a (largura, 55%)
    yy, xx = np.mgrid[0:lh, 0:lw]
    corte = lh * 0.715 - (xx / lw) * lh * 0.165
    m_cima = Image.fromarray(((yy < corte) * 255).astype(np.uint8))
    m_baixo = Image.fromarray(((yy >= corte) * 255).astype(np.uint8))
    l_cima = Image.new("RGBA", logo.size, (0, 0, 0, 0))
    l_cima.paste(logo, (0, 0), m_cima)
    l_baixo = Image.new("RGBA", logo.size, (0, 0, 0, 0))
    l_baixo.paste(logo, (0, 0), m_baixo)

    serif = ImageFont.truetype(SERIF, 84)
    anton_g = ImageFont.truetype(ANTON, 150)
    anton_m = ImageFont.truetype(ANTON, 96)
    archivo = ImageFont.truetype(ARCHIVO, 46)

    def camada(txt, fonte, cor, condensar=1.0):
        bb = fonte.getbbox(txt)
        im = Image.new("RGBA", (bb[2] - bb[0] + 8, bb[3] + 20), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((-bb[0] + 4, 0), txt, font=fonte, fill=cor)
        if condensar != 1.0:
            im = im.resize((int(im.width * condensar), im.height), Image.LANCZOS)
        return com_sombra(im, raio=14, forca=0.6)

    itens = [
        (camada(serif_txt, serif, BRANCO), 820, 0.9),
        (camada(grande, anton_g, BRANCO, 0.92), 940, 1.15),
        (camada(medio, anton_m, LARANJA, 0.92), 1120, 1.35),
    ]
    # botão "inscreva-se pelo link da bio"
    txt = botao_txt
    bb = archivo.getbbox(txt)
    bw, bh = bb[2] - bb[0] + 80, 96
    botao = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(botao)
    d.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=48, fill=LARANJA)
    d.text(((bw - (bb[2] - bb[0])) // 2 - bb[0], (bh - (bb[3] - bb[1])) // 2 - bb[1]), txt, font=archivo, fill=(12, 11, 10, 255))
    itens.append((botao, 1330, 1.7))

    n = int(dur * FPS)
    for i in range(n):
        t = i / FPS
        q = Image.new("RGBA", (LARG, 1920), (0, 0, 0, 0))
        pe = ease_out((t - 0.15) / 0.55)
        dx = int((1 - pe) * 420)
        a = min(1, max(0, (t - 0.15) / 0.3))
        for parte, sinal in ((l_cima, -1), (l_baixo, 1)):
            p = parte
            if a < 1:
                arr = np.array(p)
                arr[:, :, 3] = (arr[:, :, 3] * a).astype(np.uint8)
                p = Image.fromarray(arr)
            q.alpha_composite(p, ((LARG - lw) // 2 + sinal * dx, 430))
        for im, y, t0 in itens:
            p = ease_out((t - t0) / 0.5)
            if p <= 0:
                continue
            arr = np.array(im)
            arr[:, :, 3] = (arr[:, :, 3] * min(1, p)).astype(np.uint8)
            q.alpha_composite(Image.fromarray(arr), ((LARG - im.width) // 2, y + int((1 - p) * 40)))
        q.save(f"{pasta}/f{i:04d}.png")
    codificar(pasta, f"{W}/mg/fim.mov")



if __name__ == "__main__":
    import argparse
    import json
    ap = argparse.ArgumentParser()
    ap.add_argument("json")
    ap.add_argument("--saida", default=".")
    ap.add_argument("--so", nargs="*", default=[])
    a = ap.parse_args()
    W = os.path.abspath(a.saida)
    cfg = json.load(open(a.json, encoding="utf-8"))
    cores = {"b": BRANCO, "l": LARANJA}
    for nome, t in cfg.get("titulos", {}).items():
        if a.so and nome not in a.so:
            continue
        linhas = [[(txt, cores[c]) for txt, c in linha] for linha in t["linhas"]]
        print(nome, titulo(nome, linhas, t["tamanho"], t["dur"]), flush=True)
    if "fim" in cfg and (not a.so or "fim" in a.so):
        f = cfg["fim"]
        encerramento(f.get("dur", 8.0), f.get("serif", ""), f.get("grande", ""), f.get("medio", ""), f.get("botao", ""))
        print("fim", flush=True)
