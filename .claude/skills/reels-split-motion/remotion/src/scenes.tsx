// Scene types, driven by spec.json (same shape as the canvas version). All times are clip seconds.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Bookmark, MessageCircle, Send, UserPlus } from "lucide-react";
import { Box, C, DISPLAY, Exemplo, Glass, Kicker, Mark, Ripple, UI, Words, ramp, sp, useT } from "./kit";

type Line = [string, string, number?];
export type Scene =
  | { type: "hook"; a: number; b: number; kicker: string; lines: [string, string][]; at: number; sub?: string; subAt?: number }
  | { type: "rows"; a: number; b: number; kicker: string; title?: [string, string][]; titleAt?: number; items: { text: string; at: number; mark?: "yes" | "no" | "num" | "none" }[] }
  | { type: "versus"; a: number; b: number; kicker: string; left: { title: string; items: [string, number][]; at: number }; right: { title: string; items: [string, number][]; at: number }; sym?: string; symAt?: number; hot?: "left" | "right"; hotAt?: number }
  | { type: "timeline"; a: number; b: number; kicker: string; start?: number; title?: [string, string][]; titleAt?: number; items: { label: string; sub?: string; at: number }[] }
  | { type: "big"; a: number; b: number; kicker: string; lines: Line[]; at: number; box?: [string, number]; strike?: [number, number]; exemplo?: number }
  | { type: "cta"; a: number; b: number; kicker: string; icon: "save" | "follow" | "send" | "comment"; lines: [string, string][]; at: number; sub?: string; subAt?: number };

const colOf = (c: string) => (c === "y" ? C.accent : c === "g" ? C.grey2 : C.white);
const fitSize = (s: string, max: number, maxW = 940, k = 0.8) => Math.min(max, Math.floor(maxW / Math.max(1, s.length * k)));
const titleText = (lines: [string, string][]) => lines.map(([s, c]) => s.split(" ").map((w) => (c === "y" ? `*${w}*` : w)).join(" "));

