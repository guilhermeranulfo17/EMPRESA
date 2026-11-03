"""Build an ASS file: hook headline + 2-4 word dynamic captions (timed by character share inside each segment)."""
import json, re, sys
cj, out = sys.argv[1], sys.argv[2]
d = json.load(open(cj))
def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f'{h}:{m:02d}:{s:05.2f}'
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Archivo Black,76,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,8,2,5,60,60,0,1
Style: Hook,Archivo Black,76,&H00141414,&H00141414,&H0000D7FF,&H0000D7FF,0,0,0,0,100,100,0,0,3,22,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
for text, s, e in d['hook']:
    lines = text.split('|'); y0 = 300 - (len(lines) - 1) * 55
    for i, ln in enumerate(lines):
        ev.append(f'Dialogue: 1,{ts(s)},{ts(e)},Hook,,0,0,0,,{{\\pos(540,{y0 + i * 110})\\fad(0,120)\\t(0,140,\\fscx104\\fscy104)\\t(140,260,\\fscx100\\fscy100)}}{ln}')
mute = d.get('mute', [])
YEL = '{\\c&H00D7FF&}'; WHT = '{\\c&HFFFFFF&}'
for s, e, text in d['segs']:
    words = text.split()
    # chunks of up to 3 words / 16 chars
    chunks, cur = [], []
    for w in words:
        if cur and (len(cur) >= 3 or len(' '.join(cur + [w]).replace('*', '')) > 16): chunks.append(cur); cur = []
        cur.append(w)
        if re.search(r'[.,!?:]["”]?$', w.replace('*', '')) and len(cur) >= 2: chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    tot = sum(len(' '.join(c).replace('*', '')) + 2 for c in chunks); t = s
    for c in chunks:
        dur = (e - s) * (len(' '.join(c).replace('*', '')) + 2) / tot; a, b = t, t + dur; t = b
        if any(a < me and b > ms for ms, me in mute): continue
        txt = ' '.join(c)
        txt = re.sub(r'\*([^*]+)\*', lambda m: YEL + m.group(1) + WHT, txt)
        if txt.count('*') == 1: txt = txt.replace('*', '')
        ev.append(f'Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\pos(540,962)\\fscx88\\fscy88\\t(0,90,\\fscx100\\fscy100)}}{txt}')
open(out, 'w').write(head + '\n'.join(ev) + '\n')
print(out, len(ev), 'events')
