"""Converte os carrosséis da 5ª Marcha (cars_0*.py) para o formato do design antigo (post estilo Twitter)."""
import runpy, glob, json, re, csv, sys, os
GER, CAL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
cars = []
for f in sorted(glob.glob(os.path.join(GER, 'cars_0*.py'))): cars += runpy.run_path(f)['CARS']
data = {}
for r in csv.DictReader(open(CAL)):
    if r['formato'] == 'Carrossel': data[r['numero']] = r['data']
KEEP = {'IA', 'CRM', 'LGPD', 'ABC', 'CPF', 'B2B', 'SDR'}
def sc(t):
    t = re.sub(r'^\d+\.\s*', '', t.strip())
    words = t.split(' ')
    out = []
    for w in words:
        core = re.sub(r'[^\wÀ-ÿ]', '', w)
        out.append(w if core in KEEP else w.lower())
    s = ' '.join(out)
    s = re.sub(r'^(["“]?)([a-zà-ÿ])', lambda m: m.group(1) + m.group(2).upper(), s)
    s = re.sub(r'([?.!]\s+)([a-zà-ÿ])', lambda m: m.group(1) + m.group(2).upper(), s)
    s = s.replace(': ', ', ').rstrip('.')
    return s
def nofinal(t):
    return '\n\n'.join(p.rstrip().rstrip('.') for p in t.split('\n\n'))
for c in cars:
    num = f"C{c['n']:03d}"; d, m, y = data[num].split('/')
    slides = []
    for i, (tit, txt, vis) in enumerate(c['s']):
        if i == 0:
            slides.append({'texto': f"*{sc(c['capaA'])}*\n\n{nofinal(txt)} 👉"})
        else:
            slides.append({'texto': f"*{sc(tit)}*" + (f"\n\n{nofinal(txt)}" if txt else '')})
    leg = c['leg']
    parts = leg.split('\n\n')
    if parts[-1].startswith('#'): parts[-1] = ' '.join(parts[-1].split()[:3])
    json.dump({'nome': 'Guilherme Silva | Vendas B2B', 'handle': 'guisilva.vendas', 'tema': 'claro' if int(d) % 2 else 'escuro',
               'foto': 'avatar.jpg', 'numero': num, 'data': f'{y}-{m}-{d}', 'legenda': '\n\n'.join(parts), 'slides': slides},
              open(os.path.join(OUT, f'{num}.json'), 'w'), ensure_ascii=False, indent=1)
print(len(cars))
