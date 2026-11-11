"""Linha do tempo do vídeo de vendas v2 (fonte única para o áudio e para a montagem).
Gera src/v2/linha.json com: trechos de voz (de onde saem e onde entram), palavras da legenda com tempo,
cenas e planos de fundo. Tempos da fala vêm das ilhas (silêncio + Whisper local) de cada áudio;
dentro de cada ilha as palavras são distribuídas pelo número de sílabas.
uso: python3 scripts/v2/linha.py"""
import json, re

# (trecho do narrador no arquivo original: início, fim) -> entra no vídeo em
VOZ = [
    {"arq": "narrador", "de": 0.00, "ate": 1.59, "em": 0.20},
    {"arq": "cliente", "de": 0.00, "ate": 3.62, "em": 1.95},
    {"arq": "narrador", "de": 2.00, "ate": 4.64, "em": 5.65},
    {"arq": "narrador", "de": 5.13, "ate": 6.19, "em": 8.55},
    {"arq": "narrador", "de": 6.86, "ate": 10.12, "em": 9.95},
    {"arq": "narrador", "de": 10.85, "ate": 11.92, "em": 14.25},
    {"arq": "narrador", "de": 12.34, "ate": 18.89, "em": 15.75},
    {"arq": "narrador", "de": 19.26, "ate": 23.97, "em": 22.75},
    {"arq": "narrador", "de": 24.39, "ate": 28.39, "em": 27.85},
    {"arq": "narrador", "de": 28.96, "ate": 34.26, "em": 32.25},
    {"arq": "narrador", "de": 34.80, "ate": 40.61, "em": 37.95},
    {"arq": "narrador", "de": 41.13, "ate": 42.59, "em": 44.15},
]
DURACAO = 46.6

# texto exato de cada ilha (ilhas.json de cada áudio), na ordem
ILHAS = {
    "narrador": [
        "Sexta,", "onze da noite.", "Você tá no meio de", "outra festa.", "Ou dormindo.", "De manhã você responde.",
        "Mas ela já pediu em outros buffets e fechou com quem respondeu primeiro.", "Agora imagina o contrário.",
        "Ela abre o link do seu buffet,", "escolhe o", "pacote, os convidados, a mesa temática...",
        "e o valor aparece na hora.", "Você", "acorda com o pedido pronto.", "Data,", "pacote, valor", "e o sinal pra reservar.",
        "E o preço continua sendo seu.", "Você ajusta e", "fecha do seu jeito.", "Testa agora.",
        "Abre o link aqui embaixo e monta um orçamento como se", "fosse o seu cliente.", "Leva", "um minuto.",
        "Gostou?", "Eu mesmo deixo pronto com os seus pacotes,", "e você usa", "catorze dias grátis.", "Sem cartão.",
        "Antes da próxima sexta à noite.",
    ],
    "cliente": ["Oi!", "Quanto", "fica pra 50 pessoas no sábado?"],
}

CENAS = [  # (id, início, fim, planos [(arquivo, início)])
    ("c1", 0.0, 5.6, [("s1a", 0.0), ("s1b", 2.0)]),
    ("c2", 5.6, 8.5, [("s2a", 5.6), ("s2b", 7.6)]),
    ("c3", 8.5, 14.15, [("s3a", 8.5), ("s3b", 10.3), ("s3c", 12.4)]),
    ("c4", 14.15, 15.65, [("s4", 14.15)]),
    ("c5", 15.65, 22.6, [("s5a", 15.65), ("s5b", 19.1)]),
    ("c6", 22.6, 27.7, [("s6a", 22.6), ("s6b", 25.1)]),
    ("c7", 27.7, 32.1, [("s7a", 27.7), ("s7b", 29.9)]),
    ("c8", 32.1, 37.75, [("s8a", 32.1), ("s8c", 34.9)]),
    ("c9", 37.75, 43.95, [("s9a", 37.75), ("s9b", 40.85)]),
    ("c10", 43.95, DURACAO, [("s10", 43.95)]),
]


def silabas(p):
    return max(1, len(re.findall(r"[aeiouyáéíóúâêôãõà]+", p.lower())) + (1 if re.search(r"\d", p) else 0))


def palavras_do_audio(arq):
    ilhas = json.load(open(f"public/v2/audio/{arq}.ilhas.json"))
    textos = ILHAS[arq]
    assert len(ilhas) == len(textos), (arq, len(ilhas), len(textos))
    out = []
    for ilha, texto in zip(ilhas, textos):
        ps = texto.split()
        pesos = [silabas(p) + (0.6 if re.search(r"[,.?!]$", p) else 0) for p in ps]
        t, tot = ilha["ini"], sum(pesos)
        for p, w in zip(ps, pesos):
            d = (ilha["fim"] - ilha["ini"]) * w / tot
            out.append({"t": p, "ini": round(t, 3), "fim": round(t + d, 3)})
            t += d
    return out


pal = {a: palavras_do_audio(a) for a in ILHAS}
legenda = []
for v in VOZ:
    for w in pal[v["arq"]]:
        if w["ini"] >= v["de"] - 0.02 and w["fim"] <= v["ate"] + 0.05:
            legenda.append({"t": w["t"], "ini": round(w["ini"] - v["de"] + v["em"], 3), "fim": round(w["fim"] - v["de"] + v["em"], 3), "voz": v["arq"]})
# páginas da legenda: no máximo ~34 caracteres (2 linhas curtas), quebra em fim de frase
paginas, atual = [], []
for i, w in enumerate(legenda):
    if atual and len(" ".join(x["t"] for x in atual + [w])) > 42:
        paginas.append(atual); atual = []
    atual.append(w)
    txt = " ".join(x["t"] for x in atual)
    prox = legenda[i + 1] if i + 1 < len(legenda) else None
    pausa = prox is not None and prox["ini"] - w["fim"] > 0.25
    if re.search(r"[.?!]$", w["t"]) or (re.search(r",$", w["t"]) and len(txt) >= 14) or pausa:
        paginas.append(atual); atual = []
if atual:
    paginas.append(atual)
dados = {
    "duracao": DURACAO,
    "voz": VOZ,
    "cenas": [{"id": c, "ini": a, "fim": b, "planos": [{"arq": f, "ini": t} for f, t in pl]} for c, a, b, pl in CENAS],
    "legenda": [{"ini": p[0]["ini"], "fim": p[-1]["fim"], "palavras": p} for p in paginas],
    "palavra": {w["t"].strip(",.?!").lower() + "@" + str(round(w["ini"], 1)): w["ini"] for w in legenda},
}
json.dump(dados, open("src/v2/linha.json", "w"), ensure_ascii=False, indent=1)
for p in dados["legenda"]:
    print(f'{p["ini"]:6.2f} {p["fim"]:6.2f}  ' + " ".join(f'{w["t"]}' for w in p["palavras"]))
