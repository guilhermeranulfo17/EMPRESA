# Calendário de 90 dias

**Período:** D01 = quarta, 04/11/2026 (hoje, a pedido do Gui), até D90 = segunda, 01/02/2027.
**Volume:** 90 Reels (1 por dia) e 30 carrosséis da 5ª Marcha (terça, quinta e sábado, a partir de 19/11). Até 18/11, o horário das 19h já tem 13 carrosséis agendados no Metricool, que aparecem no calendário como "já agendado".

Arquivos:
- `calendario_90_dias.csv`: a tabela editável (dia, data, formato, número, série, pilar, tipo, tema, objetivo, gancho, CTA, métrica, sessão de gravação, gravar até, status, resultado, observação). Importe no Google Sheets e edite por lá.
- `sessoes_gravacao.csv`: 18 sessões de 5 Reels, com a data limite de gravação.
- O gerador está em `07_GESTAO/gerador/calendario.py`. Se mudar a ordem ou a data de início, rode de novo: `python3 -I 07_GESTAO/gerador/calendario.py . 07_GESTAO/gerador` (de dentro de `conteudo/5a-marcha`).

## Como a ordem foi montada

1. **Rodízio das 9 séries.** O Reel do dia segue a ordem Série 1, 2, 3 ... 9 e volta. Cada série aparece pelo menos uma vez por semana e nenhuma se repete em dias seguidos.
2. **Dentro da série, a ordem dos números.** Os 10 Reels do Lote 01 (R001 a R010) entram primeiro nas séries 1, 5 e 7, porque já foram aprovados.
3. **Carrosséis em rodízio pelas séries A a F**, começando pelo C001 em 19/11.
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
| 1 | 04/11 | 10/11 | 7 | 0 (6 já agendados) | Abertura com R001 hoje. Começa o teste T1 (gancho) |
| 2 | 11/11 | 17/11 | 7 | 0 (6 já agendados) | Primeira revisão grande depois de 10 Reels (13/11). Feriado 15/11 |
| 3 | 18/11 | 24/11 | 7 | 3 | Último agendado antigo e sessão G05 (18/11). FIRE de 19 a 22/11: tudo já gravado e agendado. C001 em 19/11, começa o T3 (capa). Feriado 20/11 |
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

Cada sessão grava 5 Reels em sequência, em 40 a 60 minutos, seguindo o `06_PRODUCAO/guia-gravacao-edicao.md`. A data "gravar até" deixa 4 dias para edição e agendamento, menos no começo, que está apertado porque o ciclo começou hoje.

Ordem recomendada dentro de cada sessão: primeiro os Reels de câmera frontal e quadro (o Gui olha para a lente o tempo todo), depois as simulações (troca de papel), e por último as falas dos Reels de tela. Assim ele só muda de posição uma vez.

**FIRE (19 a 22/11):** nenhuma gravação nesses dias. A sessão G05 foi puxada para 18/11, e os Reels de 19 a 23/11 saem da G04 (até 15/11). Agende tudo no Metricool antes de viajar.

**Primeiras sessões:**
- **G01 (hoje, 04/11):** R001 (vai ao ar hoje), R016, R026, R036, R008. Inclui o gancho B do R026 e do R036 (teste T1).
- **G02 (até 05/11):** R055, R002, R071, R081, R004.
- **G03 (até 10/11):** R017, R027, R037, R046, R056. Inclui o gancho B do R017 e do R046.

## Horários

Carrossel às 19h (o mesmo horário dos já agendados). Para os Reels, até o teste T5, use o melhor horário do dia indicado pelo Metricool (`getBestTimeToPostByNetwork`). Durante o T5 (30/12 a 26/01), alterne 12h e 18h.

## O que muda com o início hoje

- O calendário de 30 dias (`conteudo/vendas/calendario-30-dias.md`) fica substituído a partir de hoje.
- Os 13 carrosséis já agendados no Metricool até 18/11 continuam como estão.
- A pauta diária automática ainda manda o formato antigo (vídeo longo + 3 cortes). Ver a pendência P05.
