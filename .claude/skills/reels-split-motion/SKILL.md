---
name: reels-split-motion
description: Formato padrão dos Reels/Shorts do Gui (aprovado em 03/11/2026) - tela dividida, com motion graphics em cima ilustrando o que ele fala, frase por frase, e ele embaixo, legenda na divisão, trilha original e efeitos sonoros. Use sempre que ele mandar um vídeo falado para virar Reels/Shorts, pedir "cortes", "o formato do motion", "split" ou "igual ao da proposta".
---

# Reels split com motion (padrão do Gui)

Tela 1080x1920 dividida ao meio:
- **Em cima (1080x960):** motion graphics desenhado em código. Cada cena ilustra a frase que o Gui está falando, na hora exata em que ele fala.
- **Embaixo (1080x960):** o Gui, num enquadramento aberto, tirado do vídeo original.
- **Na divisão (y = 960):** legenda dinâmica de 2 a 3 palavras.

O exemplo aprovado está em `exemplo/`: `film_proposta.js` (a animação), `cortes_proposta.json` e `legendas_proposta.json`.
É o corte "Nunca mande proposta assim" do vídeo IMG_5126, de 03/11.

O Gui não é técnico. Respostas curtas, em português, sem pedir que ele rode comandos. Entregue o MP4 com `SendUserFile`.
NUNCA use travessão nos textos.

Caminhos usados abaixo:
- `SK`: a pasta desta skill.
- `MR`: a skill `motion-reel`, que faz o render da animação.
- `ED`: `.claude/skills/editar-video/scripts`.
- `PY`: `.claude/skills/effects/.venv/bin/python`. Rode `bash ED/setup.sh` uma vez por sessão.

Trabalhe sempre no scratchpad: uma pasta para o vídeo e uma pasta `motion/` para a animação.

## 1. Vídeo e cortes
1. Pegar o vídeo:
   - **Do Drive:** o conector só baixa arquivos de até 10 MB. Para um arquivo maior, peça licença para ativar o compartilhamento por link e baixe com
     `curl -L "https://drive.usercontent.google.com/download?id=ID&export=download&confirm=t"`.
     O conector não tira o link depois, então avise o Gui para voltar o arquivo para "Restrito".
   - **Do iPhone:** o vídeo vem em HEVC 10-bit HLG e às vezes com rotação. Confira com `ffprobe` e tire um quadro para ver o enquadramento.
2. Transcrever com `PY ED/transcribe.py audio.wav fala.json`. Ele dá o tempo por trecho de fala.
   - Nos trechos escolhidos, rode de novo com `PY SK/scripts/transcribe_medium.py`, que usa o whisper medium e erra menos.
   - Para baixar o medium: `curl -L .../sherpa-onnx-whisper-medium.tar.bz2 | tar xj -C ~/.cache/editar-video`, do GitHub releases do k2-fsa.
   - O Hugging Face (faster-whisper) costuma estar bloqueado.
3. Escolher os cortes com as regras de corte do perfil:
   - Vendas: o calendário do @guisilva.vendas.
   - Fé: a skill gui-cortes.
   - Para qualquer perfil:
     - abrir na frase mais forte;
     - uma ideia só;
     - terminar no pico;
     - entre 25 e 45 segundos.
4. Escrever `cuts.json` com os trechos de fala de cada corte, em segundos do vídeo original.

## 1b. Gravação frase por frase (padrão desde 04/11/2026)
O Gui grava lendo um roteiro numerado (`conteudo/vendas/roteiros/AAAA-MM-DD-*.md`, ou a pauta diária). Ele fala uma frase de cada vez e, quando erra, repete a frase inteira.
Vários takes da mesma frase podem estar no vídeo.
1. **Transcrever o vídeo inteiro:** use `transcribe.py` e, depois, `transcribe_medium.py` em cada trecho de fala.
2. **Casar cada frase do roteiro com o take certo:** compare cada trecho com as frases do roteiro por semelhança de texto (palavras em comum; `difflib` serve).
   - Fique com o **último take completo** de cada frase.
   - Descarte takes cortados no meio, "pera", recomeços e o que não estiver no roteiro.
3. **Montar o longo:** as frases na ordem do roteiro, com cerca de 0,25s de respiro entre elas e cerca de 0,6s na troca de bloco.
   - Alterne o enquadramento (aberto e 1,15x) a cada bloco ou a cada 2 ou 3 frases.
   - Ponha o título de seção em cada bloco e o volume em cerca de -14 LUFS.
   - Para a montagem, junte os pedaços e leia a duração real de cada um com `ffprobe`. Somando os tempos planejados, os títulos e capítulos atrasam.
4. **Montar os cortes:** cada corte é a sequência das frases ✂️ do bloco, já com as pausas tiradas. Vai para a tela de baixo (seção 2) e para o motion (seções 3 e 4). As linhas "Motion:" do roteiro são o ponto de partida das cenas.
5. **Avisar o Gui:** se faltar take bom de alguma frase, diga qual número e siga sem ela, se o sentido aguentar.

## 2. Tela de baixo (o Gui)
1. `python3 SK/scripts/build_bottom.py VIDEO cuts.json NOME pasta --cx 0.49 --cy 0.53 --crop-h 1700`
   - `--cx` e `--cy` são o centro do rosto, medido num quadro.
   - Rode **um corte por vez**: decodificar várias vezes em 4K ao mesmo tempo estoura a memória.
