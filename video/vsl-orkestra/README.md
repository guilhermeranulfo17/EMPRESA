# VSL do Orkestra (Remotion)

Vídeo de vendas da landing (`sistemaorkestra.com.br`, seção `#video`). Roteiro em
`../roteiros/vsl-orkestra.md`; as frases ficam em `src/roteiro.ts`.

## Como refazer

1. `npm install` (Remotion 4.0.540).
2. Narração: gere no ElevenLabs com o texto do roteiro e salve em `public/audio/narracao.mp3`.
3. Tempos: `node --experimental-strip-types scripts/tempos-estimados.mjs && node scripts/tempos.mjs`
   (as fronteiras entre frases vão para as pausas reais da fala).
4. Render: `npx remotion render VSL voz.mp4 --props='{"comAudio":true,"comLegenda":false}' --crf=16`
   (na nuvem, `--browser-executable=/opt/pw-browsers/chromium`).
5. Áudio, com a skill `editar-video` da raiz:
   - `node scripts/cues.mjs cues.json` (efeitos do SFX Kit, presos às animações);
   - `fala.json` = `{"duration": <duração>, "speech": [[início, fim], ...]}` das frases;
   - `trilha.py trilha.wav --dur 85.1 --drums 25.6,79.3 --bpm 96`, `sfx.py`, `mix.sh ... 0.45` e
     `check.py` (alvo: cerca de -14 LUFS, pico abaixo de -1 dBTP).
6. Web: MP4 (H.264, crf 23, faststart) e WebM (VP9, crf 34), com `volume=-0.6dB`; legenda com
   `node scripts/vtt.mjs vsl-orkestra.vtt`; poster = quadro do gancho (~9,6 s) em WEBP 1280.
7. Copie `vsl-orkestra.{mp4,webm,vtt}` e `vsl-orkestra-poster.webp` para `TRIMFLOW/public/landing/`.

Créditos: fonte Manrope (OFL), efeitos do SFX Kit (CC0, sem crédito), trilha composta em código.
