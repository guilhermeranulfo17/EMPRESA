// Outside School: tudo o que muda de turma para turma fica aqui.
// Conteúdo das aulas tirado das apostilas e slides da pasta "OUTSIDE SCHOOL - MATERIAIS" no Drive.

export const SCHOOL = {
  name: "Outside School",
  lema: "Despertar · Capacitar · Enviar",
  assinatura: "Presença que nos envia",
  preco: "R$ 99,00",
  precoObs: "valor único da formação completa",
  semanas: 4,
  encontros: 8,
  minutos: 90,
  horasAoVivo: 12,
  formato: "On-line e ao vivo",
  turma: "Turma Uberlândia", // nome da turma aberta
  turmaInfo: "Inscrições abertas", // ex.: "Terças e quintas, 20h" quando estiver definido
  whatsapp: "5534997066338",
  instagram: "outsideglobal.io",
  instagramUrl: "https://instagram.com/outsideglobal.io",
};

// O que a pessoa sai sabendo fazer (página antiga da escola)
export const OBJETIVOS = [
  ["Sair da passividade", "Reconhecer seu chamado e responder com passos simples de obediência."],
  ["Anunciar com clareza", "Compreender o evangelho e comunicá-lo sem pressão, confusão ou fórmulas."],
  ["Cooperar com o Espírito", "Crescer em intimidade, discernimento e maturidade no uso dos dons."],
  ["Evangelizar em equipe", "Praticar abordagem, oração, segurança e acompanhamento de pessoas."],
];

// Grade: 4 semanas, 2 encontros por semana
export const SEMANAS = [
  { n: 1, tema: "Presença", resumo: "Antes de fazer algo para Jesus, permanecer nele." },
  { n: 2, tema: "Mensagem", resumo: "O que anunciamos e como abrimos uma conversa." },
  { n: 3, tema: "Poder com cuidado", resumo: "Dons do Espírito com Bíblia, amor e humildade." },
  { n: 4, tema: "Movimento", resumo: "A rua, o primeiro sim e o discipulado." },
];

