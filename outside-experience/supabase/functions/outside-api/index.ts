// Servidor de inscrições do Outside Experience (lista de espera + painel /admin).
// Rotas, a partir de .../functions/v1/outside-api:
//   GET  /api/vagas                          quantos já estão na lista da edição atual (só o número)
//   POST /api/enrollments                    inscrição pública
//   POST /api/admin/login                    confere a senha
//   GET  /api/admin/editions                 lista edições
//   POST /api/admin/editions                 cria edição (e pode torná-la atual)
//   PUT  /api/admin/editions/:id/current     define a edição que recebe inscrições
//   GET  /api/admin/stats?edition=slug
//   GET  /api/admin/enrollments?edition=slug
//   POST /api/admin/checkin?edition=slug     { query: nome ou código }
//   GET  /api/admin/export-csv?edition=slug
// As rotas /admin exigem o cabeçalho x-admin-password. A senha fica no banco (admin_config, só o hash)
// ou, se ainda não houver, no segredo ADMIN_PASSWORD. 20 erros em 15 minutos bloqueiam novas tentativas.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-admin-password",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
const erro = (status: number, detail: string) => json({ detail }, status);

const PUBLIC_FIELDS = "id, name, whatsapp, age, church, is_minor, guardian_consent, ticket_code, checked_in, checked_in_at, origem, created_at";

// ---------- senha do painel ----------
async function sha256(texto: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)));
}
const iguais = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};
const hexParaBytes = (hex: string) => new Uint8Array((hex.match(/../g) ?? []).map((h) => parseInt(h, 16)));
// o Postgres devolve bytea como "\\x0a1b..."
const byteaParaBytes = (v: string) => hexParaBytes(v.replace(/^\\x/, ""));

const LIMITE_ERROS = 20;
const JANELA_MIN = 15;

async function bloqueado() {
  const desde = new Date(Date.now() - JANELA_MIN * 60_000).toISOString();
  const { count, error } = await db.from("admin_login_failures").select("at", { count: "exact", head: true }).gte("at", desde);
  return !error && (count ?? 0) >= LIMITE_ERROS;
}

async function registrarErro() {
  const { error } = await db.from("admin_login_failures").insert({});
  if (!error) await db.from("admin_login_failures").delete().lt("at", new Date(Date.now() - 86_400_000).toISOString());
}

async function senhaConfere(enviada: string) {
  if (!enviada) return false;
  const { data, error } = await db.from("admin_config").select("password_salt, password_hash").maybeSingle();
  if (!error && data) {
    const sal = byteaParaBytes(String(data.password_salt));
    const junto = new Uint8Array([...sal, ...new TextEncoder().encode(enviada)]);
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", junto));
    return iguais(hash, hexParaBytes(data.password_hash));
  }
  const esperada = Deno.env.get("ADMIN_PASSWORD");
  if (!esperada) return false;
  const [a, b] = await Promise.all([sha256(esperada), sha256(enviada)]);
  return iguais(a, b);
}

async function vagas() {
  const { data: edicao } = await db.from("editions").select("id").eq("is_current", true).maybeSingle();
  if (!edicao) return json({ inscritos: 0 });
  const { count } = await db.from("enrollments").select("id", { count: "exact", head: true }).eq("edition_id", edicao.id);
  return new Response(JSON.stringify({ inscritos: count ?? 0 }), {
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" },
  });
}

// ---------- ajudantes ----------
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "edicao"
  );
}

function limparOrigem(v: unknown) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "ref", "referrer"]) {
    const val = (v as Record<string, unknown>)[k];
    if (typeof val === "string" && val.trim()) out[k] = val.trim().slice(0, 80);
  }
  return out;
}

async function edicaoPorSlug(slug: string | null) {
  if (!slug) return null;
  const { data } = await db.from("editions").select("id, slug, name").eq("slug", slug).maybeSingle();
  return data;
}

