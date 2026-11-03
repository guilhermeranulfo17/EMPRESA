import json, re, subprocess, sys, tempfile, os
import soundfile as sf, sherpa_onnx
src, out = sys.argv[1], sys.argv[2]
M = os.path.expanduser('~/.cache/editar-video/sherpa-onnx-whisper-medium')
wav = os.path.join(tempfile.mkdtemp(), 'a.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '16000', wav], check=True)
a, sr = sf.read(wav, dtype='float32'); dur = len(a) / sr
log = subprocess.run(['ffmpeg', '-i', wav, '-af', 'silencedetect=n=-30dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
edges = [0.0] + [x for p in zip(st, en + [dur] * (len(st) - len(en))) for x in p] + [dur]
sp = [[edges[i], edges[i + 1]] for i in range(0, len(edges) - 1, 2) if edges[i + 1] - edges[i] > 0.12]
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{M}/medium-encoder.int8.onnx', decoder=f'{M}/medium-decoder.int8.onnx',
        tokens=f'{M}/medium-tokens.txt', language='pt', task='transcribe', num_threads=4)
segs = []
for s, e in sp:
    i0, i1 = int(max(0, s - 0.1) * sr), int(min(dur, e + 0.1) * sr)
    stm = r.create_stream(); stm.accept_waveform(sr, a[i0:i1]); r.decode_stream(stm)
    segs.append({'s': round(s, 2), 'e': round(e, 2), 'text': stm.result.text.strip()}); print(f'{s:6.2f}-{e:6.2f}  {segs[-1]["text"]}', flush=True)
json.dump(segs, open(out, 'w'), ensure_ascii=False, indent=1)
