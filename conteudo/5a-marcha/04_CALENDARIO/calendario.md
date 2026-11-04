# Calendário de 30 dias

**Período:** D01 = quarta, 04/11/2026, até D30 = quinta, 03/12/2026 (pedido do Gui em 04/11).
**Volume:** 3 Reels por dia (12h, 15h e 18h), 90 no total, e 1 carrossel por dia às 19h, 30 no total. Cada Reel vai para o Instagram e para o YouTube Shorts.

Arquivos:
- `calendario_30_dias.csv`: a tabela editável (dia, data, formato, horário, número, série, pilar, tipo, tema, objetivo, gancho, CTA, métrica, dia de gravação, status, resultado, observação). Importe no Google Sheets e edite por lá.
- `dias_gravacao.csv`: o que gravar em cada dia.
- `roteiros.html`: cópia da página de roteiros (https://claude.ai/artifact/TKiqP9pnFGPLCAFS7cPgGK).
- O gerador está em `07_GESTAO/gerador/calendario.py`. Se mudar a ordem ou a data de início, rode de novo: `python3 -I 07_GESTAO/gerador/calendario.py . 07_GESTAO/gerador` (de dentro de `conteudo/5a-marcha`).

## Como a ordem foi montada

1. **Rodízio das 9 séries.** Os Reels seguem a ordem Série 1, 2, 3 ... 9 e voltam. Cada dia tem 3 séries diferentes, e em 3 dias todas as séries aparecem.
2. **Dentro da série, a ordem dos números.** Os 10 Reels do Lote 01 (R001 a R010) entram primeiro nas séries 1, 5 e 7, porque já foram aprovados.
3. **Carrosséis em rodízio pelas séries A a F**, um por dia, começando pelo C001 hoje.
4. **Ordem dos pilares preservada.** O calendário mistura temas, mas nenhum conteúdo muda a sequência da metodologia (1ª Mente, 2ª Leitura, 3ª Comando, 4ª Tração, 5ª Potência).

## Semanas

| Semana | De | Até | Reels | Carrosséis | Destaques |
|---|---|---|---|---|---|
| 1 | 04/11 | 10/11 | 21 | 7 | Começam o T1 (gancho), o T2 (formato) e o T3 (capa). Primeira revisão grande em 07/11, depois de 10 Reels |
| 2 | 11/11 | 17/11 | 21 | 7 | Começa o T4 (duração). De 15 a 17/11 você grava 6 por dia (os do dia e os de um dia da FIRE). Feriado 15/11 |
| 3 | 18/11 | 24/11 | 21 | 7 | 18/11 também com 6. FIRE de 19 a 22/11: tudo já gravado e agendado. Feriado 20/11 |
| 4 | 25/11 | 01/12 | 21 | 7 | T5 (horário) em andamento |
| 5 | 02/12 | 03/12 | 6 | 2 | Revisão do ciclo em 03/12 |

## Gravação

**3 Reels por dia, gravados de manhã no dia em que saem.** O roteiro completo dos 3 chega no celular por volta das 7h (agendamento "Pauta guisilva.vendas") e também está na página https://claude.ai/artifact/TKiqP9pnFGPLCAFS7cPgGK, que abre no dia de hoje.

Fluxo do dia:
1. Chega o roteiro.
2. O Gui grava os 3 num arquivo só, frase por frase. Entre um Reel e outro, 5 segundos de silêncio e o número dele falado.
3. Ele manda o vídeo para o editor, uma conversa separada que usa a skill `editor-5a-marcha` (prompt mestre em `06_PRODUCAO/prompt-editor.md`).
4. O editor devolve os 3 Reels prontos, com capa e legenda. O que couber no plano do Metricool é agendado; o resto o Gui posta na mão.

**FIRE (19 a 22/11):** nada de gravação. Os 3 Reels de cada dia da FIRE são gravados antes:
- **15/11:** os de 15/11 e os de 19/11 (6 Reels).
- **16/11:** os de 16/11 e os de 20/11.
- **17/11:** os de 17/11 e os de 21/11.
- **18/11:** os de 18/11 e os de 22/11.

Agende tudo antes de viajar.

**Versões extras de teste:**
- **T1:** gancho B do R026, R036, R017 e R046.
- **T4:** versão curta do R038, R039 e R065, feita na edição.

## Horários

- **Reels:** 12h, 15h e 18h.
- **Carrossel:** 19h.
- **T5:** compara os 3 horários depois da FIRE.

Com o plano grátis do Metricool (20 posts por mês), o Gui posta na mão o que passar do limite.

## O que mudou

- O calendário de 30 dias antigo foi substituído e está em `conteudo/vendas/arquivo/`.
- Os 13 carrosséis antigos agendados de 04 a 18/11 foram para rascunho no Metricool. Cada um recebe a arte e a legenda da 5ª Marcha do mesmo dia assim que as imagens estiverem no Drive (`07_GESTAO/metricool_carrosseis.csv`).
