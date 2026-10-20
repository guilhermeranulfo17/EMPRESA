'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CampoTelefone } from '@/components/campo-telefone';
import { Campo, CampoCheck, classeCampo } from '@/components/campos';
import { BOTAO_PRINCIPAL } from '@/components/enviar-whatsapp';
import { PRIORIDADES, ROTULO_SEGMENTO, SEGMENTOS, UFS } from '@/domain/vendas/campos';
import type { LeadVendasEntrada } from '@/domain/vendas/lead';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';
import { atualizarLead, criarLead } from '@/server/actions/leads';

/** Cadastro e edição do lead. Sem `id`, cria; com `id`, salva as mudanças. */
export function FormLead({ id, inicial }: { id?: string; inicial: LeadVendasEntrada }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [lead, setLead] = useState(inicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const mudar = <K extends keyof LeadVendasEntrada>(campo: K, valor: LeadVendasEntrada[K]) =>
    setLead((l) => ({ ...l, [campo]: valor }));
  const texto = (
    campo: 'nome' | 'cidade' | 'categoria' | 'avaliacoes' | 'origem',
    rotulo: string,
    max: number,
    dica?: string,
  ) => (
    <Campo id={campo} rotulo={rotulo} erro={erros[campo]} dica={dica}>
      <input
        className={classeCampo}
        id={campo}
        value={lead[campo]}
        onChange={(e) => mudar(campo, e.target.value)}
        aria-invalid={!!erros[campo] || undefined}
        maxLength={max}
        required={campo === 'nome'}
      />
    </Campo>
  );

  return (
    <form
      className="flex flex-col gap-4"
      data-testid="form-lead"
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = id ? await atualizarLead(id, lead) : await criarLead(lead);
          if (!r.ok) {
            setErros(r.campos ?? {});
            setAviso({ ok: false, texto: r.erro });
            return;
          }
          setErros({});
          setAviso({ ok: true, texto: r.mensagem });
          if (!id) router.push(ROTAS.lead((r.dados as { id: string }).id));
          else router.refresh();
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {texto('nome', 'Nome da empresa', 120)}
        <Campo
          id="telefone"
          rotulo="Telefone"
          erro={erros.telefone}
          dica="Celular ganha o botão do WhatsApp."
        >
          <CampoTelefone
            id="telefone"
            valor={lead.telefone}
            onChange={(v) => mudar('telefone', v)}
            invalido={!!erros.telefone}
          />
        </Campo>
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          {texto('cidade', 'Cidade', 120)}
          <Campo id="uf" rotulo="UF" erro={erros.uf}>
            <select
              id="uf"
              className={classeCampo}
              value={lead.uf}
              onChange={(e) => mudar('uf', e.target.value)}
            >
              <option value="">-</option>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo id="segmento" rotulo="Segmento" erro={erros.segmento}>
            <select
              id="segmento"
              className={classeCampo}
              value={lead.segmento}
              onChange={(e) => mudar('segmento', e.target.value as LeadVendasEntrada['segmento'])}
            >
              <option value="">Sem segmento</option>
              {SEGMENTOS.map((s) => (
                <option key={s} value={s}>
                  {ROTULO_SEGMENTO[s]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo id="prioridade" rotulo="Prioridade" erro={erros.prioridade}>
            <select
              id="prioridade"
              className={classeCampo}
              value={lead.prioridade}
              onChange={(e) =>
                mudar('prioridade', e.target.value as LeadVendasEntrada['prioridade'])
              }
            >
              <option value="">Sem</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        {texto('categoria', 'Categoria no Google', 120)}
        {texto('avaliacoes', 'Avaliações no Google', 40)}
        {texto('origem', 'Origem', 80, 'Ex.: Google Maps, Instagram, indicação.')}
        <div className="grid grid-cols-2 gap-3">
          <Campo id="dataEntrada" rotulo="Entrada" erro={erros.dataEntrada}>
            <input
              id="dataEntrada"
              type="date"
              className={classeCampo}
              value={lead.dataEntrada}
              onChange={(e) => mudar('dataEntrada', e.target.value)}
            />
          </Campo>
          <Campo id="proximoFollowup" rotulo="Próximo follow-up" erro={erros.proximoFollowup}>
            <input
              id="proximoFollowup"
              type="date"
              className={classeCampo}
              value={lead.proximoFollowup}
              onChange={(e) => mudar('proximoFollowup', e.target.value)}
            />
          </Campo>
        </div>
      </div>
      <Campo id="observacoes" rotulo="Observações" erro={erros.observacoes}>
        <textarea
          className={cn(classeCampo, 'h-auto py-2')}
          id="observacoes"
          rows={3}
          value={lead.observacoes}
          onChange={(e) => mudar('observacoes', e.target.value)}
          maxLength={4000}
        />
      </Campo>
      <CampoCheck
        id="naoContatar"
        rotulo="Não contatar"
        dica="O lead pediu para parar. Some do HOJE."
        checked={lead.naoContatar}
        onChange={(e) => mudar('naoContatar', e.target.checked)}
      />
      {aviso && (
        <p
          role="status"
          data-testid="aviso-lead"
          className={aviso.ok ? 'text-sucesso text-sm' : 'text-erro text-sm'}
        >
          {aviso.texto}
        </p>
      )}
      <button type="submit" disabled={pendente} className={cn(BOTAO_PRINCIPAL, 'sm:self-start')}>
        {pendente ? 'Salvando…' : id ? 'Salvar dados' : 'Cadastrar lead'}
      </button>
    </form>
  );
}
