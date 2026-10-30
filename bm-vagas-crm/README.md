# BM Vagas CRM

CRM de prospecção B2B da unidade **Rocha & Nascimento** da BM Vagas. Feito para a rotina da Rosali e da
Marlete: abrir de manhã e saber exatamente com quem falar hoje.

> Esta etapa é **só o front-end**: sem banco e sem login. Os dados de exemplo (30 empresas no funil + 18
> encontradas pelo Rafael) são criados na primeira abertura e tudo o que for alterado fica salvo no
> navegador (localStorage). Em **Configurações → Restaurar dados de exemplo** dá para recomeçar.

## Rodando

Precisa de Node.js 20.19 ou mais novo.

```bash
cd bm-vagas-crm
npm install
npm run dev        # http://localhost:5173
npm run build      # checa os tipos e gera dist/
```

## Telas

| Tela | O que faz |
| --- | --- |
| **Hoje** | Saudação, quantos contatos o dia tem, cards ordenados (atrasados primeiro), mensagem sugerida, copiar / abrir no WhatsApp / Feito / Reagendar, rotina do dia e indicadores da semana. |
| **Funil** | Kanban com arrastar e soltar (mouse, toque e teclado), soma por coluna, dias parado (amarelo ≥ 5, vermelho ≥ 10), filtros e visão em lista. |
| **Ficha da empresa** | Painel lateral (tela cheia no celular) com etapa, responsável, valor, decisor com atalhos, serviços, dados, linha do tempo e registro rápido. Abre pela URL (`?empresa=id`), então o "voltar" do celular fecha. |
| **Empresas** | Base completa com busca, filtros, seleção múltipla (enviar ao funil / fila de disparo) e importação de CSV com mapeamento de colunas e descarte de repetidas. |
| **Assistentes** | Lívia (primeiro contato) e Rafael (busca de empresas): só interface nesta etapa, com pré-visualização da mensagem em balão de WhatsApp. |
| **Configurações** | Usuárias, nomes das etapas (e a mensagem sugerida de cada uma) e modelos de mensagem. |

## Organização do código

```
src/
  types/            Tipos do domínio: Empresa, Contato, Interacao, Etapa, Assistente…
  services/         ÚNICA camada que lê e grava dados
    contratos.ts    Interfaces que as telas usam
    local/          Implementação atual (localStorage)
    mock/dados.ts   Dados de exemplo (datas relativas ao dia de hoje)
    armazenamento.ts  O único arquivo que toca no localStorage
    index.ts        `api`: troque aqui as implementações
  store/            Estado compartilhado (CrmProvider) e estado de interface (UiProvider)
  lib/              Datas, formatação, mensagens, regras de seleção (contatos do dia, indicadores)
  components/
    ui/             Componentes no padrão shadcn/ui (Radix + Tailwind)
    common/ layout/ hoje/ funil/ ficha/ empresas/ assistentes/
  pages/            Uma tela por arquivo
  config/brand.ts   Nome da unidade e logo
```

### Plugando o Supabase depois

1. Crie `src/services/supabase/` com objetos que implementem as interfaces de `services/contratos.ts`
   (`EmpresasService`, `InteracoesService`, `AssistentesService`, `ConfiguracoesService`, `RotinaService`,
   `SessaoService`, `DadosService`).
2. Em `src/services/index.ts`, troque as importações de `./local/*` pelas novas.
3. Os tipos de `src/types` já estão no formato de tabelas: `empresas` (com o decisor embutido ou numa
   tabela `contatos`), `interacoes` (com `empresa_id`), `assistentes`, `usuarias`, `etapas` e
   `modelos_mensagem`.

Nenhuma tela importa o localStorage; elas só usam `useCrm()` (que chama `api`).

### Trocando o logo

O logo atual é texto ("BM" em bloco branco + "VAGAS" em laranja). Para usar a imagem oficial, coloque o
arquivo em `public/` e preencha `LOGO_IMAGEM` em `src/config/brand.ts`.

## Identidade visual

Tema escuro com textura de metal escovado; superfícies `#141414` / `#1C1C1C`, bordas `#262626`, cantos
de 14px; laranja `#FF5A00` (hover `#FF7A2E`) só em destaques; títulos e números em **Exo 2**, texto em
**Inter**. As cores ficam como variáveis em `src/index.css`.
