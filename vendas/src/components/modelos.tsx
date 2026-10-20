'use client';

import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { BOTAO_PRINCIPAL } from '@/components/enviar-whatsapp';
import {
  CHAVES_MODELO,
  DICA_MODELO,
  preencherModelo,
  ROTULO_MODELO,
  VARIAVEIS,
  type ChaveModelo,
} from '@/domain/vendas/modelos';
import { cn } from '@/lib/utils';
import { salvarModelo } from '@/server/actions/mensagens';

const EXEMPLO = {
  nome: 'Buffet Exemplo',
  cidade: 'Uberlândia',
  segmento: 'buffet_infantil',
} as const;

/** Os 5 modelos de mensagem, cada um editável e salvo à parte, com a prévia preenchida. */
export function EditorModelos({ modelos }: { modelos: Record<ChaveModelo, string> }) {
  return (
    <ul className="flex flex-col gap-4">
      {CHAVES_MODELO.map((c) => (
        <Modelo key={c} chave={c} inicial={modelos[c]} />
      ))}
    </ul>
  );
}

function Modelo({ chave, inicial }: { chave: ChaveModelo; inicial: string }) {
  const [texto, setTexto] = useState(inicial);
  const [salvo, setSalvo] = useState(inicial);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [salvando, iniciar] = useTransition();
  const mudou = texto !== salvo;
  const travessao = /[—–]/.test(texto);

  return (
    <li
      className="bg-card rounded-card flex flex-col gap-3 border p-4"
      data-testid={`modelo-${chave}`}
    >
      <div>
        <h2 className="text-lg font-bold">{ROTULO_MODELO[chave]}</h2>
        <p className="text-muted-foreground text-xs">{DICA_MODELO[chave]}</p>
      </div>
      <textarea
        rows={5}
        aria-label={ROTULO_MODELO[chave]}
        className={cn(classeCampo, 'h-auto py-2')}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setAviso(null);
        }}
      />
      <div className="flex flex-wrap gap-1.5">
        {VARIAVEIS.map((v) => (
          <button
            key={v}
            type="button"
            className="bg-muted rounded-full px-2.5 py-1 font-mono text-xs"
            onClick={() => setTexto((t) => `${t}${t.endsWith(' ') || !t ? '' : ' '}${v}`)}
          >
            {v}
          </button>
        ))}
      </div>
      {travessao && (
        <p className="text-alerta text-xs">Tem travessão no texto. Troque por vírgula ou ponto.</p>
      )}
      <details className="text-sm">
        <summary className="text-muted-foreground cursor-pointer text-xs font-semibold">
          Ver como fica
        </summary>
        <p className="bg-muted rounded-control mt-2 p-3 whitespace-pre-wrap">
          {preencherModelo(texto, EXEMPLO)}
        </p>
      </details>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!mudou || salvando}
          className={cn(BOTAO_PRINCIPAL, 'min-h-11')}
          onClick={() =>
            iniciar(async () => {
              const r = await salvarModelo(chave, texto);
              if (!r.ok) return setAviso({ ok: false, texto: r.campos?.texto ?? r.erro });
              setSalvo(texto.trim());
              setTexto(texto.trim());
              setAviso({ ok: true, texto: r.mensagem });
            })
          }
        >
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
        {aviso && (
          <span role="status" className={aviso.ok ? 'text-sucesso text-sm' : 'text-erro text-sm'}>
            {aviso.texto}
          </span>
        )}
      </div>
    </li>
  );
}
