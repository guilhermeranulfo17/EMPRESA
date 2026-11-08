// "Por que as pessoas compram" (IMG_5191), 69.5 s
import React from "react";
import { C, DISPLAY, UI } from "./kit";
import { Shell, Sc } from "./shell";
import { Arrow, Book, Bubble, Bulb, Cart, Clock, Crown, Heart, Label, Package, Person, Phone, Pop, Puzzle, Shield, Star, Tile, ez } from "./illu";

const SELLER = { shirt: C.accent, skin: "#8D5A3B" };
const BUYER = { shirt: "#4A6FA5", skin: "#E0B48A" };
const P2 = { shirt: "#7A5AF0", skin: "#8D5A3B" }, P3 = { shirt: "#2FA8D0", skin: "#C88A5E" };
const Motive: React.FC<{ at: number; name: string; x?: number }> = ({ at, name, x = 540 }) => <Pop at={at} x={x} y={860}><Label text={name} hot size={38} /></Pop>;
const Sparkles: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => (
  <>{t > at ? Array.from({ length: 6 }, (_, i) => { const p = ((t - at) * 0.8 + i / 6) % 1; const a = (i / 6) * Math.PI * 2; return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * (60 + p * 140), top: y + Math.sin(a) * (60 + p * 140), translate: "-50% -50%", opacity: 1 - p, scale: String(0.4 + p * 0.6) }}><Star s={40} /></div>; }) : null}</>
);

