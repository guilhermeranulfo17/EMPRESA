---
name: editar-video
description: Edita um vídeo falado de ponta a ponta para Reels/TikTok - efeitos visuais sincronizados com a fala, trilha de fundo original (sem direitos autorais) e efeitos sonoros do SFX Kit, com conferência de tempo e volume. Use quando o usuário digitar /editar-video, mandar um vídeo pedindo "edita", "deixa massa", "coloca efeitos, música e sons", ou pedir o mesmo tratamento de um vídeo anterior.
---

# /editar-video: efeitos visuais + trilha + efeitos sonoros

O usuário não é técnico. Respostas curtas, em português, sem pedir que ele rode comandos. Faça tudo e entregue o
vídeo pronto com `SendUserFile`. Se ele mandou instruções junto ("coloca a palavra X", "sem música"), elas mandam.

Caminhos: `SK` = a pasta desta skill, `FX` = `.claude/skills/effects` (efeitos visuais), `KIT` = `sfx-kit/` na raiz
do projeto. `PY` = `FX/.venv/bin/python`. Trabalhe numa pasta só para este vídeo (no scratchpad) e copie o vídeo
para lá.

## 0. Preparar (uma vez por sessão)
`bash SK/scripts/setup.sh` até imprimir `READY`. Na nuvem a primeira vez leva uns minutos.

## 1. Entender o vídeo
1. `PY SK/scripts/transcribe.py video.mp4 fala.json`: o que é dito em cada trecho, e onde há fala e pausa. Os tempos
   são por trecho (entre pausas), não por palavra. O Whisper erra palavras; use o sentido.
2. Cortes de cena: `ffmpeg -i video.mp4 -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*"`.
3. Olhe um quadro de cada plano (ffmpeg, `-ss T -frames:v 1`) para saber onde o rosto está e qual plano é close.

## 1b. Cortes (sempre que houver regravação, começo falso ou pausa longa)
Gente gravando sozinha repete a frase até sair certa. Leia a transcrição e monte `keep.json` com os trechos de
`fala.json` que ficam: tire começos falsos ("Talvez..."), as tentativas incompletas de uma mesma frase (fica a
última completa) e ruído antes da primeira fala. Depois
`PY SK/scripts/cortes.py video.mp4 keep.json cortado.mp4`: aperta as pausas e alterna um zoom leve a cada corte,
para o pulo parecer intencional. Transcreva `cortado.mp4` de novo e confira que não sobrou repetição nem palavra
cortada. A partir daqui, tudo usa `cortado.mp4` e os tempos dele. Para achar a palavra certa dentro de trechos
longos, rode o silencedetect com `d=0.1` e transcreva os pedaços.
Vídeo longo (live, pregação, aula): escolha 1 a 3 trechos de 30 a 60 s com uma ideia fechada, mostre ao usuário e
edite. Vídeo horizontal: recorte o rosto (sem faixas e logos da transmissão), amplie para 1080 de largura e ponha
sobre o próprio vídeo desfocado e escurecido em 1080x1920, com o rosto no terço de cima.

## 2. Efeitos visuais (skill `effects`)
Leia `FX/SKILL.md` e siga as regras de lá (nunca cobrir o rosto, 1,5 a 4 s por efeito). O que funcionou bem:
- 4 ou 5 efeitos num vídeo de ~30 s, só nos closes; planos abertos sem efeito (o rosto fica pequeno).
- Gancho no começo: `split-headline` com a frase principal (`pill` com o nome do podcast/marca, nunca o padrão em inglês).
- Frase de impacto: `red-collage` (`lines` em 3 linhas curtas, `tag` próprio).
- Notícia, política, mídia: `match-cut` com `filler` em português (o padrão é texto em inglês).
- Final: `glitter-spotlight` numa pausa da fala.
- `messages` com `y` perto de 0.96 e no máximo 2 mensagens, senão cobre o rosto.
- `led-sign` fica atrás da cabeça quando o rosto está alto no quadro: confira o quadro ou evite.
- Passos e listas: `apple-toggles` com rótulos curtos (1 ou 2 palavras) e `ticks` em segundos do efeito, não do vídeo.
- Chamada final: `tap` com `label_off: "+ Seguir"`, `label_on: "Seguindo"`. Evite `comment-box`: mostra o nome da
  criadora da skill e textos em inglês.
- Frases do `red-collage` em 2 linhas quando o rosto é grande, senão saem pela parte de baixo.
Sempre gere os quadros de conferência (`--still`), olhe cada um, corrija e só depois renderize.

## 3. Trilha original
`PY SK/scripts/trilha.py trilha.wav --dur DURACAO --drums ENTRA,SAI`
Escolha `ENTRA` no maior impacto visual (a bateria entra com uma pancada) e `SAI` logo antes do efeito final (uma
subida leva até ele). A trilha é lo-fi/trap sombria em lá menor, 90 BPM. Se o usuário quiser outro clima, ajuste
`--bpm` ou edite o script, e diga que é composta em código, sem direitos autorais.

## 4. Efeitos sonoros (siga o CLAUDE.md da raiz)
SFX Kit primeiro: leia `KIT/GUIDE.md` (a tabela "On screen") e `KIT/catalogue.md`; confira `avoid_for` em
`KIT/sounds.json`. Para cada momento que importa (não todos), um som; os momentos exatos das animações estão no
código de `FX/scripts/fx.py` (procure o efeito: tempos em `c.lt`). Escreva `cues.json`:
`[{"at": 0.30, "id": "whoosh-fast-soft", "gain": 4}, ...]` e rode
`PY SK/scripts/sfx.py KIT cues.json fala.json sfx.wav`.
O que funcionou: whoosh no card que desce, `pop-small-in` num destaque, `impact-medium-hard` (sem grave) na pancada,
`mechanical-shutter-light` em cada corte do match-cut, `notification-message-in-soft` nas mensagens,
`shimmer-medium-bright` no final, `click-toggle-on-medium` nos botões, `click-button-medium` no Seguir. Sons pequenos
sobre a fala precisam de +4 a +8 dB de `gain`, senão somem; cliques curtos já chegam no pico, então +5 basta.
Openverse só se faltar um som no kit (ver CLAUDE.md) e anote os créditos.

## 5. Mixar e conferir
1. `bash SK/scripts/mix.sh video_fx.mp4 trilha.wav sfx.wav final.mp4` (5º argumento opcional: volume da música,
   padrão 0.55).
2. `PY SK/scripts/check.py sfx.wav sfx.cues.json video.mp4 final.mp4`. Corrija o que marcar `baixo demais` ou
   `alto demais` (ajuste `gain` no cues.json, rode sfx.py e mix.sh de novo) e confira outra vez. O alvo é cerca de
   -14 LUFS, com pico abaixo de -1 dBTP.

## 6. Entregar
Mande `final.mp4` com `SendUserFile` e, numa tabela curta, o que entrou em cada momento. Diga com franqueza que você
mede o áudio mas não escuta, e peça para ele conferir no fone. Sem crédito a dar quando todos os sons são do SFX
Kit; se usou Openverse CC BY, entregue o texto do creditos.txt para a legenda.
