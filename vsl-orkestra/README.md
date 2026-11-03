# VSL do Orkestra (vídeo de vendas para donos de buffet)

Vídeo vertical 1080x1920, 30 fps, 54,6 s, feito no Remotion com capturas reais do Orkestra rodando local
(Buffet Estrela, dados fictícios do `TRIMFLOW/supabase/seed-video.sql`).

## Renderizar uma versão para um prospect

```bash
npx remotion render OrkestraVSL "out/orkestra-vsl-buffet-alegria.mp4" --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k --x264-preset=veryslow --props='{"buffetName":"Buffet Alegria"}'
```

`buffetName` aparece no primeiro segundo ("Para o Buffet Alegria") e no fim ("2 semanas de cortesia
pro Buffet Alegria"). Sem `--props`, sai "seu buffet". A narração não muda (é a mesma para todos).

## Peças

- `public/capturas/`: as telas (Playwright, 390x844 a 3x), refeitas com `scripts/capturar.cjs`.
- `public/audio/narracao.mp3`: `narracao-v1.mp3` até 44,4 s + `frase-final-v2.mp3` (a frase da cortesia),
  emendadas por `scripts/emendar.sh`. Narração do ElevenLabs (voz "José Ferreira - Conversa (WhatsApp)",
  multilingual v2, stability 0.45, similarity 0.8, style 0.2, velocidade 1.05). Gerar de novo custa crédito.
- `public/audio/legenda.json`: tempo de cada palavra (`scripts/alinhar.py`, sem custo).
- `public/audio/mix.wav`: voz + trilha + efeitos, -14 LUFS (`scripts/mixar.py`; trilha composta em código em
  `scripts/trilha_leve.py`, efeitos do SFX Kit, CC0).
- `src/roteiro.json`: a linha do tempo inteira (cenas, capturas, câmera, toques, destaques e efeitos sonoros).
  O vídeo e a mixagem leem o mesmo arquivo: mudou um tempo, rode `scripts/mixar.py` de novo.
- Stills de conferência: `bash scripts/stills.sh PASTA "4.6 21.2 30.4"`.
