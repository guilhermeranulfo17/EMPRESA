"""Exporta os roteiros dos Reels num texto só, na ordem do calendário (para o Drive, lido pela pauta diária).
uso: python3 -I exporta_roteiros.py PASTA_5A_MARCHA SAIDA.txt"""
import runpy, glob, os, sys, csv
OUT, DST = sys.argv[1], sys.argv[2]
R = {}
for f in sorted(glob.glob(os.path.join(OUT, '07_GESTAO/gerador/reels_*.py'))):
    for r in runpy.run_path(f)['REELS']: R[r['n']] = r
cal = [l for l in csv.DictReader(open(os.path.join(OUT, '04_CALENDARIO/calendario_30_dias.csv'))) if l['formato'] == 'Reel']
L = ['5ª MARCHA · ROTEIROS DOS REELS NA ORDEM DE PUBLICAÇÃO', 'Cada fala entre barras é uma frase: grave uma por vez, olhando para a lente.', '']
for l in cal:
    r = R[int(l['numero'][1:])]
    L += [f"=== {l['numero']} · publica {l['data']} ({l['dia_semana']}) · sessão {l['sessao_gravacao']} (gravar até {l['gravar_ate']}) ===",
          f"Tema: {r['tema']}", f"Gancho B (teste): {r['gB']}"]
    for t, lab, fala in r['b']:
        L.append(f"[{t} {lab}] {fala}")
    L += ['Legenda: ' + r['leg'].replace('\n', ' ') + ' ' + r['tags'],
          f"Pendência: {r['pend']}" if r.get('pend') else '', '']
open(DST, 'w').write('\n'.join(x for x in L if x is not None))
print(os.path.getsize(DST))