// ---------------------------------------------------------------- hook
const Hook: React.FC<{ s: Extract<Scene, { type: "hook" }> }> = ({ s }) => {
  const { t } = useT();
  const zoom = interpolate(t, [s.a, s.b], [1, 1.06]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 90, scale: String(zoom) }}>
      <Kicker text={s.kicker} at={Math.max(s.a, s.at)} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {s.lines.map(([str, c], i) =>
          c === "box" ? (
            <Box key={i} text={str} at={s.at + 0.15 + i * 0.12} size={fitSize(str, 128, 860)} />
          ) : (
            <Words key={i} text={c === "y" ? `*${str}*` : str} at={s.at + i * 0.12} size={fitSize(str, 120, 940)} color={colOf(c)} />
          ),
        )}
        {s.sub ? <div style={{ marginTop: 20, fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.grey2, opacity: ramp(t, s.subAt ?? 0, (s.subAt ?? 0) + 0.4) }}>{s.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- rows (list with marks)
const Rows: React.FC<{ s: Extract<Scene, { type: "rows" }> }> = ({ s }) => {
  const { t } = useT();
  const titleAt = Math.min(s.titleAt ?? s.a, s.a + 0.3);
  const n = s.items.length;
  const top = s.title ? 320 + (s.title.length - 1) * 80 : 240;
  const gap = Math.min(150, (905 - top) / n), h = Math.min(122, gap - 20);
  const cur = s.items.filter((it) => t >= it.at).length - 1;
  return (
    <AbsoluteFill>
      <Kicker text={s.kicker} at={s.a + 0.05} />
      {s.title ? (
        <div style={{ position: "absolute", left: 64, top: 222 }}>
          {titleText(s.title).map((l, i) => (
            <Words key={i} text={l} at={titleAt + i * 0.12} size={72} align="left" width={950} />
          ))}
        </div>
      ) : null}
      {s.items.map((it, i) => {
        const active = i === cur;
        const dim = cur > i ? 0.55 : 1;
        return (
          <Glass key={i} at={it.at} glow={active ? ramp(t, it.at, it.at + 0.3) : 0} style={{ position: "absolute", left: 64, top: top + 20 + i * gap, width: 952, height: h, opacity: it.mark === "no" ? 0.9 : dim }}>
            <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 28, padding: "0 30px" }}>
              {it.mark !== "none" ? <Mark kind={it.mark ?? "num"} n={i + 1} at={it.at + 0.08} size={Math.min(76, h - 26)} active={active} /> : null}
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: fitSize(it.text, Math.min(46, h * 0.42), 760, 0.55), color: it.mark === "no" ? C.grey2 : C.white, textDecoration: it.mark === "no" ? "line-through rgba(255,214,10,0.8) 4px" : "none" }}>{it.text}</div>
            </div>
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- versus
const Side: React.FC<{ x: number; d: { title: string; items: [string, number][]; at: number }; hot: boolean }> = ({ x, d, hot }) => {
  const { t } = useT();
  return (
    <Glass at={d.at} hot={hot} glow={hot ? 1 : 0} style={{ position: "absolute", left: x, top: 250, width: 440, height: 640 }}>
      <div style={{ padding: "48px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        {d.title.split("|").map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: fitSize(l, 58, 380), color: hot ? C.ink : C.white, lineHeight: 1.05, textAlign: "center", whiteSpace: "nowrap" }}>{l}</div>
        ))}
        <div style={{ height: 20 }} />
        {d.items.map(([str, at], i) => {
          const k = ramp(t, at, at + 0.35);
          return (
            <div key={i} style={{ opacity: k, translate: `0px ${(1 - k) * 24}px`, filter: `blur(${(1 - k) * 6}px)`, width: 360, padding: "18px 0", borderRadius: 999, textAlign: "center", background: hot ? "rgba(20,23,28,0.14)" : "rgba(255,255,255,0.07)", fontFamily: UI, fontWeight: 800, fontSize: 36, color: hot ? C.ink : C.white }}>{str}</div>
          );
        })}
      </div>
    </Glass>
  );
};
const Versus: React.FC<{ s: Extract<Scene, { type: "versus" }> }> = ({ s }) => {
  const { t, frame, fps } = useT();
  const leftAt = Math.min(s.left.at, s.a + 0.3);
  const symAt = s.symAt ?? s.right.at;
  const k = sp(frame, fps, symAt, 9, 220);
  const hot = t >= (s.hotAt ?? 0);
  return (
    <AbsoluteFill>
      <Kicker text={s.kicker} at={s.a + 0.05} />
      <Side x={64} d={{ ...s.left, at: leftAt }} hot={s.hot === "left" && hot} />
      <Side x={576} d={s.right} hot={s.hot === "right" && hot} />
      <Ripple at={symAt} x={540} y={570} r={70} />
      <div style={{ position: "absolute", left: 540 - 58, top: 570 - 58, width: 116, height: 116, borderRadius: 58, background: C.bg, border: `3px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", scale: String(Math.max(0, k)), boxShadow: "0 0 40px rgba(255,214,10,0.5)" }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 60, color: C.accent, marginTop: 6 }}>{s.sym ?? "x"}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- timeline
const Timeline: React.FC<{ s: Extract<Scene, { type: "timeline" }> }> = ({ s }) => {
  const { t, frame, fps } = useT();
  const top = s.title ? 340 : 250;
  const n = s.items.length, gap = (915 - top) / n;
  const done = s.items.filter((it) => t >= it.at).length;
  const prog = s.items.reduce((acc, it) => acc + ramp(t, it.at - 0.35, it.at), 0);
  const lineH = gap * Math.max(0, prog - 1);
  return (
    <AbsoluteFill>
      <Kicker text={s.kicker} at={s.a + 0.05} />
      {s.title ? (
        <div style={{ position: "absolute", left: 64, top: 222 }}>
          {titleText(s.title).map((l, i) => <Words key={i} text={l} at={Math.min(s.titleAt ?? s.a, s.a + 0.3) + i * 0.1} size={64} align="left" />)}
        </div>
      ) : null}
      {done > 0 ? (() => {
        const at = s.items[done - 1].at; const gk = sp(frame, fps, at, 14, 120);
        return <div style={{ position: "absolute", right: 30, bottom: -60, fontFamily: DISPLAY, fontSize: 560, lineHeight: 1, color: "transparent", WebkitTextStroke: "3px rgba(255,214,10,0.16)", opacity: Math.min(1, gk), translate: `${(1 - gk) * 120}px 0px`, rotate: `${(1 - gk) * 8}deg` }}>{(s.start ?? 1) + done - 1}</div>;
      })() : null}
      <div style={{ position: "absolute", left: 104, top: top + gap / 2, width: 6, height: gap * (n - 1), background: "rgba(255,255,255,0.1)", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: 104, top: top + gap / 2, width: 6, height: lineH, background: C.accent, borderRadius: 3, boxShadow: "0 0 20px rgba(255,214,10,0.6)" }} />
      {s.items.map((it, i) => {
        const k = sp(frame, fps, it.at, 12, 180);
        const on = t >= it.at, cur = i === done - 1;
        const cy = top + gap / 2 + i * gap;
        return (
          <React.Fragment key={i}>
            {cur ? <Ripple at={it.at} x={107} y={cy} r={46} /> : null}
            <div style={{ position: "absolute", left: 107 - 30, top: cy - 30, width: 60, height: 60, borderRadius: 30, background: on ? (cur ? C.accent : "#5E6B80") : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", scale: String(on ? 0.7 + 0.3 * k : 0.7), boxShadow: cur ? "0 0 30px rgba(255,214,10,0.7)" : "none" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 28, color: cur ? C.ink : C.white, marginTop: 3 }}>{(s.start ?? 1) + i}</span>
            </div>
            <div style={{ position: "absolute", left: 170, top: cy - (it.sub ? 44 : 30), opacity: on ? Math.min(1, k * 1.4) : 0.0, translate: `${(1 - k) * 40}px 0px`, filter: `blur(${Math.max(0, (1 - k) * 8)}px)` }}>
              <div style={{ fontFamily: DISPLAY, fontSize: fitSize(it.label, Math.min(54, gap * 0.48), 820), color: cur ? C.accent : C.white, lineHeight: 1.05 }}>{it.label}</div>
              {it.sub ? <div style={{ fontFamily: UI, fontWeight: 600, fontSize: Math.min(30, gap * 0.26), color: C.grey2, marginTop: 6 }}>{it.sub}</div> : null}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- big statement
const Big: React.FC<{ s: Extract<Scene, { type: "big" }> }> = ({ s }) => {
  const { t } = useT();
  const zoom = interpolate(t, [s.a, s.b], [1, 1.05]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 90 }}>
      <Kicker text={s.kicker} at={s.a + 0.05} />
      {s.exemplo != null ? <Exemplo at={s.exemplo} /> : null}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, scale: String(zoom) }}>
        {s.lines.map(([str, c, at], i) => {
          const a0 = Math.min(at ?? s.at + i * 0.15, s.a + 0.3 + i * 0.15);
          const struck = s.strike && s.strike[0] === i;
          const sk = struck ? ramp(t, s.strike![1], s.strike![1] + 0.35) : 0;
          return (
            <div key={i} style={{ position: "relative" }}>
              <Words text={c === "y" ? `*${str}*` : str} at={a0} size={fitSize(str, 100, 940)} color={colOf(c)} width={struck ? null : 940} />
              {struck ? <div style={{ position: "absolute", left: -12, right: -12, top: "52%", height: 12, borderRadius: 6, background: C.accent, transformOrigin: "0% 50%", scale: `${sk} 1`, boxShadow: "0 0 18px rgba(255,214,10,0.6)" }} /> : null}
            </div>
          );
        })}
        {s.box ? <div style={{ marginTop: 18 }}><Box text={s.box[0]} at={s.box[1]} size={fitSize(s.box[0], 92, 860)} /></div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- CTA
const Cta: React.FC<{ s: Extract<Scene, { type: "cta" }> }> = ({ s }) => {
  const { t, frame, fps } = useT();
  const k = sp(frame, fps, s.at, 9, 200);
  const Icon = s.icon === "save" ? Bookmark : s.icon === "send" ? Send : s.icon === "comment" ? MessageCircle : UserPlus;
  const bob = Math.sin((t - s.at) * 3) * 6;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Kicker text={s.kicker} at={s.a + 0.05} />
      <Ripple at={s.at + 0.1} x={540} y={420} r={150} />
      <div style={{ position: "absolute", left: 540 - 130, top: 420 - 130 + bob, width: 260, height: 260, borderRadius: 130, background: `linear-gradient(145deg, ${C.accent}, ${C.accentDeep})`, display: "flex", alignItems: "center", justifyContent: "center", scale: String(Math.max(0, k)), boxShadow: "0 0 80px rgba(255,214,10,0.45), 0 30px 60px rgba(0,0,0,0.5)" }}>
        <Icon size={130} color={C.ink} strokeWidth={2.6} fill={s.icon === "save" ? C.ink : "none"} />
      </div>
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {s.lines.map(([str, c], i) => <Words key={i} text={c === "y" ? `*${str}*` : str} at={s.at + 0.2 + i * 0.12} size={fitSize(str, 92, 940)} color={colOf(c)} />)}
        {s.sub ? <div style={{ marginTop: 18, fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.grey2, opacity: ramp(t, s.subAt ?? s.at + 1, (s.subAt ?? s.at + 1) + 0.4) }}>{s.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const SceneView: React.FC<{ s: Scene }> = ({ s }) => {
  switch (s.type) {
    case "hook": return <Hook s={s} />;
    case "rows": return <Rows s={s} />;
    case "versus": return <Versus s={s} />;
    case "timeline": return <Timeline s={s} />;
    case "big": return <Big s={s} />;
    case "cta": return <Cta s={s} />;
  }
};
