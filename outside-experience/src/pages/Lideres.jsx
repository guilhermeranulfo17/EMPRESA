import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, MessageCircle } from "lucide-react";
import PaginaSimples from "@/components/PaginaSimples";
import { EVENT, SITE_URL, GROUP_WHATSAPP_TEXT } from "@/data/event";
import { gerarArte } from "@/lib/arte";

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

function BotaoCopiar({ texto, rotulo = "Copiar", testid }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      className="btn-ghost min-h-[44px] px-4 text-sm text-white hover:bg-white/10"
      data-testid={testid}
    >
      {ok ? <Check size={16} /> : <Copy size={16} />} {ok ? "Copiado" : rotulo}
    </button>
  );
}

export default function Lideres() {
  const [igreja, setIgreja] = useState("");
  const [artes, setArtes] = useState({ story: "", feed: "" });
  const ref = slug(igreja);
  const link = ref ? `${SITE_URL}/?ref=${ref}` : SITE_URL;

  const textos = useMemo(
    () => [
      {
        titulo: "Para o grupo da igreja",
        texto: `Galera, em ${EVENT.dateLabel.toLowerCase()} vai rolar o Outside Experience em ${EVENT.cityShort}: um dia de adoração, palavra e preparo que termina na rua, falando de Jesus com quem passa. São só ${EVENT.capacity} vagas. Quem quiser ir com a gente, entra na lista por aqui: ${link}`,
      },
      {
        titulo: "Para o aviso no culto",
        texto: `Quem aqui ama Jesus mas trava na hora de falar dEle? Em ${EVENT.dateLabel.toLowerCase()} acontece o Outside Experience: um dia inteiro para aprender e sair em equipe para evangelizar na rua. Não precisa ter experiência, precisa estar disponível. A lista de espera está no link: ${link}`,
      },
    ],
    [link],
  );

  useEffect(() => {
    let vivo = true;
    const t = setTimeout(async () => {
      try {
        const [story, feed] = await Promise.all([gerarArte("story", igreja.trim()), gerarArte("feed", igreja.trim())]);
        if (vivo) setArtes({ story, feed });
      } catch (_) {
        /* sem arte: o resto da página continua útil */
      }
    }, 350);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [igreja]);

  return (
    <PaginaSimples titulo="Para pastores e líderes">
      <section className="wrap py-14 sm:py-20">
        <p className="label text-brand">Pastores e líderes</p>
        <h1 className="display mt-3 max-w-3xl text-[clamp(3rem,8vw,6rem)]">Leve seu grupo para a rua</h1>
        <p className="mt-5 max-w-xl text-lg text-white/80">
          Tudo o que você precisa para divulgar o Outside Experience na sua igreja. Com o link da sua igreja, a gente sabe quem veio com você.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="display text-3xl">1. O link da sua igreja</h2>
            <label htmlFor="igreja" className="mt-5 block text-white/70">
              Nome da igreja ou do grupo
            </label>
            <input
              id="igreja"
              value={igreja}
              onChange={(e) => setIgreja(e.target.value.slice(0, 60))}
              placeholder="Ex.: Comunidade pela Cruz"
              className="mt-2 w-full border-b-2 border-white/25 bg-transparent py-3 text-2xl outline-none placeholder:text-white/30 focus:border-brand"
              data-testid="lideres-igreja"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3 bg-ink-3 p-4">
              <code className="min-w-0 flex-1 break-all text-[15px] text-white/90" data-testid="lideres-link">{link}</code>
              <BotaoCopiar texto={link} rotulo="Copiar link" testid="lideres-copiar-link" />
            </div>

            <h2 className="display mt-14 text-3xl">2. Textos prontos</h2>
            <div className="mt-5 space-y-5">
              {textos.map((t) => (
                <div key={t.titulo} className="border border-white/10 p-5">
                  <p className="font-semibold">{t.titulo}</p>
                  <p className="mt-2 text-white/75">{t.texto}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <BotaoCopiar texto={t.texto} />
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(t.texto)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost min-h-[44px] px-4 text-sm text-white hover:bg-white/10"
                    >
                      <MessageCircle size={16} /> Mandar no WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="display text-3xl">3. Artes para postar</h2>
            <p className="mt-2 text-white/70">Se você preencher o nome da igreja, ele aparece na arte.</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["story", "Story", "aspect-[9/16]"],
                ["feed", "Feed", "aspect-[4/5]"],
              ].map(([k, nome, prop]) => (
                <figure key={k}>
                  {artes[k] ? (
                    <img src={artes[k]} alt={`Arte para ${nome}`} className={`${prop} w-full object-cover`} />
                  ) : (
                    <div className={`${prop} w-full animate-pulse bg-ink-3`} />
                  )}
                  <a
                    href={artes[k] || undefined}
                    download={`outside-experience-${k}${ref ? `-${ref}` : ""}.png`}
                    className={`btn-ghost mt-3 min-h-[44px] w-full text-sm text-white hover:bg-white/10 ${artes[k] ? "" : "pointer-events-none opacity-40"}`}
                    data-testid={`lideres-baixar-${k}`}
                  >
                    <Download size={16} /> Baixar {nome.toLowerCase()}
                  </a>
                </figure>
              ))}
            </div>

            <div className="mt-12 bg-brand p-6 text-ink">
              <p className="display text-3xl">Vai levar um grupo grande?</p>
              <p className="mt-2">Avise a equipe para a gente se organizar com vocês.</p>
              <a
                href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(GROUP_WHATSAPP_TEXT + (igreja ? ` (${igreja.trim()})` : ""))}`}
                target="_blank"
                rel="noreferrer"
                className="btn mt-5 w-full bg-ink text-white hover:bg-ink-3"
              >
                Falar com a equipe
              </a>
            </div>
          </div>
        </div>
      </section>
    </PaginaSimples>
  );
}
