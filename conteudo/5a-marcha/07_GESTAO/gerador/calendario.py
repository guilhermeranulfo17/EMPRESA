"""Gera 04_CALENDARIO/calendario_30_dias.csv e dias_gravacao.csv a partir dos dados dos Reels e carrosséis.
uso: python3 -I calendario.py PASTA_5A_MARCHA PASTA_GERADOR
Regras (pedido do Gui em 04/11/2026):
- 30 dias, de 04/11 a 03/12/2026: 3 Reels por dia (90 no total) às 12h, 15h e 18h, e 1 carrossel por dia às 19h (30 no total).
- Reels em rodízio pelas 9 séries (1 a 9), cada série na ordem dos números: cada dia tem 3 séries diferentes.
- Carrosséis em rodízio pelas séries A a F. De 04 a 18/11, onde havia carrossel antigo agendado no Metricool, o da 5ª Marcha entra no lugar.
- Design dos carrosséis igual ao dos antigos (post estilo Twitter); fundo claro em dia ímpar e escuro em dia par.
- Gravação no próprio dia, de manhã: o roteiro dos 3 Reels chega às 7h.
- FIRE (19 a 22/11): o Gui viaja. Os 3 Reels de cada dia da FIRE são gravados junto com os de 15, 16, 17 e 18/11 (6 por dia).
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
FERIADOS = {dt.date(2026, 11, 15): 'Proclamação da República', dt.date(2026, 11, 20): 'Consciência Negra', dt.date(2026, 12, 24): 'Véspera de Natal', dt.date(2026, 12, 25): 'Natal', dt.date(2026, 12, 31): 'Véspera de Ano Novo',
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

D01 = dt.date(2026, 11, 4)
DIAS_CICLO = 30
HORAS = ['12h', '15h', '18h']
FIRE_GRAVA = {dt.date(2026, 11, 19): dt.date(2026, 11, 15), dt.date(2026, 11, 20): dt.date(2026, 11, 16),
              dt.date(2026, 11, 21): dt.date(2026, 11, 17), dt.date(2026, 11, 22): dt.date(2026, 11, 18)}
JA_AGENDADOS = {  # horários das 19h que já tinham carrossel antigo no Metricool (consultado em 04/11/2026); a 5ª Marcha entra no lugar
    dt.date(2026, 11, 4): 'Já perdeu venda numa reunião que você nem tava?', dt.date(2026, 11, 6): '"Já temos fornecedor" é a melhor resposta (opinião)',
    dt.date(2026, 11, 7): '"Vamos deixar pra ano que vem" tem um preço', dt.date(2026, 11, 8): 'Desconto de 10% com margem de 30%',
    dt.date(2026, 11, 9): '4 perguntas antes de passar o preço', dt.date(2026, 11, 10): 'Ninguém compra sistema',
    dt.date(2026, 11, 11): 'Táticas de comprador profissional (CTA SCRIPT)', dt.date(2026, 11, 12): 'Negociar além do desconto',
    dt.date(2026, 11, 14): '5 sinais de venda parada na carteira', dt.date(2026, 11, 15): 'Frases que todo vendedor B2B ouve',
    dt.date(2026, 11, 16): 'Quem vende pra empresa pequena já viveu (humor)', dt.date(2026, 11, 17): 'Cliente visualizou e não respondeu',
    dt.date(2026, 11, 18): 'Cadência de 14 dias depois da proposta'}
DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
linhas = []
ci = 0
for i in range(DIAS_CICLO):
    d = D01 + dt.timedelta(days=i)
    semana = i // 7 + 1
    gravar = FIRE_GRAVA.get(d, d)
    for k in range(3):
        n = ordem_r[i * 3 + k]; r = R[n]
        obs = []
        if d in FERIADOS: obs.append(f'{FERIADOS[d]}: alcance pode cair; não usar este dia para teste A/B')
        if gravar != d: obs.append(f"FIRE: gravado antes, em {gravar.strftime('%d/%m')}, e já agendado")
        if r.get('pend'): obs.append('Pendência: ' + r['pend'])
        linhas.append(dict(dia=f'D{i+1:02d}', data=d.strftime('%d/%m/%Y'), dia_semana=DIAS[d.weekday()], semana=semana, formato='Reel',
                           horario=HORAS[k], numero=f'R{n:03d}', serie=SERIE[r['serie']], pilar=MARCHA[r['marcha']], tipo=FMT[r['fmt']], tema=r['tema'],
                           objetivo=r['obj'], gancho=r['gA'], cta=r['cta'], metrica=r['metrica'],
                           gravar_em=gravar.strftime('%d/%m/%Y'), status='roteiro pronto', resultado='', observacao=' | '.join(obs)))
    c = C[ordem_c[ci]]; ci += 1
    o = []
    if d in FERIADOS: o.append(f'{FERIADOS[d]}: alcance pode cair')
    if d in JA_AGENDADOS: o.append('Substitui no Metricool o carrossel antigo das 19h: ' + JA_AGENDADOS[d])
    o.append('Fundo ' + ('claro' if d.day % 2 else 'escuro'))
    if c.get('pend'): o.append('Pendência: ' + c['pend'])
    linhas.append(dict(dia=f'D{i+1:02d}', data=d.strftime('%d/%m/%Y'), dia_semana=DIAS[d.weekday()], semana=semana, formato='Carrossel',
                       horario='19h', numero=f"C{c['n']:03d}", serie=CSER[c['serie']], pilar='', tipo=f"{len(c['s'])} slides", tema=c['tema'],
                       objetivo=c['obj'], gancho=c['capaA'], cta=c['cta'], metrica=c['metrica'],
                       gravar_em='', status='texto pronto', resultado='', observacao=' | '.join(o)))
assert ci == 30, ci
os.makedirs(os.path.join(OUT, '04_CALENDARIO'), exist_ok=True)
with open(os.path.join(OUT, '04_CALENDARIO', 'calendario_30_dias.csv'), 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=list(linhas[0].keys())); w.writeheader(); w.writerows(linhas)
# dias de gravação
for velho in ('sessoes_gravacao.csv', 'calendario_' + '90_dias.csv'):
    p = os.path.join(OUT, '04_CALENDARIO', velho)
    if os.path.exists(p): os.remove(p)
dias = {}
for l in linhas:
    if l['formato'] == 'Reel': dias.setdefault(l['gravar_em'], []).append(l)
with open(os.path.join(OUT, '04_CALENDARIO', 'dias_gravacao.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['gravar_em', 'reels', 'publica_em', 'tipos_de_gravacao'])
    for g, ls in dias.items():
        w.writerow([g, ' '.join(x['numero'] for x in ls), ' '.join(x['data'][:5] for x in ls), ', '.join(sorted({R[int(x['numero'][1:])]['grav'] for x in ls}))])
print('linhas', len(linhas), 'ultimo', linhas[-1]['data'])