export const AULAS = [
  {
    n: 1,
    semana: 1,
    titulo: "O Lugar Secreto",
    frase: "Antes de fazer algo para Jesus, aprenda a permanecer nele.",
    ideia: "O ministério público nunca pode substituir a vida secreta com Jesus. Permanecemos nele; o fruto é consequência.",
    pontos: [
      "Presença antes de performance",
      "Identidade antes de atividade",
      "Evangelho antes de método",
      "Amor antes de dons",
    ],
    textos: "João 15:1–11 · Marcos 3:13–15 · Lucas 10:38–42 · Salmos 27:4; 63:1–8",
  },
  {
    n: 2,
    semana: 1,
    titulo: "Identidade, Chamado e Poder",
    frase: "Evangelizamos a partir de quem somos e de quem habita em nós.",
    ideia: "Nossa missão não constrói nossa identidade. Nossa identidade em Cristo sustenta nossa missão.",
    pontos: [
      "Identidade: quem sou em Cristo",
      "Chamado: para que fui enviado",
      "Poder: de quem dependo para obedecer",
      "Testemunho alegre, não para provar valor",
    ],
    textos: "",
  },
  {
    n: 3,
    semana: 2,
    titulo: "O Evangelho de Jesus Cristo",
    frase: "Clareza para anunciar a mensagem sem reduzir, complicar ou manipular.",
    ideia: "O evangelho é a boa notícia do que Deus fez em Jesus Cristo para reconciliar pecadores consigo, inaugurar seu Reino e formar um novo povo.",
    pontos: [
      "A história em cinco movimentos: criação, queda, cruz, ressurreição e nova vida",
      "Distinguir o evangelho de versões moralistas, terapêuticas ou de prosperidade",
      "Apresentar o evangelho em cerca de três minutos",
      "Convidar a uma resposta sem pressão nem promessa enganosa",
    ],
    textos: "1 Coríntios 15:1–8 · Romanos 1:16–17 · 2 Coríntios 5:14–21 · Marcos 1:14–15",
  },
  {
    n: 4,
    semana: 2,
    titulo: "Conversas que Abrem Corações",
    frase: "Menos discurso automático; mais escuta, perguntas e conexão real.",
    ideia: "Uma boa conversa não é aquela em que você falou tudo. É aquela em que você amou bem, discerniu o momento e foi fiel.",
    pontos: [
      "O mapa A.B.R.E.: aproxime-se, busque compreender, relacione com Jesus, entregue um próximo passo",
      "Perguntas abertas que honram a história da pessoa",
      "Seu testemunho em três minutos",
      "Responder objeções sem querer vencer a discussão",
    ],
    textos: "João 4 · Atos 8 · Colossenses 4:5–8 · 1 Pedro 3:15–16",
  },
  {
    n: 5,
    semana: 3,
    titulo: "Dons Espirituais e Evangelismo",
    frase: "Servir pessoas no poder do Espírito sem perder amor, Bíblia e humildade.",
    ideia: "Dons são expressões da graça do Espírito para edificar, servir e testemunhar, sempre debaixo da Escritura, do amor e do discernimento.",
    pontos: [
      "Dom, fruto, caráter, chamado e habilidade: cada coisa no seu lugar",
      "Cinco filtros antes de compartilhar uma impressão",
      "Linguagem humilde e consentimento",
      "Orar por cura com fé, compaixão e segurança",
    ],
    textos: "1 Coríntios 12–14 · Romanos 12:3–8 · Atos 1:8",
  },
  {
    n: 6,
    semana: 3,
    titulo: "Laboratório de Palavras de Conhecimento",
    frase: "Perceber, testar e compartilhar com fé, humildade e amor.",
    ideia: "Uma impressão pode estar certa, em parte certa ou errada. O que nunca pode variar é o amor, o consentimento e a liberdade de quem recebe.",
    pontos: [
      "Separar revelação, interpretação e aplicação",
      "O semáforo do que pode e do que não se compartilha",
      "Prática em duplas e trios, com observador e facilitador",
      "Ouvir “não fez sentido” sem insistir",
    ],
    textos: "1 Coríntios 12:7–11 · 1 Tessalonicenses 5:19–22 · Romanos 12:3–6",
  },
  {
    n: 7,
    semana: 4,
    titulo: "Evangelismo na Prática",
    frase: "Tudo o que foi treinado, agora com pessoas de verdade.",
    ideia: "A prática vai para a rua, com desconhecidos, sempre em equipe, com oração e com limites claros.",
    pontos: [
      "Abordagem simples e respeitosa",
      "Oração com consentimento",
      "Trabalho em equipe e segurança",
      "Volta, conversa sobre o que aconteceu e acompanhamento",
    ],
    textos: "",
  },
  {
    n: 8,
    semana: 4,
    titulo: "Do Primeiro Sim ao Discipulado",
    frase: "Encaminhar, acompanhar e permanecer enviado.",
    ideia: "Evangelismo que só anuncia produz decisões. Evangelismo que acompanha produz discípulos.",
    pontos: [
      "Confirmar o primeiro sim sem fabricar conversão",
      "Encaminhar para a igreja local em até 72 horas",
      "Acompanhar os primeiros 30 dias",
      "Seu plano para os próximos 90 dias",
    ],
    textos: "Mateus 28:18–20 · Atos 2:41–47 · 1 Tessalonicenses 2:7–12 · João 15:4–8",
  },
];

// Como cada encontro funciona
export const METODO = [
  ["Palavra", "Fundamento bíblico aplicado à vida e à missão."],
  ["Laboratório", "Simulações em duplas e trios, com prática supervisionada."],
  ["Feedback", "Um acerto e um ajuste, num ambiente seguro para errar e aprender."],
  ["Desafio", "Cinco dias com um passo real para viver onde você está."],
];

// O que vem junto (materiais que existem no Drive para as aulas)
export const INCLUSO = [
  "8 encontros ao vivo de 90 minutos",
  "Caderno de campo: a apostila de cada aula, para escrever e guardar",
  "Resumos das aulas em áudio e vídeo",
  "Prática supervisionada com feedback",
  "Desafio de cinco dias depois de cada encontro",
];

export const PRINCIPIOS = [
  "Intimidade antes de exposição",
  "Evangelho com clareza, nunca com pressão",
  "Dons com Bíblia, amor e discernimento",
  "Prática com consentimento e segurança",
  "Trabalho em equipe e prestação de contas",
  "Igreja local como casa e lugar de cuidado",
];