async function inscricoesDa(editionId: string) {
  const { data, error } = await db
    .from("enrollments")
    .select(PUBLIC_FIELDS)
    .eq("edition_id", editionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function celulaCsv(v: unknown) {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita fórmula ao abrir no Excel
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ---------- rotas ----------
async function criarInscricao(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return erro(400, "Dados inválidos.");
  }
  const name = texto(body.name, 120);
  const whatsapp = texto(body.whatsapp, 20);
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  const age = Number(body.age);
  const church = texto(body.church, 120);
  const isMinor = Number.isFinite(age) && age < 18;
  const consent = body.guardian_consent === true;

  if (name.length < 2) return erro(422, "Informe seu nome.");
  if (!/^[0-9]{10,11}$/.test(whatsappDigits)) return erro(422, "Informe um WhatsApp com DDD.");
  if (!Number.isInteger(age) || age < 5 || age > 120) return erro(422, "Informe uma idade válida.");
  if (church.length < 2) return erro(422, "Informe sua igreja.");
  if (isMinor && !consent) return erro(422, "Menores de 18 anos precisam da autorização do responsável.");

  const { data: edicao } = await db.from("editions").select("id").eq("is_current", true).maybeSingle();
  if (!edicao) return erro(503, "As inscrições estão fechadas no momento.");

  const id = crypto.randomUUID();
  const ticket_code = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const { data, error } = await db
    .from("enrollments")
    .insert({
      id,
      edition_id: edicao.id,
      name,
      whatsapp,
      whatsapp_digits: whatsappDigits,
      age,
      church,
      is_minor: isMinor,
      guardian_consent: isMinor ? consent : false,
      ticket_code,
      origem: limparOrigem(body.origem),
    })
    .select("id, name, age, church, is_minor, ticket_code")
    .single();

  if (error) {
    if (error.code === "23505") return erro(409, "Esse WhatsApp já está na lista de espera.");
    console.error("insert enrollment", error);
    return erro(500, "Não foi possível concluir agora.");
  }
  return json(data, 201);
}

async function listarEdicoes() {
  const { data: eds, error } = await db.from("editions").select("id, slug, name, date_label, is_current, created_at").order("created_at");
  if (error) throw error;
  const { data: rows } = await db.from("enrollments").select("edition_id");
  const conta = new Map<string, number>();
  for (const r of rows ?? []) conta.set(r.edition_id, (conta.get(r.edition_id) ?? 0) + 1);
  return json((eds ?? []).map((e) => ({ ...e, total_enrollments: conta.get(e.id) ?? 0 })));
}

async function tornarAtual(id: string) {
  const { data: alvo } = await db.from("editions").select("id").eq("id", id).maybeSingle();
  if (!alvo) return erro(404, "Edição não encontrada.");
  await db.from("editions").update({ is_current: false }).eq("is_current", true);
  const { error } = await db.from("editions").update({ is_current: true }).eq("id", id);
  if (error) throw error;
  return json({ ok: true });
}

async function criarEdicao(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = texto(body.name, 80);
  const date_label = texto(body.date_label, 60) || "Em breve";
  if (!name) return erro(422, "Informe o nome da edição.");
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const { data } = await db.from("editions").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }
  const { data, error } = await db.from("editions").insert({ slug, name, date_label }).select().single();
  if (error) throw error;
  if (body.make_current !== false) await tornarAtual(data.id);
  return json({ ...data, is_current: body.make_current !== false }, 201);
}

async function estatisticas(editionId: string) {
  const lista = await inscricoesDa(editionId);
  const igrejas = new Map<string, string>();
  for (const e of lista) {
    const chave = e.church.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!igrejas.has(chave)) igrejas.set(chave, e.church);
  }
  const checked = lista.filter((e) => e.checked_in).length;
  return json({
    total_enrollments: lista.length,
    checked_in: checked,
    pending_checkin: lista.length - checked,
    minors: lista.filter((e) => e.is_minor).length,
    unique_churches: igrejas.size,
    churches_list: [...igrejas.values()].sort((a, b) => a.localeCompare(b, "pt-BR")),
  });
}

