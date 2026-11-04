"""Render 5a Marcha Reels / carousels from compact Python data files into Markdown + index CSVs.
usage: python3 render5m.py OUT_DIR data1.py [data2.py ...]
Each data file defines REELS = [dict, ...] and/or CARS = [dict, ...]."""
import csv, json, os, sys, runpy, re

OUT = sys.argv[1]
SERIES = {1: 'A vida real do vendedor', 2: 'Psicologia do comprador', 3: 'Prospecção e cold call', 4: 'Diagnóstico intencional',
          5: 'Objeções e negociação', 6: 'Follow-up e fechamento', 7: 'Execução e performance comercial', 8: 'Processos e IA para vendedores',
          9: 'Simulações e entretenimento comercial'}
MARCHA = {1: '1ª Marcha · Mente', 2: '2ª Marcha · Leitura', 3: '3ª Marcha · Comando', 4: '4ª Marcha · Tração', 5: '5ª Marcha · Potência'}
FMT = {'A': 'A · Opinião forte', 'B': 'B · Simulação comercial', 'C': 'C · Antes e depois', 'D': 'D · Ensino prático', 'E': 'E · História',
       'F': 'F · Análise', 'G': 'G · Desafio', 'H': 'H · Demonstração de ferramenta'}
GRAV = {
    'frente': 'Split padrão: Gui embaixo (gravação horizontal, meio corpo, câmera na altura dos olhos), motion em cima ilustrando cada frase. Gravação frase por frase.',
    'simulacao': 'Split com troca de papel: Gui embaixo; quando fala como cliente, vira levemente o rosto para a direita e o motion em cima mostra a etiqueta "CLIENTE"; como vendedor, olha para a lente e a etiqueta muda para "VENDEDOR". Gravação frase por frase, um papel de cada vez.',
    'tela': 'Split com tela: em cima, a gravação da tela do celular ou computador (ou o motion reproduzindo a tela sem dados reais); embaixo, Gui comentando. Gravação da fala frase por frase; a tela é gravada à parte.',
    'quadro': 'Split padrão com quadro: o motion em cima funciona como quadro branco, desenhando números e setas no ritmo da fala. Gui embaixo, frase por frase.',
}
GRAVL = {'frente': 'Câmera frontal, formato split', 'simulacao': 'Simulação vendedor x cliente, formato split', 'tela': 'Tela gravada + comentário, formato split', 'quadro': 'Quadro animado, formato split'}
SC = {1: 'Série 1', 2: 'Série 2', 3: 'Série 3', 4: 'Série 4', 5: 'Série 5', 6: 'Série 6', 7: 'Série 7', 8: 'Série 8', 9: 'Série 9'}
CSERIES = {'A': 'Mentalidade e comportamento', 'B': 'Psicologia do comprador', 'C': 'Diagnóstico e comunicação', 'D': 'Negociação e fechamento',
           'E': 'Metas, comissões e performance', 'F': 'Tecnologia, processos e IA'}

def nodash(s):
    if isinstance(s, str) and '—' in s: raise SystemExit(f'travessão encontrado: {s[:80]}')
    return s

def check(d):
    for v in d.values():
        if isinstance(v, str): nodash(v)
        elif isinstance(v, list):
            for x in v:
                if isinstance(x, str): nodash(x)
                elif isinstance(x, (list, tuple)):
                    for y in x:
                        if isinstance(y, str): nodash(y)

def secs(b):
    return int(re.findall(r'\d+', b[-1][0])[-1])

def reel_md(d):
    check(d)
    n = d['n']; dur = d.get('dur') or f"cerca de {secs(d['b'])} s"
    L = [f"# R{n:03d} · {d['tema']}", '',
         f"> Status: {d.get('status', 'roteiro pronto')}" + (f" · **Pendência: {d['pend']}**" if d.get('pend') else ''), '',
         '## Identificação', '',
         f"| Campo | |\n|---|---|\n| Número | R{n:03d} |\n| Série | {SC[d['serie']]} · {SERIES[d['serie']]} |\n| Pilar | {MARCHA[d['marcha']]} |\n| Tema | {d['tema']} |\n| Público | {d['pub']} |\n| Objetivo | {d['obj']} |\n| Duração estimada | {dur} |\n| Formato | {FMT[d['fmt']]} |\n| Gravação | {GRAVL[d['grav']]} |",
         '', '## Estratégia de atenção', '',
         f"- **Problema ou desejo:** {d['dor']}",
         f"- **Mecanismo de atenção:** {d['mec']}",
         f"- **Gancho A (principal):** \"{d['gA']}\"",
         f"- **Gancho B (teste):** \"{d['gB']}\"",
         f"- **Por que o A:** {d['porque']}",
         f"- **Primeira imagem na tela:** {d['img1']}", '',
         '## Roteiro completo (fala literal)', '',
         'Grave uma frase de cada vez, olhando para a lente. Errou, repita a frase inteira.', '']
    for t, lab, fala in d['b']:
        L.append(f"**{t.replace(chr(8211), '-')} · {lab}**")
        for frase in fala.split(' | '):
            L.append(f"> {frase}")
        L.append('')
    L += ['## Direção de produção', '',
          f"- **Enquadramento e gravação:** {GRAV[d['grav']]}",
          f"- **Cenário:** {d.get('cenario', 'Parede lisa e clara, luz de frente (janela ou ring light), celular apoiado em tripé.')}",
          f"- **Expressão e ritmo:** {d.get('ritmo', 'Conversa de vendedor para vendedor: firme, sem pressa, pausa curta antes da frase principal.')}",
          f"- **Cortes e mudança de enquadramento:** {d['cortes']}",
          '- **Motion em cima (textos e elementos na tela), na ordem:**']
    for i, c in enumerate(d['cenas'], 1): L.append(f"  {i}. {c}")
    L += [f"- **Objetos, telas ou capturas:** {d.get('objetos', 'Nenhum. Tudo o que aparece é desenhado no motion, sem dado real de cliente.')}",
          f"- **Onde entra a demonstração:** {d.get('demo', 'No bloco de desenvolvimento, quando a frase exata aparece escrita no motion enquanto Gui fala.')}",
          '- **Legenda falada:** na divisão entre as telas, 2 a 3 palavras por vez, destaque amarelo na palavra-chave.', '',
          '## Publicação', '',
          f"- **Título de capa:** {d['capa']}",
          f"- **Legenda completa:**", '', '  ' + d['leg'].replace('\n', '\n  '), '',
          f"- **CTA:** {d['cta']}",
          f"- **Palavras-chave:** {d['kw']}",
          f"- **Hashtags:** {d['tags']}",
          f"- **Objetivo de mensuração:** {d['metr_obj']}",
          f"- **Métrica principal:** {d['metrica']}",
          f"- **Fontes:** {d.get('fontes', 'Experiência comercial e lógica de processo; sem estatística citada.')}", '',
          '## Revisão de qualidade', '',
          '| Critério | Situação |\n|---|---|']
    qa = d.get('qa', {})
    crit = ['O gancho cria interesse real', 'A continuidade sustenta a promessa', 'Entrega informação nova', 'Tem exemplo ou aplicação',
            'Linguagem natural', 'Entende-se sem contexto anterior', 'Gravável com os recursos atuais', 'Afirmações duvidosas',
            'O final cumpre a promessa', 'Motivo para salvar ou compartilhar']
    default = ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Nenhuma', 'Sim', d.get('motivo', 'Sim')]
    for i, c in enumerate(crit):
        L.append(f"| {c} | {qa.get(i, default[i])} |")
    L += ['', f"**Ponto de atenção:** {d['atencao']}", '']
    return '\n'.join(L)