export const PROCESSO = [
  ["Candidatura", "Você conta sua história, seu momento e por que quer fazer a School."],
  ["Recomendação pastoral", "A Outside pede uma avaliação confidencial à sua liderança."],
  ["Conversa breve", "Quem for selecionado participa de uma conversa on-line."],
  ["Aprovação", "Os aprovados recebem o calendário e o acesso à matrícula."],
];

// Corpo docente (lista da página antiga da escola). photo: caminho em /public, ou vazio.
export const PROFESSORES = [
  { name: "Guilherme Ranulfo", org: "Outside", photo: "/img/guilherme.jpg" },
  { name: "Thiago Evangelista", org: "Outside", photo: "/img/thiago.jpg" },
  { name: "Pastor Marcos", org: "Comunidade pela Cruz", photo: "/img/marcos.jpg" },
  { name: "Pastor Salomão", org: "Comunidade pela Cruz", photo: "" },
  { name: "Fhelipe Eterno", org: "Movimento Destinados", photo: "" },
  { name: "Júlio César", org: "Escola Ruach", photo: "" },
];

export const DUVIDAS = [
  {
    q: "Como funcionam os encontros?",
    a: "São 8 encontros on-line e ao vivo, dois por semana, durante 4 semanas. Cada um dura 90 minutos e mistura Palavra, prática em pequenos grupos, feedback e um desafio para a semana.",
  },
  {
    q: "Quando começa a próxima turma?",
    a: "O calendário é enviado para quem é aprovado no processo seletivo. Faça sua candidatura para receber as datas.",
  },
  {
    q: "Quanto custa e quando eu pago?",
    a: "A formação completa custa R$ 99,00. Você só paga depois de ser aprovado no processo seletivo.",
  },
  {
    q: "Por que tem processo seletivo e recomendação pastoral?",
    a: "Porque a turma pratica junto e lida com pessoas de verdade. Queremos conhecer sua caminhada e caminhar junto com a sua liderança, não por cima dela. A Outside não substitui a igreja local: serve a ela.",
  },
  {
    q: "Vamos evangelizar na rua de verdade?",
    a: "Sim. A Aula 7 leva a prática para a rua, com desconhecidos, sempre em equipe e com orientação. Antes disso você treina em ambiente seguro, com feedback.",
  },
  {
    q: "Qual é a linha da escola sobre os dons espirituais?",
    a: "A Outside ensina a partir de uma perspectiva continuísta: cremos que os dons continuam disponíveis hoje. Honramos cristãos que pensam diferente e não usamos experiências para medir quem ama mais a Deus.",
  },
  {
    q: "Preciso ter experiência com evangelismo?",
    a: "Não. A escola foi pensada para quem ama Jesus mas se sente travado ou despreparado para falar dele. A sequência começa na vida com Deus e só depois vai para a prática.",
  },
];

// Os 90 minutos de um encontro, como estão na apostila da Aula 6
export const ENCONTRO_EXEMPLO = {
  aula: "Aula 6 · Laboratório de Palavras de Conhecimento",
  blocos: [
    { min: 15, nome: "Fundamento", d: "O que o texto bíblico diz, o que ele não diz e a definição que a escola usa." },
    { min: 15, nome: "Limites", d: "O que pode e o que não se compartilha, e o protocolo de segurança." },
    { min: 20, nome: "Rodada 1", d: "Em dupla: escutar, registrar e decidir, ainda sem compartilhar." },
    { min: 30, nome: "Rodada 2", d: "Em trio, com observador e ficha de avaliação." },
    { min: 10, nome: "Calibração", d: "Confiança e resultado, desafio da semana e oração final." },
  ],
};

// Desafio de cinco dias depois do encontro, como está na apostila da Aula 8
export const DESAFIO_EXEMPLO = {
  aula: "Depois da Aula 8",
  dias: [
    ["Retomar quem ficou para trás", "Lucas 15:3–7"],
    ["Encaminhar de verdade", "Atos 9:26–28"],
    ["Abrir a Bíblia com alguém", "Atos 8:30–35"],
    ["Servir sem plateia", "João 13:12–17"],
    ["Convidar um aprendiz", "2 Timóteo 2:1–2"],
  ],
};
