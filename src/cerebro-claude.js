// Cérebro com Claude: cada agente decide sua próxima ação chamando a API da Anthropic.
// Se a chamada falhar, o agente usa o cérebro simulado naquela rodada para o escritório não travar.

import Anthropic from '@anthropic-ai/sdk';
import { CerebroSimulado } from '../public/js/cerebro-simulado.js';

const ESQUEMA_ACAO = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'acao', 'para', 'texto', 'ideia_titulo', 'ideia_id', 'voto'],
  properties: {
    status: { type: 'string', description: 'O que você está fazendo na sua mesa agora, em até 8 palavras.' },
    acao: { type: 'string', enum: ['mensagem', 'ideia', 'votar'] },
    para: { type: 'string', description: 'id de um colega, id de um setor, "todos" ou "ceo".' },
    texto: { type: 'string', description: 'A mensagem, a descrição da ideia ou o comentário do voto. No máximo 3 frases.' },
    ideia_titulo: { type: 'string', description: 'Título curto da ideia, só quando acao = "ideia". Senão, "".' },
    ideia_id: { type: 'string', description: 'id da ideia votada, só quando acao = "votar". Senão, "".' },
    voto: { type: 'string', enum: ['apoiar', 'questionar', 'nenhum'] },
  },
};

export class CerebroClaude {
  constructor({ modelo = 'claude-opus-5', esforco = 'low' } = {}) {
    this.nome = 'claude';
    this.modelo = modelo;
    this.esforco = esforco;
    this.cliente = new Anthropic();
    this.reserva = new CerebroSimulado();
    this.usarFallbacks = true;
  }

  async decidir(ctx) {
    try {
      return await this.perguntar(ctx);
    } catch (erro) {
      console.warn(`[claude] ${ctx.agente.nome}: ${erro.message} — usando simulação nesta rodada.`);
      return this.reserva.decidir(ctx);
    }
  }

  async perguntar(ctx) {
    const pedido = {
      model: this.modelo,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: this.esforco, format: { type: 'json_schema', schema: ESQUEMA_ACAO } },
      system: [{ type: 'text', text: promptDoAgente(ctx), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: situacaoAtual(ctx) }],
    };

    let resposta;
    if (this.usarFallbacks) {
      try {
        // Se um classificador de segurança recusar o pedido, a API tenta outro modelo automaticamente.
        resposta = await this.cliente.beta.messages.create({ ...pedido, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
      } catch (erro) {
        if (!(erro instanceof Anthropic.BadRequestError)) throw erro;
        this.usarFallbacks = false; // conta ou plataforma sem suporte: segue sem fallback
        resposta = await this.cliente.messages.create(pedido);
      }
    } else {
      resposta = await this.cliente.messages.create(pedido);
    }

    if (resposta.stop_reason === 'refusal') throw new Error('pedido recusado pelo modelo');
    if (resposta.stop_reason === 'max_tokens') throw new Error('resposta cortada (max_tokens)');
    const texto = resposta.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    return JSON.parse(texto);
  }
}

function promptDoAgente(ctx) {
  const { empresa, agente, setor, setores, colegas } = ctx;
  return `Você é ${agente.nome}, ${agente.cargo} no setor ${setor.nome} da empresa "${empresa.nome}".
${empresa.descricao}
Objetivo do trimestre: ${empresa.objetivo_do_trimestre}

Missão do seu setor: ${setor.missao}
Seu jeito: ${agente.perfil}

Você trabalha em um escritório de agentes de IA. Todos se comunicam por uma caixa de comunicação compartilhada, e o CEO (uma pessoa) lê tudo e aprova ideias. Vocês têm autonomia para conversar entre setores, pedir dados, cobrar uns aos outros e propor ideias para a empresa melhorar.

Setores:
${setores.map((s) => `- ${s.id}: ${s.nome} — ${s.missao}`).join('\n')}

Colegas (id — nome, cargo, setor):
${colegas.map((c) => `- ${c.id} — ${c.nome}, ${c.cargo}, ${c.setor}`).join('\n')}

A cada rodada você escolhe UMA ação:
- "mensagem": fala com um colega (id), um setor (id), "todos" ou "ceo".
- "ideia": propõe uma ideia concreta para a empresa (título + descrição com o que fazer e quais setores participam).
- "votar": apoia ou questiona uma ideia em discussão, com um comentário do ponto de vista do seu setor.

Regras:
- Escreva em português do Brasil, curto e natural, como numa conversa de trabalho (no máximo 3 frases).
- Se alguém falou com você, responda essa pessoa primeiro.
- Traga fatos e números plausíveis do seu setor. Não repita o que já foi dito na caixa.
- Não vote em ideia sua nem em ideia que você já votou. Proponha ideia nova só quando tiver algo realmente diferente.`;
}

function situacaoAtual(ctx) {
  const linhas = ctx.mensagensRecentes.map((m) => {
    const extra = m.ideiaId ? ` [ideia ${m.ideiaId}]` : '';
    return `- ${ctx.nomeDe(m.de)} → ${ctx.nomeDe(m.para)} (${m.tipo})${extra}: ${m.texto}`;
  });
  const ideias = ctx.ideias.map(
    (i) => `- ${i.id} | "${i.titulo}" de ${ctx.nomeDe(i.autor)} | ${i.status} | apoios: ${i.apoios.map(ctx.nomeDe).join(', ')} | comentários: ${i.comentarios.length}`,
  );
  const pendente = ctx.pendencia
    ? `\nFalaram com você e esperam resposta:\n${ctx.nomeDe(ctx.pendencia.de)} (${ctx.pendencia.tipo}${ctx.pendencia.ideiaId ? `, ideia ${ctx.pendencia.ideiaId}` : ''}): ${ctx.pendencia.texto}\n`
    : '';
  return `Caixa de comunicação (mais recentes por último):
${linhas.join('\n') || '(vazia — o dia está começando)'}

Mural de ideias:
${ideias.join('\n') || '(nenhuma ideia ainda)'}
${pendente}
Você estava: ${ctx.agente.atividade}.
Qual é a sua próxima ação?`;
}
