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

- **Data, local, preço, WhatsApp, Instagram, palestrantes:** `src/data/event.js`.
  Quando houver data, preencha `date` (ex.: `"2027-03-14T08:00:00-03:00"`) e o contador aparece no topo.
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
