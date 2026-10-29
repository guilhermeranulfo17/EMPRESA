#!/usr/bin/env python3
"""Jump cuts: keep only the chosen stretches of a video, tighten the pauses, and alternate a light punch-in at
every cut so the jumps read as deliberate.

usage: cortes.py VIDEO KEEP.json OUT.mp4 [--zoom 1.12] [--face-y 0.35] [--width 1080]
KEEP.json: [[start, end], ...] in source seconds (take them from fala.json "speech", dropping false starts and
repeated takes; keep the last complete take). Each stretch gets 0.06 s before and 0.12 s after, clipped so stretches
never overlap. Odd stretches are zoomed in towards (centre, face-y); audio gets 10 ms fades at every edge.
Prints the new start of each stretch, to map transcript times onto the cut video.
"""
import argparse, json, subprocess

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('keep'); ap.add_argument('out')
ap.add_argument('--zoom', type=float, default=1.12); ap.add_argument('--face-y', type=float, default=0.35)
ap.add_argument('--width', type=int, default=1080)
a = ap.parse_args()

dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video],
                           capture_output=True, text=True, check=True).stdout)
keep = sorted(json.load(open(a.keep)))
segs = []
for i, (s, e) in enumerate(keep):
    s0 = max(0.0, s - 0.06, segs[-1][1] if segs else 0.0)
    e1 = min(dur, e + 0.12, keep[i + 1][0] - 0.02 if i + 1 < len(keep) else dur)
    segs.append((round(s0, 3), round(e1, 3)))

W = a.width; H = round(W * 16 / 9 / 2) * 2
parts, labels, t = [], [], 0.0
for i, (s, e) in enumerate(segs):
    z = a.zoom if i % 2 else 1.0
    zw, zh = round(W * z / 2) * 2, round(H * z / 2) * 2
    crop = f'crop={W}:{H}:{(zw - W) // 2}:{max(0, min(zh - H, round(zh * a.face_y - H * a.face_y)))}'
    d = e - s
    parts.append(f'[0:v]trim={s}:{e},setpts=PTS-STARTPTS,scale={W}:{H}:force_original_aspect_ratio=increase,'
                 f'crop={W}:{H},scale={zw}:{zh},{crop},setsar=1[v{i}];'
                 f'[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={max(0, d - 0.01):.3f}:d=0.01[a{i}]')
    labels.append(f'[v{i}][a{i}]')
    print(f'trecho {i + 1}: {s:7.2f}-{e:7.2f} -> começa em {t:6.2f}s  (zoom {z:.2f})')
    t += d
fc = ';'.join(parts) + ';' + ''.join(labels) + f'concat=n={len(segs)}:v=1:a=1[v][a]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30',
                '-c:a', 'aac', '-b:a', '192k', a.out], check=True)
print(f'duração final: {t:.2f}s (era {dur:.2f}s)')
