"""Gera 04_CALENDARIO/calendario_90_dias.csv a partir dos dados dos Reels e carrosséis.
uso: python3 -I calendario.py PASTA_5A_MARCHA PASTA_GERADOR
Regras:
- D01 = 04/11/2026 (quarta, dia em que o Gui pediu para começar). 1 Reel por dia durante 90 dias.
- Reels em rodízio pelas 9 séries (1 a 9), cada série na ordem dos números. Assim nenhuma série se repete em dias seguidos.
- Até 18/11, os carrosséis da 5ª Marcha entram no lugar dos 13 carrosséis antigos que estavam agendados às 19h no Metricool.
- A partir de 19/11, às terças, quintas e sábados, até completar 30. Rodízio pelas séries A a F.
- Design igual ao dos carrosséis antigos (post estilo Twitter); fundo claro em dia ímpar e escuro em dia par.
- Gravação diária (pedido do Gui em 04/11): cada Reel é gravado de manhã no próprio dia em que sai. O roteiro chega às 7h.
- FIRE (19 a 22/11) e feriados de fim de ano (24, 25, 31/12 e 01/01): nada de gravar; o Reel desses dias é gravado no dia anterior livre (18/11, 23/12 e 30/12).
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
HOJE = dt.date(2026, 11, 4)
INICIO_CARROSSEL = dt.date(2026, 11, 19)
FIRE = {dt.date(2026, 11, d) for d in (19, 20, 21, 22)}  # Gui viaja: nada de gravar nesses dias
SEM_GRAVAR = {dt.date(2026, 12, 24), dt.date(2026, 12, 25), dt.date(2026, 12, 31), dt.date(2027, 1, 1)}  # feriados: a sessão vai para o dia anterior
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
for i in range(90):
    d = D01 + dt.timedelta(days=i)
    semana = i // 7 + 1
    n = ordem_r[i]; r = R[n]
    gravar = d
    while gravar in FIRE or gravar in SEM_GRAVAR: gravar -= dt.timedelta(days=1)
    obs = []
    if d in FERIADOS: obs.append(f'{FERIADOS[d]}: alcance pode cair; manter o post agendado e não usar este dia para teste A/B')
    if gravar != d: obs.append(f"Gravado antes, em {gravar.strftime('%d/%m')} ({'FIRE' if d in FIRE else 'feriado'}), e já agendado")
    if r.get('pend'): obs.append('Pendência: ' + r['pend'])
    linhas.append(dict(dia=f'D{i+1:02d}', data=d.strftime('%d/%m/%Y'), dia_semana=DIAS[d.weekday()], semana=semana, formato='Reel',
                       numero=f'R{n:03d}', serie=SERIE[r['serie']], pilar=MARCHA[r['marcha']], tipo=FMT[r['fmt']], tema=r['tema'],
                       objetivo=r['obj'], gancho=r['gA'], cta=r['cta'], metrica=r['metrica'],
                       gravar_em=gravar.strftime('%d/%m/%Y'),
                       status='roteiro pronto', resultado='', observacao=' | '.join(obs)))
    carrossel = d in JA_AGENDADOS or (d >= INICIO_CARROSSEL and d.weekday() in (1, 3, 5))
    if carrossel and ci < 30:
        c = C[ordem_c[ci]]; ci += 1
        o = []
        if d in FERIADOS: o.append(f'{FERIADOS[d]}: alcance pode cair')
        if d in JA_AGENDADOS: o.append('Substitui no Metricool o carrossel antigo das 19h: ' + JA_AGENDADOS[d])
        o.append('Fundo ' + ('claro' if d.day % 2 else 'escuro'))
        if c.get('pend'): o.append('Pendência: ' + c['pend'])
        linhas.append(dict(dia=f'D{i+1:02d}', data=d.strftime('%d/%m/%Y'), dia_semana=DIAS[d.weekday()], semana=semana, formato='Carrossel',
                           numero=f"C{c['n']:03d}", serie=CSER[c['serie']], pilar='', tipo=f"{len(c['s'])} slides", tema=c['tema'],
                           objetivo=c['obj'], gancho=c['capaA'], cta=c['cta'], metrica=c['metrica'],
                           gravar_em='', status='texto pronto', resultado='', observacao=' | '.join(o)))
assert ci == 30, ci
os.makedirs(os.path.join(OUT, '04_CALENDARIO'), exist_ok=True)
with open(os.path.join(OUT, '04_CALENDARIO', 'calendario_90_dias.csv'), 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=list(linhas[0].keys())); w.writeheader(); w.writerows(linhas)
# dias de gravação
os.path.exists(os.path.join(OUT, '04_CALENDARIO', 'sessoes_gravacao.csv')) and os.remove(os.path.join(OUT, '04_CALENDARIO', 'sessoes_gravacao.csv'))
dias = {}
for l in linhas:
    if l['formato'] == 'Reel': dias.setdefault(l['gravar_em'], []).append(l)
with open(os.path.join(OUT, '04_CALENDARIO', 'dias_gravacao.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['gravar_em', 'reels', 'publica_em', 'tipos_de_gravacao'])
    for g, ls in dias.items():
        w.writerow([g, ' '.join(x['numero'] for x in ls), ' '.join(x['data'][:5] for x in ls), ', '.join(sorted({R[int(x['numero'][1:])]['grav'] for x in ls}))])
print('linhas', len(linhas), 'ultimo', linhas[-1]['data'])
