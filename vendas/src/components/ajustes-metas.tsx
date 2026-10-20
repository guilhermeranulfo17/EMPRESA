'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Campo, classeCampo } from '@/components/campos';
import { BOTAO_SECUNDARIO } from '@/components/enviar-whatsapp';
import { salvarAjustes } from '@/server/actions/ajustes';

/** Meta de abordagens por dia e o dia em que a contagem das metas de venda começou. */
export function AjustesMetas({
  metaDiaria,
  inicioMetas,
}: {
  metaDiaria: number;
  inicioMetas: string;
}) {
  const router = useRouter();
  const [meta, setMeta] = useState(String(metaDiaria));
  const [inicio, setInicio] = useState(inicioMetas);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState('');
  const [salvando, iniciar] = useTransition();
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = await salvarAjustes({ metaDiaria: meta, inicioMetas: inicio });
          if (!r.ok) {
            setErros(r.campos ?? {});
            setAviso(r.erro);
            return;
          }
          setErros({});
          setAviso(r.mensagem);
          router.refresh();
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo id="meta-diaria" rotulo="Abordagens por dia" erro={erros.metaDiaria}>
          <input
            id="meta-diaria"
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            className={classeCampo}
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
          />
        </Campo>
        <Campo id="inicio-metas" rotulo="Início das metas" erro={erros.inicioMetas}>
          <input
            id="inicio-metas"
            type="date"
            className={classeCampo}
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </Campo>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={salvando} className={`${BOTAO_SECUNDARIO} min-h-11`}>
          {salvando ? 'Salvando…' : 'Salvar metas'}
        </button>
        {aviso && (
          <span role="status" className="text-muted-foreground text-sm">
            {aviso}
          </span>
        )}
      </div>
    </form>
  );
}
