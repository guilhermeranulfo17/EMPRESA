'use client';

import { Copy, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ChaveModelo } from '@/domain/vendas/modelos';
import { cn } from '@/lib/utils';
import { registrarEnvio } from '@/server/actions/mensagens';

export const BOTAO_PRINCIPAL =
  'bg-primary text-primary-foreground rounded-control inline-flex min-h-12 items-center justify-center gap-2 px-5 font-semibold disabled:opacity-60';
export const BOTAO_SECUNDARIO =
  'rounded-control inline-flex min-h-12 items-center justify-center gap-2 border px-4 font-semibold disabled:opacity-60';

/** Link wa.me com o texto pronto (o link salvo no lead já é só de celular). */
export function linkComTexto(whatsapp: string, texto: string): string {
  return `${whatsapp}?text=${encodeURIComponent(texto)}`;
}

/**
 * "Abrir no WhatsApp": abre o wa.me com a mensagem pronta e, no mesmo toque, registra o envio
 * (etapa e próximo follow-up). Telefone fixo não tem WhatsApp: copia o texto e marca como enviada.
 */
export function EnviarWhatsApp({
  leadId,
  chave,
  texto,
  whatsapp,
  className,
  rotulo = 'Abrir no WhatsApp',
  aoRegistrar,
}: {
  leadId: string;
  chave: ChaveModelo;
  texto: string;
  whatsapp: string | null;
  className?: string;
  rotulo?: string;
  aoRegistrar?: () => void;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState<'pronto' | 'feito' | 'erro'>('pronto');
  const [erro, setErro] = useState('');
  const [salvando, iniciar] = useTransition();
  const vazio = !texto.trim();

  function registrar() {
    setErro('');
    iniciar(async () => {
      const r = await registrarEnvio(leadId, chave, texto);
      if (!r.ok) {
        setEstado('erro');
        setErro(r.erro);
        return;
      }
      setEstado('feito');
      aoRegistrar?.();
      router.refresh();
    });
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {whatsapp ? (
        <a
          href={vazio ? undefined : linkComTexto(whatsapp, texto.trim())}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={vazio || salvando || undefined}
          data-testid="abrir-whatsapp"
          className={cn(BOTAO_PRINCIPAL, (vazio || salvando) && 'pointer-events-none opacity-60')}
          // o registro sai no mesmo toque; a aba nova abre o WhatsApp
          onClick={() => {
            if (!vazio && estado !== 'feito') registrar();
          }}
        >
          <MessageCircle className="size-5" aria-hidden />
          {estado === 'feito' ? 'Registrado. Abrir de novo' : rotulo}
        </a>
      ) : (
        <button
          type="button"
          disabled={vazio || salvando || estado === 'feito'}
          className={BOTAO_SECUNDARIO}
          data-testid="copiar-enviada"
          onClick={async () => {
            await navigator.clipboard?.writeText(texto.trim()).catch(() => {});
            registrar();
          }}
        >
          <Copy className="size-5" aria-hidden />
          {estado === 'feito' ? 'Marcada como enviada' : 'Fixo: copiar e marcar enviada'}
        </button>
      )}
      {estado === 'erro' && (
        <p
          role="alert"
          className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm"
        >
          {erro} {whatsapp && 'O WhatsApp abriu, mas o envio não ficou registrado. '}
          <button type="button" className="font-semibold underline" onClick={registrar}>
            Registrar de novo
          </button>
        </p>
      )}
    </div>
  );
}
