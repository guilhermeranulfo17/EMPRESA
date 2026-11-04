"""Map source-time sentences to clip time using the block maps written by build_bottom.
usage: maptime.py DIR sentences.json out.json   (sentences: [[src_s, src_e, "text"], ...]); order of blocks = DIR/frames.txt"""
import json, subprocess, sys
d, sj, oj = sys.argv[1:4]
pieces, off = [], 0.0
for line in open(f'{d}/frames.txt'):
    k = line.split()[0]
    m = json.load(open(f'{d}/{k}_bottom_map.json'))
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{d}/{k}_bottom.mp4'], capture_output=True, text=True).stdout)
    for p in m: pieces.append((p['src_s'], p['src_e'], p['out_s'] + off))
    off += dur
def f(t, side):
    best = None
    for s, e, o in pieces:
        if s - 0.05 <= t <= e + 0.05: return o + min(max(t, s), e) - s
        # nearest piece edge
        dd = min(abs(t - s), abs(t - e))
        if best is None or dd < best[0]: best = (dd, o + (0 if abs(t - s) < abs(t - e) else e - s))
    return best[1]
out = []
for s, e, txt in json.load(open(sj)):
    out.append({'s': round(f(s, 0), 2), 'e': round(f(e, 1), 2), 'text': txt}); print(f"{out[-1]['s']:6.2f}-{out[-1]['e']:6.2f}  {txt}")
json.dump(out, open(oj, 'w'), ensure_ascii=False, indent=1); print('total', round(off, 2))
