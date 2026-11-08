"""Narração do onboarding: baixa o MP3 de um capítulo, normaliza (-16 LUFS, pico -1,5 dBTP) e acha os
passos pelas pausas longas (<break time="1.3s" /> entre um passo e outro). Atualiza public/onboarding/tempos.json.
uso: python audio.py CAPITULO URL_DO_MP3     (ou um caminho local de MP3)"""
import json, os, re, subprocess, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.join(AQUI, '..', '..', 'public', 'onboarding')
cap, origem = sys.argv[1], sys.argv[2]
roteiro = json.load(open(os.path.join(AQUI, 'narracao.json')))
n_passos = len(roteiro[cap].split('<break'))
mp3 = os.path.join(RAIZ, 'audio', f'{cap}.mp3')
if origem.startswith('http'):
    urllib.request.urlretrieve(origem, mp3)
elif os.path.abspath(origem) != os.path.abspath(mp3):
    subprocess.run(['cp', origem, mp3], check=True)
wav = os.path.join(RAIZ, 'audio', f'{cap}.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', wav], check=True)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-40dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
ini = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', r)]
fim = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', r)]
pausas = sorted([(b - a, a, b) for a, b in zip(ini, fim) if a > 0.3 and b < dur - 0.1], reverse=True)
# os n-1 maiores silêncios são os <break> entre passos
quebras = sorted(pausas[: n_passos - 1], key=lambda x: x[1])
if len(quebras) != n_passos - 1:
    raise SystemExit(f'{cap}: esperava {n_passos - 1} pausas, achei {len(quebras)}')
menor = min(q[0] for q in quebras)
seguintes = [p[0] for p in pausas[n_passos - 1:n_passos]]
print(f'{cap}: {n_passos} passos, {dur:.1f}s; menor pausa entre passos {menor:.2f}s; maior pausa dentro de passo {seguintes[0] if seguintes else 0:.2f}s')
passos, t = [], 0.0
for _, a, b in quebras:
    passos.append([round(t, 2), round(a, 2)])
    t = b
passos.append([round(t, 2), round(dur, 2)])
arq = os.path.join(RAIZ, 'tempos.json')
tempos = json.load(open(arq)) if os.path.exists(arq) else {}
tempos[cap] = {'duracao': round(dur, 2), 'passos': passos}
json.dump(tempos, open(arq, 'w'), indent=1)
