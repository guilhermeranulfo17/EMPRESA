# Calendário de 90 dias

**Período:** D01 = quarta, 04/11/2026 (hoje, a pedido do Gui), até D90 = segunda, 01/02/2027.
**Volume:** 90 Reels (1 por dia) e 30 carrosséis às 19h. De 04 a 18/11, os carrosséis da 5ª Marcha entram no lugar dos 13 antigos que estavam agendados no Metricool; a partir de 19/11 saem às terças, quintas e sábados. Design igual ao dos carrosséis antigos (post estilo Twitter), fundo claro em dia ímpar e escuro em dia par.

Arquivos:
- `calendario_90_dias.csv`: a tabela editável (dia, data, formato, número, série, pilar, tipo, tema, objetivo, gancho, CTA, métrica, dia de gravação, status, resultado, observação). Importe no Google Sheets e edite por lá.
- `dias_gravacao.csv`: o que gravar em cada dia (82 dias de gravação).
- `roteiros.html`: cópia da página de roteiros (https://claude.ai/artifact/TKiqP9pnFGPLCAFS7cPgGK).
- O gerador está em `07_GESTAO/gerador/calendario.py`. Se mudar a ordem ou a data de início, rode de novo: `python3 -I 07_GESTAO/gerador/calendario.py . 07_GESTAO/gerador` (de dentro de `conteudo/5a-marcha`).

## Como a ordem foi montada

1. **Rodízio das 9 séries.** O Reel do dia segue a ordem Série 1, 2, 3 ... 9 e volta. Cada série aparece pelo menos uma vez por semana e nenhuma se repete em dias seguidos.
2. **Dentro da série, a ordem dos números.** Os 10 Reels do Lote 01 (R001 a R010) entram primeiro nas séries 1, 5 e 7, porque já foram aprovados.
3. **Carrosséis em rodízio pelas séries A a F**, começando pelo C001 hoje (04/11).
4. **Ordem dos pilares preservada.** O calendário mistura temas, mas nenhum conteúdo muda a sequência da metodologia (1ª Mente, 2ª Leitura, 3ª Comando, 4ª Tração, 5ª Potência).

## Equilíbrio do funil (Reels)

| Etapa | Formatos | Reels | Meta da estratégia |
|---|---|---|---|
| Descoberta | Opinião forte, simulação, antes e depois | 47 (52%) | cerca de 45% |
| Valor | Ensino prático, análise, demonstração | 38 (42%) | cerca de 40% |
| Relação | Desafio, história | 5 (6%) | cerca de 15% |

A etapa de relação está abaixo da meta nos Reels, porque histórias pessoais só entram com fato confirmado pelo Gui. Para compensar: 10 Reels têm o comentário como objetivo, os 4 desafios geram vídeos de resposta (extras, fora dos 90) e os Stories de bastidor ficam livres. Quando o Gui confirmar histórias próprias, elas entram no lugar de Reels de descoberta (ver `07_GESTAO/pendencias.md`).

## Semanas

| Semana | De | Até | Reels | Carrosséis 5ª Marcha | Destaques |
|---|---|---|---|---|---|
| 1 | 04/11 | 10/11 | 7 | 6 | Abertura com R001 e C001 hoje. Começa o teste T1 (gancho) e o T3 (capa) |
| 2 | 11/11 | 17/11 | 7 | 6 | Primeira revisão grande depois de 10 Reels (13/11). Feriado 15/11 |
| 3 | 18/11 | 24/11 | 7 | 4 | Em 18/11 você grava 5 Reels (o do dia e os 4 da FIRE). FIRE de 19 a 22/11: tudo já agendado. Feriado 20/11 |
| 4 | 25/11 | 01/12 | 7 | 3 | Começa o T4 (duração) |
| 5 | 02/12 | 08/12 | 7 | 3 | Fim do T2 (formato) |
| 6 | 09/12 | 15/12 | 7 | 3 | R010 (10/12) só vai ao ar se o Gui validar as lições. Fim do T3 |
| 7 | 16/12 | 22/12 | 7 | 3 | |
| 8 | 23/12 | 29/12 | 7 | 3 | Natal (24 e 25): fora das comparações. R086 (desafio) em 27/12. Fim do T4 |
| 9 | 30/12 | 05/01 | 7 | 3 | Começa o T5 (horário). Ano Novo (31 e 01) |
| 10 | 06/01 | 12/01 | 7 | 3 | R052 (desafio) em 10/01 |
| 11 | 13/01 | 19/01 | 7 | 3 | |
| 12 | 20/01 | 26/01 | 7 | 3 | Fim do T5. Último carrossel em 26/01 |
| 13 | 27/01 | 01/02 | 6 | 0 | R045 e R064 (desafios). Revisão do ciclo no D90 |

## Gravação

**Um Reel por dia, gravado de manhã no dia em que sai** (pedido do Gui em 04/11). O roteiro completo chega no celular por volta das 7h (agendamento "Pauta guisilva.vendas") e também está na página https://claude.ai/artifact/TKiqP9pnFGPLCAFS7cPgGK, que abre no dia de hoje.

Fluxo do dia: chega o roteiro, o Gui grava frase por frase, sobe no Drive e manda o link no chat; a edição split é feita e o Reel é agendado no Metricool para o fim da tarde (Instagram e YouTube Shorts). O carrossel das 19h já está agendado.

**Dias com mais de um Reel para gravar** (porque o dia seguinte não tem gravação):
- **18/11:** R056 (sai 18/11) e os da FIRE: R003 (19/11), R072 (20/11), R082 (21/11) e R005 (22/11). Agende tudo antes de viajar.
- **23/12:** R050 (23/12), R060 (24/12) e R066 (25/12).
- **30/12:** R032 (30/12), R042 (31/12) e R051 (01/01).

Testes que pedem uma versão a mais na gravação: gancho B do R026, R036, R017 e R046 (T1) e a versão curta do R038, R039 e R065 (T4, feita na edição).

Quem quiser se adiantar pode gravar vários de uma vez: a página mostra qualquer dia pelo seletor.

## Horários

Carrossel às 19h. Para os Reels, até o teste T5, use o melhor horário do dia indicado pelo Metricool (`getBestTimeToPostByNetwork`). Durante o T5 (30/12 a 26/01), alterne 12h e 18h.

## O que muda com o início hoje

- O calendário de 30 dias (`conteudo/vendas/calendario-30-dias.md`) fica substituído a partir de hoje.
- Os 13 carrosséis antigos agendados de 04 a 18/11 foram para rascunho no Metricool e recebem a arte e a legenda da 5ª Marcha assim que o Gui subir as imagens no Drive (`07_GESTAO/metricool_carrosseis.csv`).
- A pauta automática ("Pauta guisilva.vendas") agora chega todo dia por volta das 7h com o roteiro completo dos vídeos do dia.
