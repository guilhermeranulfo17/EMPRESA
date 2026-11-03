"""Cut speech stretches from the raw video into the bottom panel (1080x960, SDR), trimming pauses.
usage: build_bottom.py SRC cuts.json NAME OUTDIR [--cx 0.49] [--cy 0.53] [--crop-h 1700]
  cuts.json: {"NAME": [[start, end], ...]}  (source seconds, one stretch of speech per pair)
  --cx/--cy: face centre as a fraction of the source frame (check with a still first)
  --crop-h:  source pixels of height to keep (smaller = closer). Width follows the 9:8 panel.
Writes OUTDIR/NAME_bottom.mp4 and NAME_bottom_map.json."""
import argparse, json, subprocess
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('cuts'); ap.add_argument('name'); ap.add_argument('out')
ap.add_argument('--cx', type=float, default=0.49); ap.add_argument('--cy', type=float, default=0.53); ap.add_argument('--crop-h', type=int, default=1700)
A = ap.parse_args()
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation',
                                   '-of', 'json', A.src], capture_output=True, text=True).stdout)['streams'][0]
w, h = probe['width'], probe['height']
rot = abs(int(next((d.get('rotation', 0) for d in probe.get('side_data_list', []) if 'rotation' in d), 0)))
if rot in (90, 270): w, h = h, w
ch = min(A.crop_h, h); cw = min(w, int(ch * 1080 / 960) // 2 * 2)
x = int(min(max(0, A.cx * w - cw / 2), w - cw)) // 2 * 2; y = int(min(max(0, A.cy * h - ch * 0.45), h - ch)) // 2 * 2
vf = f"crop={cw}:{ch}:{x}:{y},scale=1080:960:flags=lanczos,eq=contrast=1.04:saturation=1.1,fps=30,format=yuv420p,setsar=1"
rng = json.load(open(A.cuts))[A.name]; PRE, POST = 0.06, 0.14; pieces = []
for s, e in rng:
    s, e = max(0, s - PRE), e + POST
    if pieces and s - pieces[-1][1] < 0.12: pieces[-1][1] = e
    else: pieces.append([s, e])
args = ['ffmpeg', '-v', 'error', '-y']
for s, e in pieces: args += ['-ss', f'{s:.3f}', '-t', f'{e - s:.3f}', '-i', A.src]
fc = ''
for i, (s, e) in enumerate(pieces):
    d = e - s
    fc += f'[{i}:v]{vf},setpts=PTS-STARTPTS[v{i}];[{i}:a:0]aresample=48000,atrim=0:{d:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d - 0.03:.3f}:d=0.03[a{i}];'
fc += ''.join(f'[v{i}][a{i}]' for i in range(len(pieces))) + f'concat=n={len(pieces)}:v=1:a=1[v][a]'
args += ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium',
         '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', f'{A.out}/{A.name}_bottom.mp4']
subprocess.run(args, check=True)   # one 4K input per piece: run one cut at a time (memory)
m, t = [], 0.0
for s, e in pieces: m.append({'src_s': round(s, 3), 'src_e': round(e, 3), 'out_s': round(t, 3), 'out_e': round(t + e - s, 3)}); t += e - s
json.dump(m, open(f'{A.out}/{A.name}_bottom_map.json', 'w'), indent=1)
print(A.name, 'pieces', len(pieces), 'dur %.2f' % t, 'crop', cw, ch, x, y)
