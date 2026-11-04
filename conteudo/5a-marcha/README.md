# 5ª MARCHA · Laboratório de conteúdo

Planejamento de 90 dias para o @guisilva.vendas (Instagram e YouTube Shorts): 90 Reels e 30 carrosséis completos, calendário, painel de resultados e guias de produção.

## Mapa

| Pasta | O que tem |
|---|---|
| `00_ESTRATEGIA/estrategia.md` | Posicionamento, público, objetivos, pilares (ordem fixa: 1ª Mente, 2ª Leitura, 3ª Comando, 4ª Tração, 5ª Potência), funil, voz e premissas |
| `01_PESQUISA/` | `pesquisa.md` (achados com nível de confiança e limitações) e `fontes.csv` (F01 a F27, com link e data) |
| `02_REELS/` | R001 a R090, um arquivo por Reel, no modelo completo: identificação, estratégia de atenção, roteiro com fala literal, direção de produção, publicação e critérios de qualidade |
| `03_CARROSSEIS/` | C001 a C030, com capa A e B, texto exato e visual de cada slide, design, legenda, CTA e métrica |
| `04_CALENDARIO/` | `calendario.md` (como ler), `calendario_90_dias.csv` (editável), `dias_gravacao.csv` e `roteiros.html` (cópia da página de roteiros) |
| `05_PERFORMANCE/` | `indicadores.md` (fórmulas e rotina de 72h, 7d e 30d), `painel.csv` e `testes_ab.csv` |
| `06_PRODUCAO/` | `guia-do-reel.md`, `biblioteca-de-ganchos.md` e `guia-gravacao-edicao.md` (com o checklist de publicação) |
| `07_GESTAO/` | `indice_reels.csv`, `indice_carrosseis.csv`, `pendencias.md`, `historico.md` e o `gerador/` |

## Séries

**Reels (10 cada):** 1 Vida real do vendedor · 2 Psicologia do comprador · 3 Prospecção e cold call · 4 Diagnóstico intencional · 5 Objeções e negociação · 6 Follow-up e fechamento · 7 Execução e performance · 8 Processos e IA · 9 Simulações e entretenimento.

**Carrosséis (5 cada):** A Mentalidade · B Psicologia do comprador · C Diagnóstico e comunicação · D Negociação e fechamento · E Metas, comissões e performance · F Tecnologia, processos e IA.

## Fluxo de um Reel

1. O roteiro do dia chega por volta das 7h (e está na página https://claude.ai/artifact/TKiqP9pnFGPLCAFS7cPgGK ou no `R###.md`).
2. Gravar frase por frase, seguindo o `06_PRODUCAO/guia-gravacao-edicao.md`.
3. Mandar o vídeo para edição com a skill `reels-split-motion`. A lista "Motion em cima" do roteiro vira o filme de cima.
4. Conferir o checklist de publicação, agendar no Metricool (Reels + Shorts) com a legenda do roteiro.
5. Preencher o `05_PERFORMANCE/painel.csv` nas datas de coleta.

## Como editar

Os arquivos de `02_REELS`, `03_CARROSSEIS` e os índices são gerados a partir dos dados em `07_GESTAO/gerador/` (`reels_01.py` a `reels_09.py` e `cars_01.py` a `cars_03.py`). Para mudar um roteiro, edite o dado e rode, de dentro desta pasta:

```
python3 -I 07_GESTAO/gerador/render5m.py . 07_GESTAO/gerador/reels_0*.py 07_GESTAO/gerador/cars_0*.py
python3 -I 07_GESTAO/gerador/calendario.py . 07_GESTAO/gerador
python3 -I 07_GESTAO/gerador/painel.py .
```

O gerador recusa qualquer texto com travessão. Atenção: rodar o `painel.py` de novo apaga o que já foi preenchido no `painel.csv`; depois que a coleta começar, edite o painel na planilha.

## Regras que valem para tudo

- Nenhuma história, cliente, resultado, número ou depoimento inventado. Número ilustrativo sempre com a etiqueta "exemplo".
- Sem travessão e sem as expressões vetadas da estratégia.
- O curso (R$ 497) não aparece como anúncio. CTA máximo: "segue para acompanhar a série", até haver lista de espera.
- A meta de 100 mil seguidores qualificados é direção, não promessa.
