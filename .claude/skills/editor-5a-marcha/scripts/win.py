"""ASR + energy of arbitrary windows. usage: win.py SRC s-e [s-e ...]   (prints text, and 20ms dB envelope with -v)"""
import os, subprocess, sys, tempfile
import numpy as np, soundfile as sf, sherpa_onnx
src = sys.argv[1]; wins = [a for a in sys.argv[2:] if a != '-v']; v = '-v' in sys.argv
w = tempfile.mktemp(suffix='.wav'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-map', '0:a:0', '-ac', '1', '-ar', '16000', w], check=True)
a, sr = sf.read(w, dtype='float32'); M = os.path.expanduser('~/.cache/editar-video/sherpa-onnx-whisper-medium')
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{M}/medium-encoder.int8.onnx', decoder=f'{M}/medium-decoder.int8.onnx', tokens=f'{M}/medium-tokens.txt', language='pt', task='transcribe', num_threads=4)
for x in wins:
    s, e = map(float, x.split('-'))
    st = r.create_stream(); st.accept_waveform(sr, a[int(s * sr):int(e * sr)]); r.decode_stream(st)
    print(f'{s:7.2f}-{e:7.2f}  {st.result.text}')
    if v:
        h = int(0.02 * sr); print('   dB/20ms:', ' '.join(f'{20*np.log10(np.sqrt(np.mean(a[i:i+h]**2))+1e-9):.0f}' for i in range(int(s * sr), int(e * sr), h)))
