"""Fine look at chosen takes: split each range at micro-pauses and transcribe each bit (whisper medium).
usage: micro.py SRC cuts.json [n_db=-36] [min_sil=0.06]
Prints, per range, sub-chunks 'start-end text' plus a 20 ms energy envelope summary to spot repeats."""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf, sherpa_onnx
src, cj = sys.argv[1], sys.argv[2]
ndb = float(sys.argv[3]) if len(sys.argv) > 3 else -36; ms = float(sys.argv[4]) if len(sys.argv) > 4 else 0.06
wav = os.path.join(tempfile.mkdtemp(), 'a.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-map', '0:a:0', '-ac', '1', '-ar', '16000', wav], check=True)
a, sr = sf.read(wav, dtype='float32')
M = os.path.expanduser('~/.cache/editar-video/sherpa-onnx-whisper-medium')
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{M}/medium-encoder.int8.onnx', decoder=f'{M}/medium-decoder.int8.onnx',
        tokens=f'{M}/medium-tokens.txt', language='pt', task='transcribe', num_threads=4)
def asr(s, e):
    st = r.create_stream(); st.accept_waveform(sr, a[int(max(0, s - 0.05) * sr):int((e + 0.05) * sr)]); r.decode_stream(st); return st.result.text.strip()
hop = int(0.01 * sr)
cuts = json.load(open(cj))
for k, rngs in cuts.items():
    for s, e in rngs:
        seg = a[int(s * sr):int(e * sr)]
        rms = np.array([np.sqrt(np.mean(seg[i:i + hop] ** 2) + 1e-12) for i in range(0, len(seg) - hop, hop)])
        db = 20 * np.log10(rms); thr = max(ndb, db.max() - 30)
        on = db > thr
        # silences of at least ms
        bits, i, n = [], 0, len(on)
        while i < n:
            if on[i]:
                j = i
                while j < n and (on[j] or (j + int(ms / 0.01) < n and on[j:j + int(ms / 0.01)].any())): j += 1
                bits.append((s + i * 0.01, s + j * 0.01)); i = j
            else: i += 1
        print(f'== {k} [{s:.2f},{e:.2f}]  full: {asr(s, e)}')
        rows = [(b0, b1, asr(b0, b1)) for b0, b1 in bits if b1 - b0 >= 0.08]
        norm = lambda x: re.sub(r'[^a-zà-ú0-9 ]', '', x.lower()).split()
        for i, (b0, b1, tx) in enumerate(rows):
            flag = ''
            if i + 1 < len(rows):
                w, nx = norm(tx), norm(rows[i + 1][2])
                # this bit restarts in the next one: its first words come again at the start of the next bit
                if w and nx and (nx[:min(2, len(w))] == w[:min(2, len(w))] or (len(w) <= 3 and all(x in nx[:6] for x in w))):
                    flag = '   <-- REPETIDO no pedaço seguinte?'
            print(f'   {b0:7.2f}-{b1:7.2f}  {tx}{flag}')
