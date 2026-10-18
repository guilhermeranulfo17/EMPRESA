'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState, useTransition } from 'react';
import { entrar } from '@/server/actions/acesso';

export const classeCampo =
  'h-11 w-full min-w-0 rounded-control border border-input bg-card px-3 text-base outline-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15';
export const classeBotao =
  'bg-primary text-primary-foreground rounded-control min-h-11 px-5 font-semibold disabled:opacity-60';

export function FormEntrar() {
  const [pendente, iniciar] = useTransition();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  return (
    <form
      className="flex flex-col gap-5"
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
          placeholder="voce@email.com"
          className={classeCampo}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <div className="flex flex-col gap-1.5 text-sm font-medium">
        <label htmlFor="senha">Senha</label>
        <div className="relative">
          <input
            id="senha"
            type={verSenha ? 'text' : 'password'}
            autoComplete="current-password"
            className={`${classeCampo} pr-11`}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setVerSenha((v) => !v)}
            aria-label={verSenha ? 'Esconder o que digitei' : 'Mostrar o que digitei'}
            aria-pressed={verSenha}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 grid w-11 place-items-center"
          >
            {verSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {erro && (
        <p role="alert" className="text-erro text-sm" data-testid="erro-login">
          {erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className={`${classeBotao} mt-1`}>
        {pendente ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