2. Se sobrar gaguejada ou frase embolada, remova com `python3 SK/scripts/keep.py in.mp4 out.mp4 '[[0,35.3],[37.9,42.5]]'`.
3. Rode `transcribe_medium.py` no clipe final para ter os tempos de cada frase. É essa linha do tempo que manda em tudo.

## 3. Roteiro do motion
Monte uma tabela com uma linha por frase: tempo, o que ele fala e o que aparece em cima. A cada 2 a 4 segundos, algo novo entra na tela.
- **Quando mostrar antes:** se o tema for novo ou o Gui pedir, mostre a tabela e espere o ok. Se não, siga direto.
- **Ideias que funcionaram:**
  - pilha de páginas com contador;
  - conversa de chat digitando e enviando;
  - barra de "esforço" enchendo;
  - agenda lotando;
  - carimbo ("NÃO LIDO");
  - página montada bloco a bloco, com rótulos numerados.

## 4. Animação (motion-reel)
1. `cd motion && node MR/scripts/scaffold.mjs NOME --duration DUR --formats 9x16`.
   - `DUR` é a duração do clipe mais 1 segundo de final segurado.
2. Fontes: copie `effects/fonts/ArchivoBlack-Regular.ttf` para `fonts/display.ttf` e `effects/fonts/Inter.ttf` para `fonts/ui.ttf`.
3. Crie `beats.json` com `{"bpm":60,"period":1,"offset":0,"beats":[],"downbeats":[],"sections":[]}`. Assim, 1 beat é 1 segundo e `u` vira o tempo do clipe.
4. Escreva `film.js` partindo de `exemplo/film_proposta.js`. Ele já tem:
   - a paleta;
   - o kicker (rótulo pequeno no alto de cada cena);
   - as funções `page()` e `chip()`;
   - a troca de cena em chicote, com as duas cenas na tela;
   - a lista de `HITS` com os efeitos sonoros.
5. Regras de visual:
   - Desenhe só nos 960 px de cima e deixe a metade de baixo preta.
   - Conteúdo a partir de y = 130, porque a barra do Instagram cobre o topo.
   - Fundo `#0E1116`, um único destaque amarelo `#FFD60A`, fonte Archivo Black nos títulos e Inter no resto.
   - Nada de logo ou tela de marca real, como WhatsApp. Use elementos genéricos.
   - Nada que o Gui não falou. Sem número inventado.
6. Confira antes de renderizar:
   - Gere quadros de conferência: `node MR/scripts/render.mjs --film NOME --format 9x16 --at 2.9,6.4,... --noblur`.
   - Monte uma prancha só com a metade de cima, olhe e corrija: texto coberto, sobreposição, timing.
   - Faça pelo menos 2 rodadas.
7. Renderize e gere os efeitos sonoros:
   - `node MR/scripts/render.mjs --film NOME --format 9x16 --video-only --fps 30 --workers 4` (cerca de 2 min para 40s).
   - `node MR/scripts/sfx.mjs NOME` gera os efeitos sonoros a partir dos `HITS`.

## 5. Legenda, trilha e montagem
1. Legenda:
   - Escreva `legendas.json` no formato `{"hook":[],"mute":[],"segs":[[ini,fim,"texto com *destaque*"],...]}`, com o texto corrigido pelo sentido. O tempo é o do clipe.
   - Rode `python3 SK/scripts/caps_split.py legendas.json legendas.ass`. A legenda sai na divisão, com o destaque em amarelo.
2. Trilha: `PY ED/trilha.py trilha.wav --dur DUR --drums ENTRA,SAI`.
3. Montagem: `bash SK/scripts/compose.sh motion/out/NOME/video_9x16.mp4 NOME_bottom.mp4 legendas.ass trilha.wav motion/NOME/audio/sfx.wav final.mp4 1.0`
   - Ele empilha as duas telas, segura o último quadro, mixa voz, trilha e efeitos e masteriza em cerca de -14 LUFS, com pico abaixo de -1 dBTP.
4. Antes de entregar:
   - Tire 8 quadros do final e olhe: legenda legível, nada cobrindo o rosto, cena certa na hora certa.
   - Diga com franqueza que você mede o áudio mas não escuta.

## 6. Publicar (quando o Gui pedir)
1. **Subir os arquivos:** o MP4 precisa ir para o Drive. Peça para o Gui salvar na pasta dele, porque o conector não sobe arquivo grande. Depois use o link do arquivo no Metricool.
2. **Agendar no Metricool:** marca 7598688, com Instagram (`type` REEL) e YouTube (`type` short, `madeForKids` false).
   - Horários: pegue os melhores com `getBestTimeToPostByNetwork` e espace os posts em cerca de 3 horas.
   - O carrossel diário sai às 19h, então não poste nesse horário.
3. **Teste de formato:** para testar com o mesmo conteúdo de um Reels que já saiu, use o tipo `TRIAL_REEL`.
4. **SCRIPT:** se a legenda pedir "Comenta SCRIPT", lembre o Gui de ligar a automação do ManyChat nesse post.
5. **Depois de publicar:** lembre o Gui de voltar os links do Drive para "Restrito".
