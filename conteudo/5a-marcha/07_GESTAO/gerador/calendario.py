"""Gera 04_CALENDARIO/calendario_90_dias.csv a partir dos dados dos Reels e carrosséis.
uso: python3 -I calendario.py PASTA_5A_MARCHA PASTA_GERADOR
Regras:
- D01 = 23/11/2026 (segunda). 1 Reel por dia durante 90 dias.
- Reels em rodízio pelas 9 séries (1 a 9), cada série na ordem dos números. Assim nenhuma série se repete em dias seguidos.
- Carrosséis às terças e quintas; também aos sábados nas semanas 1, 4, 7 e 10 (30 no total). Rodízio pelas séries A a F.
- Sessões de gravação: 5 Reels seguidos por sessão; gravar até 4 dias antes do primeiro Reel da sessão.
"""
import csv, datetime as dt, runpy, sys, glob, os
from collections import OrderedDict

OUT, GER = sys.argv[1], sys.argv[2]
reels, cars = [], []
for f in sorted(glob.glob(os.path.join(GER, 'reels_*.py'))): reels += runpy.run_path(f).get('REELS', [])
for f in sorted(glob.glob(os.path.join(GER, 'cars_*.py'))): cars += runpy.run_path(f).get('CARS', [])
R = {r['n']: r for r in reels}; C = {c['n']: c for c in cars}
assert len(R) == 90 and len(C) == 30, (len(R), len(C))

FMT = {'A': 'Opinião forte', 'B': 'Simulação comercial', 'C': 'Antes e depois', 'D': 'Ensino prático', 'E': 'História',
       'F': 'Análise', 'G': 'Desafio', 'H': 'Demonstração de ferramenta'}
MARCHA = {1: '1ª Mente', 2: '2ª Leitura', 3: '3ª Comando', 4: '4ª Tração', 5: '5ª Potência'}
SERIE = {1: 'Vida real', 2: 'Psicologia do comprador', 3: 'Prospecção', 4: 'Diagnóstico', 5: 'Objeções e negociação',
         6: 'Follow-up e fechamento', 7: 'Execução e performance', 8: 'Processos e IA', 9: 'Simulações'}
CSER = {'A': 'Mentalidade', 'B': 'Psicologia', 'C': 'Diagnóstico e comunicação', 'D': 'Negociação e fechamento',
        'E': 'Metas e performance', 'F': 'Tecnologia e IA'}
FERIADOS = {dt.date(2026, 12, 24): 'Véspera de Natal', dt.date(2026, 12, 25): 'Natal', dt.date(2026, 12, 31): 'Véspera de Ano Novo',
            dt.date(2027, 1, 1): 'Ano Novo', dt.date(2027, 2, 8): 'Carnaval', dt.date(2027, 2, 9): 'Carnaval'}

# fila de Reels: rodízio pelas séries
filas = OrderedDict((s, sorted([n for n, r in R.items() if r['serie'] == s])) for s in range(1, 10))
ordem_r = []
while any(filas.values()):
    for s in filas:
        if filas[s]: ordem_r.append(filas[s].pop(0))
# fila de carrosséis: rodízio A-F
cf = OrderedDict((s, sorted([n for n, c in C.items() if c['serie'] == s])) for s in 'ABCDEF')
ordem_c = []
while any(cf.values()):
    for s in cf:
        if cf[s]: ordem_c.append(cf[s].pop(0))

D01 = dt.date(2026, 11, 23)
DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
linhas = []
ci = 0
for i in range(90):
    d = D01 + dt.timedelta(days=i)
    semana = i // 7 + 1
    n = ordem_r[i]; r = R[n]
    sessao = i // 5 + 1
    primeiro = D01 + dt.timedelta(days=(sessao - 1) * 5)
    gravar = primeiro - dt.timedelta(days=4)
    obs = []
    if d in FERIADOS: obs.append(f'{FERIADOS[d]}: alcance pode cair; manter o post agendado e não usar este dia para teste A/B')
    if r.get('pend'): obs.append('Pendência: ' + r['pend'])
    linhas.append(dict(dia=f'D{i+1:02d}', data=d.strftime('%d/%m/%Y'), dia_semana=DIAS[d.weekday()], semana=semana, formato='Reel',
                       numero=f'R{n:03d}', serie=SERIE[r['serie']], pilar=MARCHA[r['marcha']], tipo=FMT[r['fmt']], tema=r['tema'],
                       objetivo=r['obj'], gancho=r['gA'], cta=r['cta'], metrica=r['metrica'],
                       sessao_gravacao=f'G{sessao:02d}', gravar_ate=gravar.strftime('%d/%m/%Y'),
                       status='roteiro pronto', resultado='', observacao=' | '.join(obs)))
    carrossel = d.weekday() in (1, 3) or (d.weekday() == 5 and semana in (1, 4, 7, 10))
    if carrossel and ci < 30:
        c = C[ordem_c[ci]]; ci += 1
        o = []
        if d in FERIADOS: o.append(f'{FERIADOS[d]}: alcance pode cair')
        if c.get('pend'): o.append('Pendência: ' + c['pend'])
        linhas.append(dict(dia=f'D{i+1:02d}', data=d.strftime('%d/%m/%Y'), dia_semana=DIAS[d.weekday()], semana=semana, formato='Carrossel',
                           numero=f"C{c['n']:03d}", serie=CSER[c['serie']], pilar='', tipo=f"{len(c['s'])} slides", tema=c['tema'],
                           objetivo=c['obj'], gancho=c['capaA'], cta=c['cta'], metrica=c['metrica'],
                           sessao_gravacao='', gravar_ate='', status='texto pronto', resultado='', observacao=' | '.join(o)))
assert ci == 30, ci
os.makedirs(os.path.join(OUT, '04_CALENDARIO'), exist_ok=True)
with open(os.path.join(OUT, '04_CALENDARIO', 'calendario_90_dias.csv'), 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=list(linhas[0].keys())); w.writeheader(); w.writerows(linhas)
# sessões de gravação
with open(os.path.join(OUT, '04_CALENDARIO', 'sessoes_gravacao.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['sessao', 'gravar_ate', 'reels', 'tipos_de_gravacao', 'publica_de', 'publica_ate'])
    rl = [l for l in linhas if l['formato'] == 'Reel']
    for s in range(18):
        bloco = rl[s * 5:(s + 1) * 5]
        tipos = sorted({R[int(b['numero'][1:])]['grav'] for b in bloco})
        w.writerow([f'G{s+1:02d}', bloco[0]['gravar_ate'], ' '.join(b['numero'] for b in bloco), ', '.join(tipos), bloco[0]['data'], bloco[-1]['data']])
print('linhas', len(linhas), 'ultimo', linhas[-1]['data'])
