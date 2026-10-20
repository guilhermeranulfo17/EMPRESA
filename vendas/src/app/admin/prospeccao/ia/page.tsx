import type { Metadata } from 'next';
import { TestarIa } from '@/components/testar-ia';
import { exigirGui } from '@/server/guard';
import { chaveConfigurada, configIa, VARIAVEL_CHAVE } from '@/server/ia/config';
import { carregarPrompt } from '@/server/ia/copiloto';

export const metadata: Metadata = { title: 'Testar IA' };
export const dynamic = 'force-dynamic';
// a IA pode levar mais de um minuto para responder
export const maxDuration = 120;

const NOME_PROVEDOR = {
  gemini: 'Gemini (Google)',
  claude: 'Claude (Anthropic)',
  simulado: 'Simulado (testes)',
};

export default async function PaginaIa() {
  await exigirGui();
  const { provedor, modelo } = configIa();
  const temChave = chaveConfigurada(provedor);
  const variavel = VARIAVEL_CHAVE[provedor];
  const prompt = await carregarPrompt().catch(() => null);
  return (
    <div className="flex flex-col gap-5">
      <section className="bg-card rounded-card border p-4" data-testid="config-ia">
        <h2 className="text-2xl font-bold tracking-tight">Testar IA</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Cole uma conversa de teste e veja o que a IA devolve, com a sua base de conhecimento. Nada
          é gravado.
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Provedor</dt>
            <dd className="font-semibold">{NOME_PROVEDOR[provedor]}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Modelo</dt>
            <dd className="font-semibold">{modelo}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Prompt</dt>
            <dd className="font-semibold">
              {prompt ? `copiloto.${prompt.versao}.md` : 'Arquivo do prompt não encontrado'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Chave</dt>
            <dd className={temChave ? 'text-sucesso font-semibold' : 'text-erro font-semibold'}>
              {variavel === null ? 'Não precisa' : temChave ? 'Configurada' : `Falta ${variavel}`}
            </dd>
          </div>
        </dl>
      </section>
      <TestarIa />
    </div>
  );
}
