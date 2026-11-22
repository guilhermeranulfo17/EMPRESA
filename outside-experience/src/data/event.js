export const EVENT = {
  brand: "OUTSIDE",
  name: "Outside Experience",
  date: null,
  dateLabel: "EM BREVE",
  city: "Uberlândia – MG",
  cityShort: "Uberlândia",
  venue: "Comunidade Apostólica pela Cruz",
  address: "Rua Orozimbo Francisco Fernandes, 145",
  price: null,
  capacity: 30, // mostra "30 vagas" na inscrição
  email: "contato@outsideglobal.com.br",
  instagram: "outsideglobal.io",
  instagramUrl: "https://instagram.com/outsideglobal.io",
  whatsapp: "5534997066338",
  whatsappLabel: "(34) 99706-6338",
  schoolUrl: "https://outside-school.acessorianeura.chatgpt.site/",
  youtubeId: "TXuuAPqvXgo",
};

export const LOGO = "/outside-logo.png";

export const IMAGES = {
  hero: "/img/hero.jpg",
  hands: "https://images.pexels.com/photos/17010855/pexels-photo-17010855.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  prayer: "https://images.pexels.com/photos/18279962/pexels-photo-18279962.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
};

// bio: uma frase sobre a pessoa; instagram: só o @, sem o "@" (aparecem quando preenchidos)
export const SPEAKERS = [
  { name: "Guilherme Ranulfo", role: "Outside", photo: "/img/guilherme.jpg", bio: "", instagram: "gui.ranulfo" },
  { name: "Pastor Marcos", role: "Comunidade pela Cruz", photo: "/img/marcos.jpg", bio: "", instagram: "marcospelacruz" },
  { name: "Thiago Evangelista", role: "Outside", photo: "/img/thiago.jpg", bio: "", instagram: "thiagoevangelistapersonal" },
];

// Depoimentos de quem já viveu o Experience: { text: "...", name: "Nome, 22 anos" }
export const TESTIMONIALS = [];

// Prova de que já aconteceu. A seção só aparece com pelo menos um número ou o vídeo.
// stats: [{ value: "120", label: "pessoas" }, ...]   videoId: id do vídeo no YouTube
// instagramUrl: link de um post/reels com o registro da edição (ou o perfil)
export const PROOF = {
  edition: "1ª edição",
  stats: [
    { value: "30", label: "participantes" },
    { value: "10", label: "conversões" },
  ],
  note: "No apelo da 1ª edição, 10 pessoas receberam Jesus como único e suficiente Salvador.",
  videoId: "",
  instagramUrl: "https://instagram.com/outsideglobal.io",
};

// Mensagem que pastores e líderes mandam no WhatsApp para levar um grupo
export const GROUP_WHATSAPP_TEXT =
  "Olá! Sou líder e quero levar um grupo da minha igreja para o Outside Experience.";

export const ENROLL_LINK = `${window.location.origin}/#inscricao`;
