// Som ambiente sintetizado na hora (sem arquivos): ar-condicionado, murmúrio de conversa,
// teclados, passos, gongo de venda e aplausos. Só começa depois de um clique, como o navegador exige.

export function criarSom() {
  let ctx = null;
  let mestre = null;
  let ligado = false;
  let teclas = 0;
  let timer = null;

  function ruidoBuffer(segundos, tipo = 'branco') {
    const n = Math.floor(ctx.sampleRate * segundos);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buffer.getChannelData(0);
    let ultimo = 0;
    for (let i = 0; i < n; i++) {
      const branco = Math.random() * 2 - 1;
      if (tipo === 'marrom') {
        ultimo = (ultimo + 0.02 * branco) / 1.02;
        d[i] = ultimo * 3.5;
      } else d[i] = branco;
    }
    return buffer;
  }

  function fonteEmLaco(buffer, filtro, freq, q, ganho) {
    const fonte = ctx.createBufferSource();
    fonte.buffer = buffer;
    fonte.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filtro;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = ganho;
    fonte.connect(f).connect(g).connect(mestre);
    fonte.start();
    return { fonte, filtro: f, ganho: g };
  }

  let ambiente = null;
  function iniciar() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mestre = ctx.createGain();
    mestre.gain.value = 0;
    mestre.connect(ctx.destination);
    const marrom = ruidoBuffer(4, 'marrom');
    const branco = ruidoBuffer(3);
    ambiente = {
      ar: fonteEmLaco(marrom, 'lowpass', 380, 0.5, 0.35),
      conversa: fonteEmLaco(branco, 'bandpass', 520, 1.6, 0.035),
      rua: fonteEmLaco(marrom, 'lowpass', 160, 0.7, 0),
    };
    // o murmúrio sobe e desce como conversa de verdade
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.23;
    const lfoGanho = ctx.createGain();
    lfoGanho.gain.value = 0.02;
    lfo.connect(lfoGanho).connect(ambiente.conversa.ganho.gain);
    lfo.start();
    const tic = () => {
      if (ligado && teclas > 0 && Math.random() < Math.min(0.95, teclas / 6)) tecla();
      timer = setTimeout(tic, 70 + Math.random() * 160);
    };
    tic();
  }

  function tecla() {
    const t = ctx.currentTime;
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruidoBuffer(0.03);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2400 + Math.random() * 2600;
    f.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05 + Math.random() * 0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    fonte.connect(f).connect(g).connect(mestre);
    fonte.start(t);
  }

  function gongo() {
    if (!ligado) return;
    const t = ctx.currentTime;
    for (const [freq, amp, dur] of [[110, 0.5, 6], [164.8, 0.3, 5], [220.5, 0.28, 4.5], [297, 0.16, 3.5], [440.7, 0.1, 2.5], [587, 0.06, 2]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * 1.01, t);
      o.frequency.exponentialRampToValueAtTime(freq, t + 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(amp * 0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(mestre);
      o.start(t);
      o.stop(t + dur);
    }
  }

  function aplausos(segundos = 3.5, intensidade = 1) {
    if (!ligado) return;
    const t0 = ctx.currentTime;
    const palmas = Math.floor(segundos * 55 * intensidade);
    for (let i = 0; i < palmas; i++) {
      const t = t0 + Math.random() * segundos;
      const fonte = ctx.createBufferSource();
      fonte.buffer = ruidoBuffer(0.05);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 900 + Math.random() * 1800;
      f.Q.value = 1.2;
      const g = ctx.createGain();
      const fim = Math.max(0, 1 - (t - t0) / segundos);
      g.gain.setValueAtTime(0.06 * (0.4 + fim), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      fonte.connect(f).connect(g).connect(mestre);
      fonte.start(t);
    }
  }

  function passo() {
    if (!ligado) return;
    const t = ctx.currentTime;
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruidoBuffer(0.06);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    fonte.connect(f).connect(g).connect(mestre);
    fonte.start(t);
  }

  return {
    get ligado() {
      return ligado;
    },
    alternar() {
      iniciar();
      ligado = !ligado;
      ctx.resume();
      mestre.gain.setTargetAtTime(ligado ? 0.55 : 0, ctx.currentTime, 0.4);
      return ligado;
    },
    // Ajusta o ambiente ao que está na tela: quantas pessoas digitam, se a câmera está na rua, se é noite.
    ajustar({ digitando = 0, fora = false, noite = false, silencio = false }) {
      if (!ctx) return;
      teclas = silencio ? 0 : digitando;
      const t = ctx.currentTime;
      ambiente.conversa.ganho.gain.setTargetAtTime(fora || silencio || noite ? 0.004 : 0.035, t, 0.8);
      ambiente.ar.ganho.gain.setTargetAtTime(fora ? 0.08 : 0.35, t, 0.8);
      ambiente.rua.ganho.gain.setTargetAtTime(fora ? 0.5 : 0.05, t, 0.8);
      ambiente.rua.filtro.frequency.setTargetAtTime(noite ? 120 : 200, t, 1);
    },
    gongo,
    aplausos,
    passo,
    destruir() {
      clearTimeout(timer);
      ctx?.close();
    },
  };
}
