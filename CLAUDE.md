# Instruções para o Claude neste projeto

## Conteúdo
O mapa de tudo o que é conteúdo do Gui está em `conteudo/README.md`: perfis, formato dos vídeos, como gravar, rotinas
automáticas e publicação no Metricool. Leia esse arquivo antes de qualquer tarefa de conteúdo.

O texto da pauta diária de vendas está em `conteudo/vendas/agente-pauta.md` e precisa ficar igual ao do agendamento
"Pauta guisilva.vendas". Se mudar um, mude o outro.

## Edição de vídeos

**Formato padrão dos Reels/Shorts (aprovado em 03/11/2026):** tela dividida, com motion graphics em cima ilustrando o
que o Gui fala, frase por frase, e ele embaixo, com legenda na divisão. Use a skill `reels-split-motion` sempre que ele
mandar um vídeo falado para virar Reels/Shorts.

Para o formato antigo (vídeo vertical inteiro com efeitos por cima), use a skill `/editar-video` (efeitos visuais,
trilha original e efeitos sonoros, com conferência no final). Use só quando ele pedir esse formato.

## Efeitos sonoros em vídeos

Ordem de preferência: SFX Kit primeiro (CC0, sem crédito), depois Openverse, e por último criar com o Earshot.

### SFX Kit
- Fica em `sfx-kit/` (não vai para o git). Se a pasta não existir, baixe com
  `git clone --depth 1 https://github.com/wyzowl/sfx-kit sfx-kit && rm -rf sfx-kit/.git`.
- Leia `sfx-kit/GUIDE.md` e `sfx-kit/catalogue.md`; a ficha completa de cada som está em `sfx-kit/sounds.json`.
- Posicione cada som em `momento - sync.at`, respeite o `avoid_for` e abaixe `under_voiceover_db` quando o
  corpo do som (`timing.onset` a `timing.body_end`) cair sobre a fala.

### Openverse
Para buscar efeitos sonoros, use a API aberta do Openverse (não precisa de chave):
https://api.openverse.org/v1/audio/?q=TERMO&license_type=commercial&page_size=20

- Troque TERMO pelo som que a cena pede, em inglês (ex.: whoosh, pop, click).
- Use sempre license_type=commercial: assim só vêm sons liberados pra uso comercial.
- Baixe o arquivo do campo "url" do resultado escolhido para a pasta sons/ do projeto.
- Anote num arquivo creditos.txt o campo "license" de cada som. Se for "by", copie também o campo "attribution":
  esse som precisa de crédito.

Observação: no ambiente do Claude Code na nuvem, api.openverse.org e huggingface.co estão bloqueados pela rede;
nesse caso use só o SFX Kit e diga isso ao usuário.

### Mixagem
- A voz manda: efeitos abaixo da voz (cerca de 6 a 12 dB quando caem sobre a fala), volume final por volta de
  -14 LUFS e pico abaixo de -1 dBTP.
- Menos é mais: som só nos momentos que importam.
