"""Tempos por palavra da narração (sem gastar crédito): o roteiro é conhecido; cada trecho de fala
vem da detecção de silêncio (ffmpeg silencedetect, conferido com a transcrição local do Whisper), e
dentro do trecho as palavras são distribuídas pelo número de sílabas, com respiro nas vírgulas.
Saída: public/audio/legenda.json no formato Caption do Remotion (text, startMs, endMs)."""
import json, re, sys, os

TRECHOS = [  # (texto exato do roteiro, início s, fim s)
    ("Sexta,", 0.00, 0.64),
    ("onze da noite.", 1.21, 2.56),
    ("Chega no WhatsApp do seu buffet:", 3.64, 5.47),
    ("quanto fica pra cinquenta pessoas no sábado?", 5.79, 7.88),
    ("Se você responde no dia seguinte,", 8.14, 9.88),
    ("ela já pediu orçamento em mais três buffets.", 10.01, 12.12),
    ("E fecha com quem respondeu primeiro.", 12.38, 14.46),
    ("O Orkestra resolve isso de um jeito simples:", 15.28, 17.85),
    ("o seu cliente monta o orçamento sozinho,", 18.26, 20.28),
    ("no link do seu buffet.", 20.42, 21.50),
    ("Olha na prática.", 22.03, 22.90),
    ("Ele escolhe o tipo de festa, o pacote, quantos convidados, coloca a mesa temática...", 23.42, 28.76),
    ("e o valor aparece na hora, já com a sua regra de sábado", 29.51, 32.89),
    ("e o sinal pra reservar a data.", 33.34, 35.01),
    ("Do seu lado, o pedido chega com tudo preenchido:", 35.91, 39.08),
    ("data, pacote e valor.", 39.60, 41.56),
    ("Você só conversa com quem já quer fechar.", 42.04, 43.83),
    ("Você testa catorze dias de graça, sem cartão, com os seus pacotes.", 44.68, 48.67),
    ("Me responde 'quero'", 49.48, 50.20),
    ("aqui que eu monto a página do seu buffet.", 50.35, 52.72),
]

def silabas(p):
    return max(1, len(re.findall(r"[aeiouyáéíóúâêôãõà]+", p.lower())))

out = []
for texto, ini, fim in TRECHOS:
    palavras = texto.split()
    pesos = [silabas(p) + (0.9 if re.search(r"[,:]$", p) else 0) for p in palavras]
    total = sum(pesos); t = ini
    for p, w in zip(palavras, pesos):
        dur = (fim - ini) * w / total
        fala = dur - (0.9 * (fim - ini) / total if re.search(r"[,:]$", p) else 0)
        out.append({"text": p, "startMs": round(t * 1000), "endMs": round((t + fala) * 1000),
                    "timestampMs": round(t * 1000), "confidence": 1})
        t += dur
destino = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "legenda.json")
json.dump(out, open(destino, "w"), ensure_ascii=False, indent=1)
print(len(out), "palavras ->", destino)
