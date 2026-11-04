# Calendário de 90 dias

**Período:** D01 = segunda, 23/11/2026, até D90 = sábado, 20/02/2027.
**Volume:** 90 Reels (1 por dia) e 30 carrosséis (terça e quinta, e também sábado nas semanas 1, 4, 7 e 10). Total de 120 publicações.

Arquivos:
- `calendario_90_dias.csv`: a tabela editável (dia, data, formato, número, série, pilar, tipo, tema, objetivo, gancho, CTA, métrica, sessão de gravação, gravar até, status, resultado, observação). Importe no Google Sheets e edite por lá.
- `sessoes_gravacao.csv`: 18 sessões de 5 Reels, com a data limite de gravação.
- O gerador está em `07_GESTAO/gerador/calendario.py`. Se mudar a ordem dos Reels, rode de novo: `python3 -I 07_GESTAO/gerador/calendario.py . 07_GESTAO/gerador` (de dentro de `conteudo/5a-marcha`).

## Como a ordem foi montada

1. **Rodízio das 9 séries.** O Reel do dia segue a ordem Série 1, 2, 3 ... 9 e volta. Cada série aparece pelo menos uma vez por semana e nenhuma se repete em dias seguidos.
2. **Dentro da série, a ordem dos números.** Os 10 Reels do Lote 01 (R001 a R010) entram primeiro nas séries 1, 5 e 7, porque já foram aprovados.
3. **Carrosséis em rodízio pelas séries A a F**, começando pelo C001.
4. **Ordem dos pilares preservada.** O calendário mistura temas, mas nenhum conteúdo muda a sequência da metodologia (1ª Mente, 2ª Leitura, 3ª Comando, 4ª Tração, 5ª Potência).

## Equilíbrio do funil (Reels)

| Etapa | Formatos | Reels | Meta da estratégia |
|---|---|---|---|
| Descoberta | Opinião forte, simulação, antes e depois | 47 (52%) | cerca de 45% |
| Valor | Ensino prático, análise, demonstração | 38 (42%) | cerca de 40% |
| Relação | Desafio, história | 5 (6%) | cerca de 15% |

A etapa de relação está abaixo da meta nos Reels, porque histórias pessoais só entram com fato confirmado pelo Gui. Para compensar: 10 Reels têm o comentário como objetivo, os 4 desafios geram vídeos de resposta (extras, fora dos 90) e os Stories de bastidor ficam livres. Quando o Gui confirmar histórias próprias, elas entram no lugar de Reels de descoberta (ver `07_GESTAO/pendencias.md`).

## Semanas

| Semana | De | Até | Reels | Carrosséis | Destaques |
|---|---|---|---|---|---|
| 1 | 23/11 | 29/11 | 7 | 3 | Abertura com R001 e C001. Começa o teste T1 (gancho) |
| 2 | 30/11 | 06/12 | 7 | 2 | Primeira revisão grande depois de 10 publicações |
| 3 | 07/12 | 13/12 | 7 | 2 | Fim do T1 |
| 4 | 14/12 | 20/12 | 7 | 3 | Começa o T4 (duração) |
| 5 | 21/12 | 27/12 | 7 | 2 | Natal (24 e 25): fora das comparações |
| 6 | 28/12 | 03/01 | 7 | 2 | R010 só vai ao ar se o Gui validar as lições. Ano Novo (31 e 01) |
| 7 | 04/01 | 10/01 | 7 | 3 | Fim do T4 |
| 8 | 11/01 | 17/01 | 7 | 2 | R086 (desafio): gravar a resposta para a semana seguinte |
| 9 | 18/01 | 24/01 | 7 | 2 | Começa o T5 (horário) |
| 10 | 25/01 | 31/01 | 7 | 3 | R052 (desafio) |
| 11 | 01/02 | 07/02 | 7 | 2 | |
| 12 | 08/02 | 14/02 | 7 | 2 | Carnaval (08 e 09): fora das comparações. Fim do T5 |
| 13 | 15/02 | 20/02 | 6 | 2 | R045 e R064 (desafios). Revisão do ciclo no D90 |

## Gravação

Cada sessão grava 5 Reels em sequência, em 40 a 60 minutos, seguindo o `06_PRODUCAO/guia-gravacao-edicao.md`. A data "gravar até" deixa 4 dias para edição e agendamento.

Ordem recomendada dentro de cada sessão: primeiro os Reels de câmera frontal e quadro (o Gui olha para a lente o tempo todo), depois as simulações (troca de papel), e por último as falas dos Reels de tela. Assim ele só muda de posição uma vez.

**Primeiras sessões:**
- **G01 (até 19/11):** R001, R016, R026, R036, R008. Inclui o gancho B do R026 e do R036 (teste T1).
- **G02 (até 24/11):** R055, R002, R071, R081, R004.
- **G03 (até 29/11):** R017, R027, R037, R046, R056. Inclui o gancho B do R017 e do R046.

## Horários

O padrão do perfil é carrossel às 19h. Para os Reels, até o teste T5, use o melhor horário do dia indicado pelo Metricool (`getBestTimeToPostByNetwork`). Durante o T5 (18/01 a 14/02), alterne 12h e 18h.

## Antes do D01

Até 22/11 seguem os vídeos da pauta diária e os carrosséis já agendados no Metricool (até 18/11). Ver `07_GESTAO/pendencias.md`.
