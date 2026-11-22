// Pixel do Meta e Google Analytics. Ficam desligados enquanto os IDs em TRACKING estiverem vazios.
import { TRACKING } from "@/data/event";

let iniciado = false;

export function iniciarRastreio() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  const { metaPixelId, googleTagId } = TRACKING;

  if (metaPixelId) {
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
  }

  if (googleTagId) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTagId)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", googleTagId);
  }
}

// Evento de conversão: "Lead" quando alguém entra na lista.
export function rastrear(evento) {
  try {
    window.fbq?.("track", evento);
    window.gtag?.("event", evento === "Lead" ? "generate_lead" : evento);
  } catch (_) {
    /* medição nunca pode quebrar a inscrição */
  }
}