async function checkin(req: Request, editionId: string) {
  const body = await req.json().catch(() => ({}));
  const q = texto(body.query, 120);
  if (!q) return erro(422, "Informe o nome ou o código.");
  const lista = await inscricoesDa(editionId);
  const codigo = q.toUpperCase().replace(/^OE-?/, "");
  const normal = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let achados = lista.filter((e) => e.ticket_code === codigo);
  if (!achados.length) achados = lista.filter((e) => normal(e.name) === normal(q));
  if (!achados.length) achados = lista.filter((e) => normal(e.name).includes(normal(q)));
  if (!achados.length) return erro(404, "Inscrição não encontrada.");
  if (achados.length > 1) return json({ status: "multiple", matches: achados.slice(0, 10).map((e) => ({ name: e.name, ticket_code: e.ticket_code })) });

  const e = achados[0];
  if (e.checked_in) return json({ status: "already_checked_in", enrollment: e });
  const { data, error } = await db
    .from("enrollments")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", e.id)
    .select(PUBLIC_FIELDS)
    .single();
  if (error) throw error;
  return json({ status: "checked_in", enrollment: data });
}

async function exportarCsv(edicao: { id: string; slug: string }) {
  const lista = await inscricoesDa(edicao.id);
  const cab = ["Nome", "WhatsApp", "Idade", "Igreja", "Menor", "Autorização do responsável", "Check-in", "Código", "Origem", "Inscrito em"];
  const linhas = lista.map((e) =>
    [
      e.name,
      e.whatsapp,
      e.age,
      e.church,
      e.is_minor ? "sim" : "não",
      e.is_minor ? (e.guardian_consent ? "sim" : "não") : "",
      e.checked_in ? "sim" : "não",
      `OE-${e.ticket_code}`,
      Object.entries(e.origem ?? {}).map(([k, v]) => `${k}=${v}`).join(" "),
      new Date(e.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    ]
      .map(celulaCsv)
      .join(";"),
  );
  const csv = "\uFEFF" + [cab.join(";"), ...linhas].join("\r\n");
  return new Response(csv, {
    headers: {
      ...CORS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritos-${edicao.slug}.csv"`,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const url = new URL(req.url);
  const caminho = url.pathname.replace(/^.*?\/api(?=\/)/, "");

  try {
    if (req.method === "GET" && caminho === "/vagas") return await vagas();
    if (req.method === "POST" && caminho === "/enrollments") return await criarInscricao(req);

    if (caminho.startsWith("/admin/")) {
      if (await bloqueado()) return erro(429, "Muitas tentativas erradas. Tente de novo em 15 minutos.");
      if (!(await senhaConfere(req.headers.get("x-admin-password") ?? ""))) {
        await registrarErro();
        return erro(401, "Senha incorreta.");
      }
      if (req.method === "POST" && caminho === "/admin/login") return json({ ok: true });
      if (req.method === "GET" && caminho === "/admin/editions") return await listarEdicoes();
      if (req.method === "POST" && caminho === "/admin/editions") return await criarEdicao(req);
      const atual = caminho.match(/^\/admin\/editions\/([0-9a-f-]{36})\/current$/);
      if (req.method === "PUT" && atual) return await tornarAtual(atual[1]);

      const edicao = await edicaoPorSlug(url.searchParams.get("edition"));
      if (!edicao) return erro(404, "Edição não encontrada.");
      if (req.method === "GET" && caminho === "/admin/stats") return await estatisticas(edicao.id);
      if (req.method === "GET" && caminho === "/admin/enrollments") return json(await inscricoesDa(edicao.id));
      if (req.method === "POST" && caminho === "/admin/checkin") return await checkin(req, edicao.id);
      if (req.method === "GET" && caminho === "/admin/export-csv") return await exportarCsv(edicao);
    }
    return erro(404, "Rota não encontrada.");
  } catch (e) {
    console.error(caminho, e);
    return erro(500, "Erro no servidor.");
  }
});
