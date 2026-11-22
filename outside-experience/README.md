# Outside Experience — site do evento

Cópia fiel da landing page do Outside Experience (antes hospedada no preview do Emergent),
reconstruída com os componentes originais em React + Vite + Tailwind.

## Rodar

```bash
cd outside-experience
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera a pasta dist/ pronta para publicar (Vercel, Netlify etc.)
```

## Onde mudar as coisas

Quase tudo fica em `src/data/event.js`:

| O que | Campo |
|---|---|
| Data e local da próxima edição | `dateLabel`, `date` (liga o contador), `venue`, `address` |
| Vagas (barra de vagas restantes) | `capacity` |
| Link do grupo de preparação (aparece no ingresso) | `whatsappGroup` |
| Salvações e texto da edição anterior | `PROOF` |
| Fotos da galeria (pasta `public/img/edicao-1/`) | `PHOTOS` e `GALLERY` |
| Ministrantes (foto, bio, Instagram) | `SPEAKERS` |
| Depoimentos (a seção aparece quando houver algum) | `TESTIMONIALS` |
| Pixel do Meta e Google Analytics (desligados enquanto vazios) | `TRACKING` |

Visual: cores e fontes em `tailwind.config.js` e `src/index.css` (preto quente, papel cru, laranja da marca;
títulos em Anton, falas e versículos em Instrument Serif, texto em Archivo).

## Páginas

- `/` site do evento
- `/lideres` material para pastores e líderes: link com o nome da igreja (`?ref=`), artes para story e feed geradas na hora, textos prontos
- `/responsaveis` informações para pais de participantes menores de idade
- `/admin` painel (veja abaixo)

## Convites e origem das inscrições

- Cada inscrito recebe um link pessoal (`?convite=CODIGO`); quem entra por ele fica marcado como convidado dessa pessoa.
- Links de igreja (`?ref=nome-da-igreja`) e anúncios (`?utm_source=`) também ficam registrados.
- No painel, o dashboard mostra "Quem mais convidou", "Links de igrejas" e "Anúncios e outros sites".

## Inscrições (lista de espera) e painel /admin

As inscrições ficam no Supabase, no projeto **outside** (`bowffbnelsjurbhmgxlg`, região São Paulo):

- **Banco:** `supabase/migrations/` (tabelas `editions` e `enrollments`, com RLS ligado e sem acesso público).
- **Servidor:** função `outside-api` em `supabase/functions/outside-api/index.ts`. O site já aponta para ela
  (`src/lib/api.js`); para usar outro servidor, defina `VITE_BACKEND_URL`.
- **Painel:** abra `/admin` no site. A senha é o segredo `ADMIN_PASSWORD` da função
  (Supabase → Edge Functions → Secrets). No painel dá para ver inscritos, fazer check-in no dia,
  baixar planilha (CSV) e abrir uma nova edição.
- Cada WhatsApp entra uma vez por edição. Menores de 18 anos só entram com a autorização do responsável marcada.
- **Check-in:** aba Check-in → "Ler QR code do ingresso" abre a câmera do celular; também dá para buscar por nome ou código.
- **Equipes:** aba Equipes divide os inscritos (ou só quem fez check-in) misturando igrejas e espalhando os menores; tem botão de imprimir.
- **Senha:** fica no banco só como hash (`select public.set_admin_password('nova-senha');` no SQL Editor, depois de aplicar
  `supabase/migrations/20261122190000_senha_admin.sql`). 20 senhas erradas em 15 minutos bloqueiam novas tentativas.
