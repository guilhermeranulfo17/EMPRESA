// Tudo o que muda de edição para edição fica aqui.

export const EVENT = {
  brand: "OUTSIDE",
  name: "Outside Experience",
  edition: "2ª edição",
  date: null, // data exata (ex.: "2027-01-23T08:00:00-03:00"): liga o contador e o "adicionar ao calendário"
  dateLabel: "Janeiro de 2027",
  dateShort: "Jan 2027",
  city: "Uberlândia – MG",
  cityShort: "Uberlândia",
  venue: null, // nome do local quando estiver definido
  address: null, // endereço completo quando estiver definido (liga o mapa e o "como chegar")
  venueLabel: "Local em breve",
  price: null,
  capacity: 30,
  email: "contato@outsideglobal.com.br",
  instagram: "outsideglobal.io",
  instagramUrl: "https://instagram.com/outsideglobal.io",
  whatsapp: "5534991355450",
  whatsappLabel: "(34) 99135-5450",
  whatsappGroup: "https://chat.whatsapp.com/LHGEeL8R8CtKducev5C8OO",
  schoolUrl: "/school",
  youtubeId: "TXuuAPqvXgo",
};

// Medição de anúncios: preencha os IDs para ligar (ficam desligados enquanto vazios)
export const TRACKING = {
  metaPixelId: "",
  googleTagId: "", // ex.: "G-XXXXXXX"
};

export const LOGO = "/outside-logo.png";

export const IMAGES = {
  hero: "/img/hero.jpg",
};

// Fotos reais da 1ª edição (Instagram @outsideglobal.io)
export const PHOTOS = {
  oracaoBanco: { src: "/img/edicao-1/oracao-banco.jpg", alt: "Equipe orando por um rapaz sentado num banco da praça, à noite" },
  oracaoRua: { src: "/img/edicao-1/oracao-rua.jpg", alt: "Jovens de mãos dadas orando com uma pessoa na rua" },
  conversaRua: { src: "/img/edicao-1/conversa-rua.jpg", alt: "Dois homens conversando numa calçada à noite" },
  ruaNoite: { src: "/img/edicao-1/rua-noite.jpg", alt: "Grupo reunido na rua, à noite, sob a luz de um poste" },
  camiseta: { src: "/img/edicao-1/camiseta.jpg", alt: "Costas de uma camiseta branca escrito O Brasil é do Senhor" },
  pregacao1: { src: "/img/edicao-1/pregacao-1.jpg", alt: "Pregação no palco durante a ativação" },
  pregacao2: { src: "/img/edicao-1/pregacao-2.jpg", alt: "Ministração para os participantes antes da saída" },
  pregacao3: { src: "/img/edicao-1/pregacao-3.jpg", alt: "Pregador com microfone, em frente ao púlpito" },
  pregacao4: { src: "/img/edicao-1/pregacao-4.jpg", alt: "Pregador de camiseta branca com microfone" },
  testemunho: { src: "/img/edicao-1/testemunho.jpg", alt: "Participante compartilhando o que viveu" },
};

// Galeria "Como foi a 1ª edição": rola sozinha. tipo "foto", "loop" (vídeo curto sem som) ou "video" (abre com som)
const loop = (nome, alt) => ({ tipo: "loop", src: `/video/${nome}.mp4`, poster: `/video/${nome}.jpg`, alt });
export const GALLERY = [
  { tipo: "video", src: "/video/divulgacao.mp4", poster: "/video/divulgacao.jpg", alt: "Vídeo de divulgação do Outside Experience" },
  loop("oracao-banco", "Equipe orando por um rapaz sentado num banco da praça"),
  { tipo: "foto", ...PHOTOS.pregacao4 },
  loop("maos-dadas", "Jovens de mãos dadas orando com uma pessoa na rua"),
  { tipo: "foto", ...PHOTOS.camiseta },
  loop("louvor", "Louvor com as mãos levantadas"),
  { tipo: "foto", ...PHOTOS.oracaoRua },
  loop("conversa-rua", "Conversa na rua, à noite"),
  { tipo: "foto", ...PHOTOS.pregacao2 },
  loop("adoracao", "Duas irmãs adorando"),
  { tipo: "foto", ...PHOTOS.testemunho },
];

// bio: uma frase sobre a pessoa; instagram: só o usuário, sem o "@"
export const SPEAKERS = [
  { name: "Guilherme Ranulfo", role: "Outside", photo: "/img/guilherme.jpg", bio: "", instagram: "gui.ranulfo" },
  { name: "Pastor Marcos", role: "Comunidade pela Cruz", photo: "/img/marcos.jpg", bio: "", instagram: "marcospelacruz" },
  { name: "Thiago Evangelista", role: "Outside", photo: "/img/thiago.jpg", bio: "", instagram: "thiagoevangelistapersonal" },
];

// Depoimentos de quem já viveu o Experience: { text: "...", name: "Nome, 22 anos" }
export const TESTIMONIALS = [];

// O que já aconteceu. Só salvações, como o Guilherme pediu.
export const PROOF = {
  edition: "1ª edição",
  salvations: 10,
  note: "No apelo da 1ª edição, 10 pessoas receberam Jesus como único e suficiente Salvador.",
  instagramUrl: "https://instagram.com/outsideglobal.io",
};

// Mensagem que pastores e líderes mandam no WhatsApp para levar um grupo
export const GROUP_WHATSAPP_TEXT = "Olá! Sou líder e quero levar um grupo da minha igreja para o Outside Experience.";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");
export const ENROLL_LINK = `${SITE_URL}/#inscricao`;
export const inviteLink = (code) => `${SITE_URL}/?convite=${encodeURIComponent(code)}#inscricao`;
