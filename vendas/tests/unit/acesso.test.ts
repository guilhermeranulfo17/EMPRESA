import { describe, expect, it } from 'vitest';
import { emailPermitido, listaDeEmails } from '@/domain/acesso';

describe('acesso ao Vendas Orkestra', () => {
  it('lê a lista sem espaços nem maiúsculas e ignora itens sem @', () => {
    expect(listaDeEmails(' Gui@Orkestra.com , ,x, outro@a.b ')).toEqual([
      'gui@orkestra.com',
      'outro@a.b',
    ]);
  });

  it('só quem está na lista entra; lista vazia não deixa ninguém', () => {
    const lista = listaDeEmails('gui@orkestra.com');
    expect(emailPermitido('GUI@orkestra.com', lista)).toBe(true);
    expect(emailPermitido('outro@orkestra.com', lista)).toBe(false);
    expect(emailPermitido(null, lista)).toBe(false);
    expect(emailPermitido('gui@orkestra.com', listaDeEmails(undefined))).toBe(false);
  });
});
