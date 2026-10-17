'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Campo, classeCampo } from '@/components/campos';
import {
  CAMPOS_TIPO,
  ROTULO_TIPO,
  TIPOS_CONHECIMENTO,
  type ConhecimentoEntrada,
  type ItemConhecimento,
  type TipoConhecimento,
} from '@/domain/vendas/conhecimento';
import { cn } from '@/lib/utils';
import {
  atualizarConhecimento,
  criarConhecimento,
  definirAtivo,
  excluirConhecimento,
} from '@/server/actions/conhecimento';

const BOTAO =
  'bg-primary text-primary-foreground rounded-full min-h-11 px-5 font-semibold disabled:opacity-60';
const BOTAO_SECUNDARIO =
  'rounded-control min-h-9 border px-3 text-sm font-semibold disabled:opacity-60';

/** Formulário de um item (novo ou edição). Os rótulos mudam conforme o tipo. */
function FormItem({
  inicial,
  id,
  aoTerminar,
}: {
  inicial: ConhecimentoEntrada;
  id?: string;
  aoTerminar: () => void;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [item, setItem] = useState(inicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const tipo = (TIPOS_CONHECIMENTO as readonly string[]).includes(item.tipo)
    ? (item.tipo as TipoConhecimento)
    : 'produto';
  const campos = CAMPOS_TIPO[tipo];
  const pref = id ?? 'novo';
  return (
    <form
      className="flex flex-col gap-3"
      data-testid={id ? 'form-editar-conhecimento' : 'form-conhecimento'}
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = id ? await atualizarConhecimento(id, item) : await criarConhecimento(item);
          if (!r.ok) {
            setErros(r.campos ?? { _: r.erro });
            return;
          }
          setErros({});
          if (!id) setItem({ ...inicial, tipo: item.tipo });
          router.refresh();
          aoTerminar();
        });
      }}
    >
      {!id && (
        <Campo id={`${pref}-tipo`} rotulo="Tipo" erro={erros.tipo}>
          <select
            id={`${pref}-tipo`}
            className={classeCampo}
            value={item.tipo}
            onChange={(e) => setItem({ ...item, tipo: e.target.value as TipoConhecimento })}
          >
            {TIPOS_CONHECIMENTO.map((t) => (
              <option key={t} value={t}>
                {ROTULO_TIPO[t]}
              </option>
            ))}
          </select>
        </Campo>
      )}
      <Campo id={`${pref}-titulo`} rotulo={campos.titulo} erro={erros.titulo}>
        <input
          id={`${pref}-titulo`}
          className={classeCampo}
          value={item.titulo}
          placeholder={campos.exemploTitulo}
          maxLength={160}
          onChange={(e) => setItem({ ...item, titulo: e.target.value })}
        />
      </Campo>
      <Campo id={`${pref}-conteudo`} rotulo={campos.conteudo} erro={erros.conteudo}>
        <textarea
          id={`${pref}-conteudo`}
          rows={4}
          className={`${classeCampo} h-auto py-2`}
          value={item.conteudo}
          placeholder={campos.exemploConteudo}
          maxLength={8000}
          onChange={(e) => setItem({ ...item, conteudo: e.target.value })}
        />
      </Campo>
      {erros._ && <p className="text-erro text-sm">{erros._}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pendente} className={BOTAO}>
          {pendente ? 'Salvando…' : id ? 'Salvar' : 'Adicionar'}
        </button>
        {id && (
          <button type="button" className={BOTAO_SECUNDARIO} onClick={aoTerminar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function CartaoItem({ item }: { item: ItemConhecimento }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [pendente, iniciar] = useTransition();
  const rodar = (fn: () => Promise<unknown>) =>
    iniciar(async () => {
      await fn();
      router.refresh();
    });
  const campos = CAMPOS_TIPO[item.tipo];
  return (
    <li
      className={cn('bg-card rounded-card border p-4', !item.ativo && 'opacity-60')}
      data-testid="item-conhecimento"
    >
      {editando ? (
        <FormItem
          id={item.id}
          inicial={{ tipo: item.tipo, titulo: item.titulo, conteudo: item.conteudo }}
          aoTerminar={() => setEditando(false)}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">{campos.titulo}</p>
              <p className="font-semibold">{item.titulo}</p>
            </div>
            {!item.ativo && (
              <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-semibold">
                Desativado
              </span>
            )}
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{campos.conteudo}</p>
            <p className="text-sm whitespace-pre-wrap">{item.conteudo}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" className={BOTAO_SECUNDARIO} onClick={() => setEditando(true)}>
              Editar
            </button>
            <button
              type="button"
              className={BOTAO_SECUNDARIO}
              disabled={pendente}
              onClick={() => rodar(() => definirAtivo(item.id, !item.ativo))}
            >
              {item.ativo ? 'Desativar' : 'Reativar'}
            </button>
            <button
              type="button"
              className={cn(BOTAO_SECUNDARIO, 'text-erro')}
              disabled={pendente}
              onClick={() => {
                if (
                  confirm('Excluir este item? O copiloto deixa de usar e não dá para desfazer.')
                ) {
                  rodar(() => excluirConhecimento(item.id));
                }
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function BaseConhecimento({ itens }: { itens: ItemConhecimento[] }) {
  const [filtro, setFiltro] = useState<TipoConhecimento | 'todos'>('todos');
  const visiveis = filtro === 'todos' ? itens : itens.filter((i) => i.tipo === filtro);
  const contagem = (t: TipoConhecimento) => itens.filter((i) => i.tipo === t).length;
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="bg-card rounded-card h-fit border p-4">
        <h2 className="mb-1 font-bold">Adicionar à base</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          O copiloto só afirma o que estiver aqui. O que faltar, ele diz que vai confirmar com você.
        </p>
        <FormItem inicial={{ tipo: 'produto', titulo: '', conteudo: '' }} aoTerminar={() => {}} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo">
          {(['todos', ...TIPOS_CONHECIMENTO] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filtro === t}
              onClick={() => setFiltro(t)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-semibold',
                filtro === t ? 'bg-card border-ring' : 'text-muted-foreground',
              )}
            >
              {t === 'todos' ? `Todos ${itens.length}` : `${ROTULO_TIPO[t]} ${contagem(t)}`}
            </button>
          ))}
        </div>
        {visiveis.length === 0 ? (
          <p className="text-muted-foreground rounded-card border border-dashed p-8 text-center text-sm">
            Nada aqui ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" data-testid="lista-conhecimento">
            {visiveis.map((i) => (
              <CartaoItem key={i.id} item={i} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
