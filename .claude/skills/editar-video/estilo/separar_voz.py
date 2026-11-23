"""Isola a voz de um áudio (tira música de fundo e eco da sala) com o Demucs (htdemucs).
uso: DMX/bin/python separar_voz.py ENTRADA.wav SAIDA_voz.wav [ENTRADA2.wav SAIDA2_voz.wav ...]
ENTRADA: wav estéreo 44,1 kHz (ffmpeg -i video.mp4 -ac 2 -ar 44100 entrada.wav).
Instalação (uma vez, num venv separado; precisa dos hosts download.pytorch.org e dl.fbaipublicfiles.com liberados):
  python3 -m venv DMX && DMX/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch torchaudio
  DMX/bin/pip install demucs==4.0.1 soundfile
Salva com soundfile (o torchaudio novo exige torchcodec para salvar, por isso não usamos o CLI do demucs).
"""
import sys

import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model

m = get_model("htdemucs")
m.eval()
voz = m.sources.index("vocals")
args = sys.argv[1:]
for ent, sai in zip(args[0::2], args[1::2]):
    a, sr = sf.read(ent, dtype="float32", always_2d=True)
    if a.shape[1] == 1:
        a = a.repeat(2, 1)
    x = torch.from_numpy(a.T.copy())[None]
    ref, std = x.mean(1).mean(), x.mean(1).std()
    with torch.no_grad():
        out = apply_model(m, (x - ref) / std, shifts=1, overlap=0.25, progress=False)[0]
    sf.write(sai, (out[voz] * std + ref).numpy().T, sr)
    print(sai, flush=True)
