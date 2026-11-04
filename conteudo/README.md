# Conteúdo do Gui: mapa do projeto

Tudo o que é conteúdo (perfis, formatos, pautas, rotinas automáticas) mora aqui. O que estiver neste arquivo vale
como regra para qualquer conversa nova.

## Perfis

| Perfil | Tema | Onde | Material |
|---|---|---|---|
| **@guisilva.vendas** + YouTube de vendas | Vendas B2B (vendedor, SDR, closer, executivo de contas) | Instagram, YouTube Shorts (conectados no Metricool) | **Só a 5ª Marcha:** `5a-marcha/` (comece pelo `5a-marcha/README.md`) |
| **Guilherme Ranulfo** (@gui.ranulfo0, YouTube @guilhermeranulfo, TikTok @gui.ranulfo) | Formação e ativação cristã | Instagram, YouTube, TikTok | `fe/sistema-editorial.md` (cópia do doc oficial), skills `gui-pauta-do-dia` e `gui-cortes` |

Metricool: a marca 7598688 tem só o Instagram @guisilva.vendas e o YouTube de vendas conectados.

## @guisilva.vendas: 5ª Marcha (desde 04/11/2026)

Todo o conteúdo anterior foi substituído pela 5ª Marcha. O material antigo (calendário de 30 dias, vídeo longo diário
com 3 cortes, roteiros de 04 e 05/11, melhorias do formato antigo) está em `vendas/arquivo/` e não vale mais.

- **O que sai:** 1 Reel por dia (R001 a R090, de 04/11/2026 a 01/02/2027) e 30 carrosséis às 19h (C001 a C030).
  O calendário está em `5a-marcha/04_CALENDARIO/calendario_90_dias.csv`.
- **Roteiros para gravar:** página https://claude.ai/artifact/TKiqP9pnFGPLCAFS7cPgGK (cópia em `5a-marcha/04_CALENDARIO/roteiros.html`),
  agrupados em 18 sessões de 5 Reels (`5a-marcha/04_CALENDARIO/sessoes_gravacao.csv`).
- **Como gravar:** frase por frase, na horizontal, meio corpo. Guia em `5a-marcha/06_PRODUCAO/guia-gravacao-edicao.md`.
- **Edição:** formato split (motion em cima, o Gui embaixo, legenda na divisão) pela skill `reels-split-motion`.
  Para o formato antigo (vertical inteiro com efeitos por cima), use `/editar-video`, só quando ele pedir.
- **Carrosséis:** mesmo design dos anteriores (post estilo Twitter, 1080x1350, foto do Gui, Inter; fundo claro em dia
  ímpar e escuro em dia par). Gerados por `5a-marcha/07_GESTAO/gerador/carrossel_json.py` + `carrossel_render.js`:
  `python3 -I carrossel_json.py <gerador> <calendario.csv> <pasta_json>` e `node carrossel_render.js <pasta_json> <saida>`
  (o `carrossel_render.js` usa o `avatar.jpg` da mesma pasta). Os PNGs não vão para o git: ficam em
  `5a-marcha/03_CARROSSEIS/zips/` e o Gui sobe no Drive.
- **Agendamentos no Metricool:** `5a-marcha/07_GESTAO/metricool_carrosseis.csv` liga cada data ao post (uuid). Os 13
  carrosséis antigos de 04 a 18/11 estão em rascunho até a arte nova entrar no lugar.

## Rotinas automáticas (agendamentos no claude.ai)

| Nome | Quando (horário de Brasília) | O que faz |
|---|---|---|
| Pauta guisilva.vendas | todo dia, 20h38 | Manda o que o Gui precisa para amanhã na 5ª Marcha: a sessão de gravação (com o link dos roteiros) ou o aviso curto do que sai. O texto é igual a `vendas/agente-pauta.md`, gerado por `5a-marcha/07_GESTAO/gerador/pauta_prompt.py`: se mudar um, mude o outro |
| Roteiro do longo de amanhã (Gui) | todo dia, 6h50 | Roteiro do longo cristão. **Desatualizado:** ainda lê a "Linha Editorial" antiga e pede 1 longo por dia |
| Ligar SCRIPT no post de 11/11 | desligado | Era o lembrete do carrossel antigo de 11/11, que saiu da programação |
| Abordagens diárias Orkestra | dias úteis, 6h04 | 15 leads de buffet por dia, com o link do WhatsApp pronto (vendas do Orkestra) |
| Leads de buffet semanais | domingo, 6h55 | Busca buffets de 2 cidades novas por semana (Orkestra) |
| Leitura das conversas Orkestra | desligado | Lia as conversas no WhatsApp Web |
| Análise diária NBA | todo dia, 12h13 | Análise dos jogos da NBA (pessoal) |

## Publicação (Metricool)

- **Horários:** Reel no melhor horário do dia (`getBestTimeToPostByNetwork`), até o teste T5; carrossel às 19h.
- **Cada Reel vai para dois lugares:** Reels no Instagram e Short no YouTube.
- **Plano do Metricool:** se continuar no plano grátis, o limite é de 20 posts por mês, contados pela data de publicação.
  Com 1 Reel por dia (Instagram + YouTube) e os carrosséis, o volume da 5ª Marcha passa disso: ou o Gui muda de plano,
  ou parte dos posts sai na mão.
- **Vídeo grande:** o conector do Drive só baixa e sobe arquivos de até 10 MB. O Gui salva o MP4 no Drive e o link vai no Metricool.
- **Imagens dos carrosséis:** o Gui sobe as pastas na pasta do Drive "Carrosseis guisilva.vendas - Novembro"
  (id 1X1y45Y9E5sYM4GXrLxyLS0ap5MiQik0t, aberta por link como Leitor). Use a URL `https://drive.google.com/uc?export=download&id=ID`.
- **SCRIPT:** post que pede "Comenta SCRIPT" precisa da automação ligada no ManyChat (palavra SCRIPT e e-book das 7 objeções).
  Nenhum carrossel da 5ª Marcha usa SCRIPT por enquanto.
- **Trial Reel:** só nos testes T1 e T4 da 5ª Marcha (`5a-marcha/05_PERFORMANCE/testes_ab.csv`).
