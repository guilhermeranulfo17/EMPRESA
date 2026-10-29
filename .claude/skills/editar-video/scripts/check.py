#!/usr/bin/env python3
"""Check the mix: each sound's onset against its cue, its level against the voice, and the final loudness.

usage: check.py SFX.wav SFX.cues.json ORIGINAL_VIDEO FINAL.mp4
Under speech a sound should sit about 6 to 12 dB below the voice; much lower and it disappears. Both the average
and the peak are compared, from the sound's own start: a short click can read quiet on average while its peak
clips above the voice.
"""
import json, subprocess, sys, tempfile, os, re
import numpy as np, soundfile as sf, librosa
fxp, cuesp, orig, final = sys.argv[1:5]; tmp = tempfile.mkdtemp()
def mono(src, name, extra=()):
    p = os.path.join(tmp, name); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '48000', *extra, p], check=True)
    return sf.read(p)[0]
fx = mono(fxp, 'fx.wav'); vo = mono(orig, 'vo.wav', ('-af', 'loudnorm=I=-16:TP=-2')); sr = 48000
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
pk = lambda x: 20 * np.log10(np.abs(x).max() + 1e-9)
env = librosa.onset.onset_strength(y=fx.astype(np.float32), sr=sr, hop_length=96)
on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=96, units='time', delta=0.02)
for c in json.load(open(cuesp)):
    near = on[np.abs(on - c['at']) < 0.12]
    err = f"{(near[np.argmin(np.abs(near - c['at']))] - c['at']) * 1000:+4.0f} ms" if len(near) else '  n/a  '
    # the sound from its own start (short clicks sit before their sync point and vanish in an average from `at`),
    # against the voice over the second around it (a micro-pause would make any sound look loud)
    s0 = max(0.0, min(c['at'], c.get('start', c['at'])) - 0.01)
    w = slice(int(s0 * sr), int((s0 + 0.15) * sr)); wv = slice(int(max(0, c['at'] - 0.4) * sr), int((c['at'] + 0.6) * sr))
    d = db(fx[w]) - db(vo[wv]); p = pk(fx[w]) - pk(vo[wv])
    flag = ''
    if c['over_speech']:
        if d < -14 and p < -10: flag = '  <- baixo demais'
        elif d > -4 or p > 4: flag = '  <- alto demais'
    print(f"{c['at']:6.2f}s {c['id']:32s} onset {err} | efeito {d:+5.1f} dB (pico {p:+5.1f}) vs voz{flag}")
log = subprocess.run(['ffmpeg', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', log)[-1]; P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', log)[-1]
print(f"final: {I} LUFS, true peak {P} dBTP")
