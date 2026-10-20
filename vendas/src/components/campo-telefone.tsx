'use client';

import { classeCampo } from '@/components/campos';
import { mascaraTelefoneBR } from '@/domain/mascara';
import { formatPhoneBR } from '@/domain/phone';

/* Fora de campos.tsx para a biblioteca de telefone só ir para as telas com formulário de lead. */

/** Telefone com máscara BR; mostra um E.164 salvo já formatado (o servidor converte de volta). */
export function CampoTelefone({
  id,
  valor,
  onChange,
  invalido,
}: {
  id: string;
  valor: string;
  onChange: (texto: string) => void;
  invalido?: boolean;
}) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="(34) 99135-5450"
      aria-invalid={invalido || undefined}
      className={classeCampo}
      value={valor.startsWith('+55') ? formatPhoneBR(valor) : valor}
      onChange={(e) => onChange(mascaraTelefoneBR(e.target.value))}
    />
  );
}
