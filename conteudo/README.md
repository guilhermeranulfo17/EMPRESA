# Conteúdo do Gui: mapa do projeto

Tudo o que é conteúdo (perfis, formatos, pautas, rotinas automáticas) mora aqui. O que estiver neste arquivo vale
como regra para qualquer conversa nova.

## Perfis

| Perfil | Tema | Onde | Material |
|---|---|---|---|
| **@guisilva.vendas** + YouTube de vendas | Vendas para empresa pequena e média (vendedor e gestor comercial) | Instagram, YouTube (canal conectado no Metricool) | `vendas/agente-pauta.md` (pauta e calendário de 90 dias), carrossel diário pela skill `carrossel-guisilva-vendas` |
| **Guilherme Ranulfo** (@gui.ranulfo0, YouTube @guilhermeranulfo, TikTok @gui.ranulfo) | Formação e ativação cristã | Instagram, YouTube, TikTok | `fe/sistema-editorial.md` (cópia do doc oficial), skills `gui-pauta-do-dia` e `gui-cortes` |

Metricool: a marca 7598688 tem só o Instagram @guisilva.vendas e o YouTube de vendas conectados.

## 5ª Marcha (planejamento de 90 dias do @guisilva.vendas)

A partir de 04/11/2026, o @guisilva.vendas segue o laboratório `5a-marcha/`: 90 Reels e 30 carrosséis com roteiro
completo, calendário, painel e testes. Comece pelo `5a-marcha/README.md`. O público ali é mais amplo (SDR, closer,
executivo de contas) e a cadência é de Reels avulsos; o calendário de 30 dias
(`vendas/calendario-30-dias.md`) ficou substituído. A pauta diária automática ainda manda o formato antigo até o Gui
decidir a pendência P05 (`5a-marcha/07_GESTAO/pendencias.md`).

## Formato dos vídeos (decidido em 03/11/2026)

1. **Uma gravação por dia, na horizontal**, pensada para o YouTube. É o vídeo longo, de 8 a 12 min.
2. **Desse longo saem os cortes** para Reels e Shorts, no **formato split**: motion em cima ilustrando cada frase, o Gui
   embaixo e a legenda na divisão. Como fazer: `.claude/skills/reels-split-motion/SKILL.md`.
3. Para o formato antigo (vertical inteiro com efeitos por cima), use `/editar-video`, só quando ele pedir.

**Como gravar:**
- **Enquadramento:** horizontal, câmera na altura dos olhos, meio corpo no quadro e um palmo de espaço acima da cabeça.
- **Gancho:** gravado separado, olhando para a câmera, em 2 versões.
- **Frases:** uma ideia por frase.
- **Fim de cada bloco:** fecha com uma frase forte e 1 segundo de silêncio.
- **Áudio:** lapela, se tiver.

Melhorias combinadas para os próximos vídeos: `vendas/melhorias-videos.md`.

**Calendário dos próximos 30 dias (vídeos, cortes e carrosséis):** `vendas/calendario-30-dias.md`. Roteiros prontos ficam em `vendas/roteiros/`.

## Rotinas automáticas (agendamentos no claude.ai)

| Nome | Quando (horário de Brasília) | O que faz |
|---|---|---|
| Pauta guisilva.vendas | todo dia, 20h38 | Manda a pauta do vídeo de vendas de amanhã. O texto é igual a `vendas/agente-pauta.md`: se mudar um, mude o outro |
| Roteiro do longo de amanhã (Gui) | todo dia, 6h50 | Roteiro do longo cristão. **Desatualizado:** ainda lê a "Linha Editorial" antiga e pede 1 longo por dia. O Sistema Editorial novo pede 4 Shorts por semana e 1 longo a cada 2 semanas |
| Ligar SCRIPT no post de 11/11 | 11/11, 19h10 | Lembrete para ligar a automação do SCRIPT no ManyChat. Roda na conversa ligada ao computador do Gui |
| Abordagens diárias Orkestra | dias úteis, 6h04 | 15 leads de buffet por dia, com o link do WhatsApp pronto (vendas do Orkestra) |
| Leads de buffet semanais | domingo, 6h55 | Busca buffets de 2 cidades novas por semana (Orkestra) |
| Leitura das conversas Orkestra | desligado | Lia as conversas no WhatsApp Web |
| Análise diária NBA | todo dia, 12h13 | Análise dos jogos da NBA (pessoal) |

## Publicação (Metricool)

- **Horários:** cortes às 10h, 12h e 18h, e carrossel às 19h. Antes de agendar, confira os melhores horários do dia com `getBestTimeToPostByNetwork`.
- **Cada corte vai para dois lugares:** Reels no Instagram e Short no YouTube.
- **Vídeo grande:** o conector do Drive só baixa e sobe arquivos de até 10 MB. O Gui salva o MP4 no Drive e o link vai no Metricool.
- **SCRIPT:** post que pede "Comenta SCRIPT" precisa da automação ligada no ManyChat (palavra SCRIPT e e-book das 7 objeções).
- **Trial Reel:** só para testar uma versão nova de um vídeo que já saiu. Não é o padrão.