const scenes: Sc[] = [
  {
    a: 0, b: 5.27, kicker: "Motivos de compra", title: "POR QUE AS PESSOAS *COMPRAM*?", titleAt: -0.6,
    body: (t) => (
      <>
        <Pop at={-0.4} x={420} y={620}><Person {...BUYER} pose="give" w={200} hold={<Cart s={90} />} /></Pop>
        <Pop at={0.8} x={720} y={420}><Bubble think>?</Bubble></Pop>
        <Pop at={2.2} x={780} y={660}><Package s={150} /></Pop>
      </>
    ),
  },
  {
    a: 5.27, b: 12.32, kicker: "As pessoas compram", title: "PORQUE *ACREDITAM*",
    body: (t) => (
      <>
        <Pop at={5.5} x={260} y={640}><Person {...BUYER} pose="think" face={t > 9.6 ? "happy" : "neutral"} w={190} /></Pop>
        <Pop at={7.2} x={560} y={420}><Bubble think w={280}><div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>{t < 11.4 ? <Bulb s={90} /> : <Star s={100} />}</div></Bubble></Pop>
        <Pop at={9.4} x={800} y={640}><Tile size={150} label="RESOLVER A SITUAÇÃO"><Puzzle s={100} /></Tile></Pop>
        <Pop at={11.4} x={800} y={840}><Label text="CONQUISTAR UM DESEJO" hot size={28} /></Pop>
      </>
    ),
  },
  {
    a: 12.32, b: 15.83, kicker: "Os principais", title: "MOTIVOS DE *COMPRA*",
    body: () => (
      <>
        <Pop at={12.5} x={540} y={560}><div style={{ fontFamily: DISPLAY, fontSize: 360, color: C.accent, lineHeight: 1, textShadow: "0 0 80px rgba(255,214,10,0.45)" }}>5</div></Pop>
        {[<Puzzle s={60} />, <Heart s={60} />, <Shield s={56} />, <Crown s={66} />, <Clock s={60} />].map((ic, i) => <Pop key={i} at={13.0 + i * 0.15} x={220 + i * 160} y={840}><Tile size={110}>{ic}</Tile></Pop>)}
      </>
    ),
  },
  {
    a: 15.83, b: 29.6, kicker: "Mas antes", title: "COMO VENDER PRA *PESSOAS*",
    body: (t) => (
      <>
        <Pop at={16.1} x={300} y={620}><Person {...SELLER} pose={t > 20.4 && t < 23 ? "wave" : "give"} w={210} hold={t <= 20.4 || t >= 23 ? <Book s={90} label="VENDAS" /> : null} /></Pop>
        <Pop at={18.0} x={760} y={540}><div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}><Person {...BUYER} w={110} /><Person {...P2} w={120} /><Person {...P3} w={110} /></div></Pop>
        <div style={{ position: "absolute", left: 400, top: 420 }}><Arrow w={260} t={t} at={19.0} dur={0.6} curve={-60} dashed /></div>
        <Pop at={20.6} x={300} y={340}><Label text="GUILHERME" hot size={32} /></Pop>
        <Pop at={28.4} x={760} y={820}><div style={{ padding: "16px 32px", borderRadius: 18, background: "#4D8DF0", fontFamily: UI, fontWeight: 900, fontSize: 36, color: "#FFF", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>+ SEGUIR</div></Pop>
      </>
    ),
  },
  {
    a: 29.6, b: 34.57, kicker: "Primeiro", title: "*NECESSIDADE*",
    body: (t) => {
      const fit = ez(t, 32.4, 33.2);
      return (
        <>
          <Pop at={29.8} x={300} y={600}><Person {...BUYER} pose="think" face={fit > 0.9 ? "happy" : "sad"} w={190} /></Pop>
          <Pop at={30.4} x={720} y={560}><div style={{ position: "relative", width: 260, height: 260, borderRadius: 40, background: "rgba(255,255,255,0.08)", border: "4px dashed rgba(255,255,255,0.3)" }}>
            <div style={{ position: "absolute", left: 70, top: 70 - (1 - fit) * 260, rotate: `${(1 - fit) * 50}deg` }}><Puzzle s={120} c={fit > 0.95 ? "#5FBF7A" : C.accent} /></div>
          </div></Pop>
          <Motive at={30.3} name="NECESSIDADE" x={720} />
          <Pop at={31.4} x={300} y={360}><Label text="RESOLVER ALGO ESSENCIAL" size={26} /></Pop>
        </>
      );
    },
  },
  {
    a: 34.57, b: 39.37, kicker: "Segundo", title: "*PRAZER*",
    body: (t) => (
      <>
        <Pop at={34.8} x={540} y={600}><Person {...BUYER} pose="cheer" face="happy" w={210} /></Pop>
        <Pop at={35.3} x={780} y={420}><div style={{ scale: String(1 + Math.max(0, Math.sin(t * 7)) * 0.12) }}><Heart s={140} /></div></Pop>
        <Sparkles t={t} at={36.2} x={540} y={520} />
        <Motive at={35.3} name="PRAZER" />
        <Pop at={36.6} x={300} y={400}><Label text="SATISFAÇÃO E CONFORTO" size={26} /></Pop>
      </>
    ),
  },
  {
    a: 39.37, b: 43.79, kicker: "Terceiro", title: "*SEGURANÇA*",
    body: (t) => (
      <>
        <Pop at={39.6} x={380} y={620}><Person {...BUYER} pose="arms" face="happy" w={190} /></Pop>
        <Pop at={40.2} x={600} y={560}><Shield s={220} /></Pop>
        {t > 41.2 ? [0, 1, 2].map((i) => { const p = ((t - 41.2) * 0.9 + i / 3) % 1; return <div key={i} style={{ position: "absolute", left: 960 - p * 260, top: 440 + i * 110 - (p > 0.8 ? (p - 0.8) * 300 : 0), translate: "-50% -50%", opacity: p > 0.85 ? 1 - (p - 0.85) * 6 : 1, width: 64, height: 64, borderRadius: 32, background: "#E5484D", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 40, color: "#FFF" }}>!</div>; }) : null}
        <Motive at={40.2} name="SEGURANÇA" />
        <Pop at={41.6} x={840} y={360}><Label text="MENOS RISCO E INCERTEZA" size={24} /></Pop>
      </>
    ),
  },
  {
    a: 43.79, b: 48.97, kicker: "Quarto", title: "*STATUS*",
    body: (t) => (
      <>
        <Pop at={44.0} x={540} y={620}><Person {...BUYER} pose="cheer" face="happy" w={200} /></Pop>
        <Pop at={44.6} x={540} y={375} from="up"><Crown s={130} /></Pop>
        <Pop at={45.6} x={200} y={680}><Person {...P2} pose="cheer" w={130} /></Pop>
        <Pop at={45.9} x={880} y={680}><Person {...P3} pose="cheer" w={130} flip /></Pop>
        <Sparkles t={t} at={44.8} x={540} y={420} />
        <Motive at={44.6} name="STATUS" />
      </>
    ),
  },
  {
    a: 48.97, b: 54.32, kicker: "Quinto", title: "*CONVENIÊNCIA*",
    body: (t) => (
      <>
        <Pop at={49.2} x={300} y={620}><Person {...BUYER} pose="give" face="happy" w={190} hold={<Phone s={56} />} /></Pop>
        <Pop at={50.0} x={720} y={540}><div style={{ rotate: `${(t - 50) * 120}deg` }}><Clock s={240} /></div></Pop>
        <Motive at={50.0} name="CONVENIÊNCIA" />
        <Pop at={51.4} x={720} y={370}><Label text="ECONOMIZAR TEMPO E ENERGIA" size={26} /></Pop>
      </>
    ),
  },
  {
    a: 54.32, b: 62.2, kicker: "E também", title: "*ASPIRAÇÃO*",
    body: (t) => {
      const glow = ez(t, 57.8, 58.8);
      return (
        <>
          <Pop at={54.6} x={260} y={640}><Person {...BUYER} pose="point" face="happy" w={170} /></Pop>
          <div style={{ position: "absolute", left: 380, top: 520 }}><Arrow w={300} t={t} at={57.9} dur={0.7} curve={-50} dashed /></div>
          <Pop at={55.4} x={800} y={600}><div style={{ filter: `drop-shadow(0 0 ${20 + 30 * glow}px rgba(255,214,10,${0.4 + 0.5 * glow}))`, opacity: 0.55 + 0.45 * glow }}><Person shirt={C.accent} skin="#E0B48A" pose="cheer" w={240} /></div></Pop>
          <Sparkles t={t} at={58.6} x={800} y={500} />
          <Motive at={55.6} name="ASPIRAÇÃO" />
          <Pop at={58.4} x={780} y={300}><Label text="QUEM ELA DESEJA SER" size={26} /></Pop>
        </>
      );
    },
  },
  {
    a: 62.2, b: 90, kicker: "Por isso", title: "VENDA PELO *DESEJO*",
    body: (t) => (
      <>
        <Pop at={62.4} x={540} y={640}><Package s={170} /></Pop>
        {[{ x: 200, p: BUYER, n: <Heart s={60} /> }, { x: 540, p: P2, n: <Shield s={56} /> }, { x: 880, p: P3, n: <Crown s={70} /> }].map((it, i) => (
          <React.Fragment key={i}>
            {i !== 1 ? <Pop at={62.8 + i * 0.2} x={it.x} y={640}><Person {...it.p} w={130} pose="think" flip={i === 2} /></Pop> : null}
            <Pop at={64.0 + i * 0.3} x={it.x} y={i === 1 ? 430 : 400}><Bubble think w={130}><div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>{it.n}</div></Bubble></Pop>
          </React.Fragment>
        ))}
        <Pop at={67.4} x={540} y={860}><Label text="DESEJO DE COMPRA" hot size={36} /></Pop>
      </>
    ),
  },
];
export const Ex5191: React.FC = () => <Shell scenes={scenes} />;