def car_md(d):
    check(d)
    n = d['n']
    L = [f"# C{n:03d} · {d['tema']}", '', f"> Status: {d.get('status', 'texto pronto')}" + (f" · **Pendência: {d['pend']}**" if d.get('pend') else ''), '',
         '## Identificação', '',
         f"| Campo | |\n|---|---|\n| Número | C{n:03d} |\n| Série | {d['serie']} · {CSERIES[d['serie']]} |\n| Tema | {d['tema']} |\n| Objetivo | {d['obj']} |\n| Público | {d['pub']} |\n| Slides | {len(d['s'])} |\n| Capa principal | {d['capaA']} |\n| Capa alternativa | {d['capaB']} |",
         '', '## Slides (texto exato e orientação visual)', '']
    for i, (tit, corpo, vis) in enumerate(d['s'], 1):
        L += [f"**Slide {i}**", f"- Título: {tit}"]
        if corpo: L.append(f"- Texto: {corpo}")
        L += [f"- Visual: {vis}", '']
    L += ['## Direção de design', '', d['design'], '', '## Publicação', '',
          '- **Legenda completa:**', '', '  ' + d['leg'].replace('\n', '\n  '), '',
          f"- **CTA:** {d['cta']}", f"- **Métrica principal:** {d['metrica']}",
          f"- **Fontes de suporte:** {d.get('fontes', 'Experiência comercial; sem estatística citada.')}", '',
          f"**Ponto de atenção:** {d['atencao']}", '']
    return '\n'.join(L)

reels, cars = [], []
for f in sys.argv[2:]:
    ns = runpy.run_path(f)
    reels += ns.get('REELS', []); cars += ns.get('CARS', [])
os.makedirs(f'{OUT}/02_REELS', exist_ok=True); os.makedirs(f'{OUT}/03_CARROSSEIS', exist_ok=True)
for d in reels:
    open(f"{OUT}/02_REELS/R{d['n']:03d}.md", 'w').write(reel_md(d))
for d in cars:
    open(f"{OUT}/03_CARROSSEIS/C{d['n']:03d}.md", 'w').write(car_md(d))
# indexes (full rebuild from all data files given)
with open(f'{OUT}/07_GESTAO/indice_reels.csv', 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['numero', 'serie', 'pilar', 'formato', 'tema', 'gancho_principal', 'duracao', 'objetivo', 'metrica', 'status', 'pendencia', 'arquivo'])
    for d in sorted(reels, key=lambda x: x['n']):
        w.writerow([f"R{d['n']:03d}", SERIES[d['serie']], MARCHA[d['marcha']], FMT[d['fmt']], d['tema'], d['gA'], d.get('dur') or f"cerca de {secs(d['b'])} s",
                    d['obj'], d['metrica'], d.get('status', 'roteiro pronto'), d.get('pend', ''), f"02_REELS/R{d['n']:03d}.md"])
with open(f'{OUT}/07_GESTAO/indice_carrosseis.csv', 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['numero', 'serie', 'tema', 'capa', 'slides', 'objetivo', 'metrica', 'status', 'pendencia', 'arquivo'])
    for d in sorted(cars, key=lambda x: x['n']):
        w.writerow([f"C{d['n']:03d}", CSERIES[d['serie']], d['tema'], d['capaA'], len(d['s']), d['obj'], d['metrica'], d.get('status', 'texto pronto'), d.get('pend', ''), f"03_CARROSSEIS/C{d['n']:03d}.md"])
print('reels', len(reels), 'cars', len(cars))
