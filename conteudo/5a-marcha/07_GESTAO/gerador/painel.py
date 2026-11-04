"""Gera 05_PERFORMANCE/painel.csv a partir do calendário: uma linha por publicação e janela (72h, 7d, 30d).
uso: python3 -I painel.py PASTA_5A_MARCHA
As colunas de taxa ficam vazias: calcule na planilha com as fórmulas de 05_PERFORMANCE/indicadores.md."""
import csv, datetime as dt, os, sys
OUT = sys.argv[1]
cal = list(csv.DictReader(open(os.path.join(OUT, '04_CALENDARIO', 'calendario_30_dias.csv'))))
COLS = ['dia', 'numero', 'formato', 'serie', 'tipo', 'data_publicacao', 'horario', 'janela', 'data_coleta', 'versao_gancho', 'familia_gancho', 'trial_reel',
        'alcance', 'alcance_nao_seguidores', 'visualizacoes', 'taxa_retencao_3s', 'tempo_medio_assistido_s', 'duracao_s', 'conclusao_carrossel',
        'curtidas', 'comentarios', 'comentarios_qualificados', 'envios', 'salvamentos', 'visitas_perfil', 'novos_seguidores',
        'dms_qualificadas', 'cliques_link', 'envios_por_alcance_pct', 'salvamentos_por_alcance_pct', 'curtidas_por_alcance_pct',
        'seguidores_por_alcance_pct', 'ponto_de_queda', 'aprendizado', 'decisao']
JAN = [('72h', 3), ('7d', 7), ('30d', 30)]
# testes de 05_PERFORMANCE/testes_ab.csv
CAPA_B = {'C006', 'C018', 'C026', 'C007', 'C019', 'C027'}          # T3
TRIAL = {'R026': ('T1', 'gancho B'), 'R036': ('T1', 'gancho B'), 'R017': ('T1', 'gancho B'), 'R046': ('T1', 'gancho B'),
         'R038': ('T4', 'versão curta'), 'R039': ('T4', 'versão curta'), 'R065': ('T4', 'versão curta')}
with open(os.path.join(OUT, '05_PERFORMANCE', 'painel.csv'), 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=COLS); w.writeheader(); n = 0
    for l in cal:
        d = dt.datetime.strptime(l['data'], '%d/%m/%Y').date()
        versoes = [('A' if l['formato'] == 'Reel' else ('' if not l['numero'] else ('capa B' if l['numero'] in CAPA_B else 'capa A')), '', d)]
        if l['numero'] in TRIAL:
            t, v = TRIAL[l['numero']]; versoes.append((f'{v} ({t})', 'sim', d + dt.timedelta(days=1)))
        for v, trial, dp in versoes:
            for j, k in JAN:
                row = {c: '' for c in COLS}
                row.update(dia=l['dia'], numero=l['numero'], formato=l['formato'], serie=l['serie'], tipo=l['tipo'], data_publicacao=dp.strftime('%d/%m/%Y'), horario=l['horario'] if trial == '' else '',
                           janela=j, data_coleta=(dp + dt.timedelta(days=k)).strftime('%d/%m/%Y'), versao_gancho=v, trial_reel=trial)
                w.writerow(row); n += 1
print('linhas', n)
