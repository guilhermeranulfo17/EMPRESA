'use client';

import { useState, useTransition } from 'react';
import { entrar } from '@/server/actions/acesso';

export const classeCampo =
  'h-11 w-full min-w-0 rounded-control border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';
export const classeBotao =
  'bg-primary text-primary-foreground rounded-full min-h-11 px-5 font-semibold disabled:opacity-60';

export function FormEntrar() {
  const [pendente, iniciar] = useTransition();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = await entrar({ email, senha });
          if (r?.erro) setErro(r.erro);
        });
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        E-mail
        <input
          type="email"
          autoComplete="username"
          className={classeCampo}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Senha
        <input
          type="password"
          autoComplete="current-password"
          className={classeCampo}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </label>
      {erro && (
        <p role="alert" className="text-erro text-sm" data-testid="erro-login">
          {erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className={classeBotao}>
        {pendente ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
