"""Gera a página de roteiros para gravar (uma seção por dia de gravação; cada Reel com a ficha completa).
uso: python3 -I pagina_roteiros.py PASTA_5A_MARCHA SAIDA.html"""
import runpy, glob, os, sys, csv, json, html
OUT, DST = sys.argv[1], sys.argv[2]
R = {}
for f in sorted(glob.glob(os.path.join(OUT, '07_GESTAO/gerador/reels_*.py'))):
    for r in runpy.run_path(f)['REELS']: R[r['n']] = r
cal = list(csv.DictReader(open(os.path.join(OUT, '04_CALENDARIO/calendario_30_dias.csv'))))
cars = {l['data']: l for l in cal if l['formato'] == 'Carrossel'}
GRAV = {'frente': 'Câmera frontal', 'simulacao': 'Simulação (troca de papel)', 'tela': 'Fala + tela gravada à parte', 'quadro': 'Câmera frontal com quadro animado'}
sess = {}
for l in cal:
    if l['formato'] != 'Reel': continue
    r = R[int(l['numero'][1:])]
    falas = []
    for t, lab, txt in r['b']:
        falas.append({'t': t.replace('–', '-'), 'l': lab, 'f': [x.strip() for x in txt.split('|') if x.strip()]})
    c = cars.get(l['data'])
    g = l['gravar_em']
    sess.setdefault(g, {'id': 'd' + g[:2] + g[3:5] + g[8:10], 'ate': g, 'dia': l['dia_semana'] if g == l['data'] else '', 'reels': []})['reels'].append({
        'n': l['numero'], 'pub': l['data'], 'hora': l['horario'], 'dia': l['dia_semana'], 'tema': r['tema'], 'serie': l['serie'], 'tipo': l['tipo'],
        'grav': GRAV[r['grav']], 'gA': r['gA'], 'gB': r['gB'], 'falas': falas, 'cenas': r['cenas'], 'capa': r['capa'],
        'leg': r['leg'] + '\n\n' + r['tags'], 'pend': r.get('pend', ''), 'obs': l['observacao'],
        'car': (c['numero'] + ' · ' + c['tema']) if c else '', 'pilar': l['pilar'], 'obj': r['obj'], 'porque': r['porque'],
        'img1': r['img1'], 'dor': r['dor'], 'mec': r['mec'], 'cortes': r.get('cortes', ''), 'ritmo': r.get('ritmo', ''), 'cta': r['cta'],
        'kw': r['kw'], 'metrica': r['metrica'], 'atencao': r.get('atencao', ''), 'fontes': r.get('fontes', '')})
data = json.dumps(list(sess.values()), ensure_ascii=False).replace('</', '<\\/')
page = open(os.path.join(os.path.dirname(__file__), 'pagina_roteiros_modelo.html')).read().replace('__DATA__', data)
open(DST, 'w').write(page)
print(len(sess), 'dias', os.path.getsize(DST) // 1024, 'KB')
