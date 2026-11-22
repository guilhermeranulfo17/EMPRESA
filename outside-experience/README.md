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

Quase tudo fica em `src/data/event.js`. Seções sem conteúdo ficam escondidas até serem preenchidas:

| O que preencher | Campo | Onde aparece |
|---|---|---|
| Fotos/números/vídeo de edições passadas | `PROOF` (`stats`, `videoId`) | Seção "Já aconteceu", logo depois de "Não é só mais um evento" |
| Depoimentos | `TESTIMONIALS` | Seção "Testemunhos", depois dos ministrantes |
| Bio e Instagram dos ministrantes | `bio`, `instagram` em `SPEAKERS` | Abaixo de cada foto |
| Número de vagas | `capacity` | Bloco da inscrição |
| Data | `date` | Contador regressivo no topo |
| Mensagem de líderes no WhatsApp | `GROUP_WHATSAPP_TEXT` | Botão "Quero levar meu grupo" |

### Publicar

- Defina `VITE_SITE_URL` com o endereço final do site: sem ele, o WhatsApp não mostra a imagem de prévia (`public/og.jpg`).
- Links com `?utm_source=...` ou `?ref=nome-da-igreja` (ex.: `?ref=pela-cruz`) guardam de onde a pessoa veio
  e mandam isso junto com a inscrição, no campo `origem`. O servidor de inscrições precisa salvar esse campo.

### Outros ajustes

- **Data:** formato `"2027-03-14T08:00:00-03:00"`.
- **Textos de cada seção:** um arquivo por seção em `src/components/` (Hero, Program, Faq...).
- **Fotos:** `public/img/` (hero e palestrantes). As fotos de "mãos em oração" e "jovens orando" vêm do Pexels.
- **Música do topo:** `youtubeId` em `src/data/event.js`.

## Inscrições (lista de espera) e painel /admin

O formulário e o painel `/admin` falam com um servidor de inscrições na rota `/api`
(`POST /api/enrollments`, `PUT /api/enrollments/:id/ticket-code`, `/api/admin/...`).
Esse servidor **não está neste repositório**: era o backend do Emergent.

- Defina `VITE_BACKEND_URL` (veja `.env.example`) com o endereço desse servidor.
- Sem servidor, o site abre normalmente, mas o último passo do formulário mostra
  "Não foi possível concluir agora".
