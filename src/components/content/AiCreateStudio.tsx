import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUp, Check, Loader2, X } from "lucide-react";
import { Sparkle } from "@/components/ai/Sparkle";
import { AiMark, AiSays, fill } from "./shared";
import {
  CONTEXT_SOURCES,
  MONTHS,
  generateAll,
  ideasFor,
  readDirection,
  useLibrary,
  type Direction,
  type Idea,
} from "@/lib/contentLibrary";

type Phase = "time" | "found" | "plan" | "generating" | "ready";
const NOW = 8; // September 2026
const PRESETS = [
  { label: "This month", s: NOW, e: NOW },
  { label: "Next month", s: NOW + 1, e: NOW + 1 },
  { label: "Next 3 months", s: NOW, e: NOW + 3 },
  { label: "Next 6 months", s: NOW, e: Math.min(11, NOW + 6) },
];
const EXAMPLES = [
  "Keep it warm and personal. Don't make every message about the holidays.",
  "Focus more on direct bookings.",
  "Make the messaging feel more premium.",
  "I want autumn to feel subtle rather than obvious.",
];
const STEPS = [
  "Understanding your hotel",
  "Reviewing existing content",
  "Checking your selected timeframe",
  "Finding relevant seasonal moments",
  "Reviewing hotel events",
  "Writing campaign content",
  "Personalizing guest segments",
  "Preparing email and text previews",
];

export function AiCreateStudio({ onClose, onReview }: { onClose: () => void; onReview: () => void }) {
  const { campaigns } = useLibrary();
  const [phase, setPhase] = useState<Phase>("time");
  const [preset, setPreset] = useState("Next 3 months");
  const [range, setRange] = useState({ s: NOW, e: NOW + 3 });
  const [thinking, setThinking] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [choosing, setChoosing] = useState(false);
  const [ideasDecision, setIdeasDecision] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>({ tone: ["warm"], avoid: [], notes: [] });
  const [acks, setAcks] = useState<{ you: string; ai: string }[]>([]);
  const [step, setStep] = useState(0);
  const [written, setWritten] = useState(0);

  const ideas = useMemo(() => ideasFor(range.s, range.e), [range]);
  const chosen = ideas.filter((i) => picked.has(i.id));
  const rangeLabel = `${MONTHS[range.s]} 2026 → ${MONTHS[range.e]} 2026`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && phase !== "generating" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, phase]);

  const discover = () => {
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setPicked(new Set(ideas.map((i) => i.id)));
      setPhase("found");
    }, 1400);
  };

  const tell = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const next = readDirection(t, direction);
    setDirection(next);
    const r = t.toLowerCase();
    let ai = "Got it — I'll keep that in mind for every campaign.";
    if (next.avoid.length > direction.avoid.length) ai = `Understood. I'll leave ${next.avoid[next.avoid.length - 1]} out completely.`;
    else if (/premium/.test(r)) ai = "Lovely. I'll lean into a calmer, more refined voice — fewer exclamation marks, richer detail.";
    else if (/direct/.test(r)) ai = "Perfect. Every campaign will close on a clear reason to book direct.";
    else if (/subtle/.test(r)) ai = "Nice touch. The season will sit in the background rather than lead the message.";
    else if (/holiday|event/.test(r)) ai = "Makes sense. I'll only use events where they genuinely fit the guest journey.";
    setAcks((a) => [...a, { you: t, ai }]);
    setInput("");
  };

  const generate = () => {
    setPhase("generating");
    setStep(0);
    setWritten(0);
    generateAll(chosen, direction, rangeLabel);
  };

  useEffect(() => {
    if (phase !== "generating") return;
    if (step < STEPS.length) {
      const t = window.setTimeout(() => setStep((s) => s + 1), step === 5 ? 2600 : 650);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setPhase("ready"), 500);
    return () => window.clearTimeout(t);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== "generating" || step < 5) return;
    if (written >= campaigns.length) return;
    const t = window.setTimeout(() => setWritten((w) => w + 1), 210);
    return () => window.clearTimeout(t);
  }, [phase, step, written, campaigns.length]);

  const groups = ["Seasonal moments", "Holidays", "Hotel events", "Local events"] as Idea["group"][];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden ai-surface">
      <div className="pointer-events-none absolute inset-0 ai-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <header className="relative flex items-center justify-between border-b border-border/70 bg-card/60 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <AiMark size={30} live={phase === "generating" || thinking} />
          <div>
            <p className="text-[13.5px] font-semibold text-card-foreground">Directful AI</p>
            <p className="text-[11px] text-muted-foreground">Creating for Holiday Inn Times Square</p>
          </div>
        </div>
        {phase !== "generating" && (
          <button onClick={onClose} aria-label="Close Directful AI" className="grid size-8 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <X size={18} />
          </button>
        )}
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {phase === "generating" || phase === "ready" ? (
          <Generation phase={phase} step={step} written={written} campaigns={campaigns} onReview={onReview} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-8 px-5 pb-40 pt-10 sm:pt-14">
            {/* Intro */}
            <div className="ai-rise text-center">
              <span className="ai-float inline-block"><AiMark size={52} live /></span>
              <h2 className="mt-5 text-[34px] font-semibold leading-tight tracking-tight text-card-foreground sm:text-[42px]">
                Let's create something <span className="ai-text">great.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
                I'll use your hotel's content, brand, campaigns, seasonality and relevant events to help create messaging that feels right for your guests.
              </p>
            </div>

            {/* Timeframe */}
            <AiSays text="First, let's choose when this content is for.">
              <div className="rounded-lg bg-card p-5 shadow-lift ai-edge">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">What period are we creating content for?</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...PRESETS, { label: "Custom period", s: range.s, e: range.e }].map((p) => (
                    <button
                      key={p.label}
                      disabled={phase !== "time"}
                      onClick={() => { setPreset(p.label); if (p.label !== "Custom period") setRange({ s: p.s, e: p.e }); }}
                      className={`rounded-sm border px-3 py-1.5 text-[12.5px] font-medium transition-all ${preset === p.label ? "border-brand bg-brand text-brand-foreground shadow-card" : "border-border bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground"}`}
                    >
                      {p.label}{p.label === "Next 3 months" && <span className="ml-1.5 text-[10px] opacity-80">Recommended</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {(["s", "e"] as const).map((k, i) => (
                    <label key={k} className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground">{i ? "End" : "Start"}</span>
                      <select
                        disabled={phase !== "time"}
                        value={range[k]}
                        onChange={(e) => { setPreset("Custom period"); const v = Number(e.target.value); setRange((r) => (k === "s" ? { s: v, e: Math.max(v, r.e) } : { s: Math.min(r.s, v), e: v })); }}
                        className="rounded-sm border border-border bg-background px-2.5 py-1.5 text-[13px] font-semibold text-card-foreground"
                      >
                        {MONTHS.map((m, idx) => idx >= NOW && <option key={m} value={idx}>{m} 2026</option>)}
                      </select>
                      {!i && <ArrowRight size={14} className="text-muted-foreground" />}
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2.5 rounded-md bg-brand-soft/70 px-3.5 py-3">
                  <Sparkle size={13} className="mt-0.5 shrink-0 text-brand" />
                  <p className="text-[12.5px] leading-relaxed text-card-foreground">
                    <strong>Why do we need this?</strong> Your timeframe helps me identify the seasons, holidays, local events and hotel activities that could shape the content.
                  </p>
                </div>
                {phase === "time" && (
                  <button onClick={discover} disabled={thinking} className="mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold ai-button ai-pulse">
                    {thinking ? <><Loader2 size={15} className="animate-spin" />Looking at {MONTHS[range.s]}–{MONTHS[range.e]}…</> : <><Sparkle size={14} />Find what's happening</>}
                  </button>
                )}
              </div>
            </AiSays>

            {/* Discoveries */}
            {phase !== "time" && (
              <AiSays text={ideas.length ? `Here's what I found for ${MONTHS[range.s]}–${MONTHS[range.e]}. I found a few things that could shape your content — would you like me to use these?` : "That period is quiet — no major events. I'll focus on your hotel and the guest relationship."}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {groups.map((g) => {
                    const items = ideas.filter((i) => i.group === g);
                    if (!items.length) return null;
                    return (
                      <div key={g} className="rounded-lg border border-border bg-card p-4 shadow-card">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</p>
                        <ul className="mt-2.5 space-y-1.5">
                          {items.map((i, n) => {
                            const on = picked.has(i.id);
                            return (
                              <li key={i.id} style={{ animationDelay: `${n * 90}ms` }} className="ai-rise">
                                <button
                                  disabled={!choosing}
                                  onClick={() => setPicked((p) => { const x = new Set(p); x.has(i.id) ? x.delete(i.id) : x.add(i.id); return x; })}
                                  className={`flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-left transition-all ${on ? "border-brand/40 bg-brand-soft/50" : "border-transparent opacity-55"} ${choosing ? "cursor-pointer hover:border-brand" : ""}`}
                                >
                                  <span className="text-[18px] leading-none">{i.emoji}</span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] font-semibold text-card-foreground">{i.name}{i.date && <span className="ml-1.5 font-normal text-muted-foreground">— {i.date}</span>}</span>
                                    <span className="block text-[11.5px] text-muted-foreground">{i.fit}</span>
                                  </span>
                                  {choosing && <span className={`mt-0.5 grid size-4 place-items-center rounded-sm border ${on ? "border-brand bg-brand text-brand-foreground" : "border-border"}`}>{on && <Check size={11} />}</span>}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                {ideas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      { l: "Use these ideas", f: () => { setChoosing(false); setPicked(new Set(ideas.map((i) => i.id))); } },
                      { l: "Choose what to use", f: () => setChoosing(true) },
                      { l: "Skip events", f: () => { setChoosing(false); setPicked(new Set(ideas.filter((i) => i.group === "Seasonal moments").map((i) => i.id))); } },
                    ].map((b) => (
                      <button key={b.l} onClick={() => { b.f(); setIdeasDecision(b.l); }} className={`rounded-sm border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${ideasDecision === b.l ? "border-brand bg-brand-soft text-brand" : "border-border bg-card text-card-foreground hover:border-brand/50"}`}>
                        {b.l}
                      </button>
                    ))}
                  </div>
                )}
                {ideasDecision && (
                  <p className="ai-rise mt-3 text-[12.5px] text-muted-foreground">
                    <Sparkle size={11} className="mr-1 inline text-brand" />
                    I won't force these everywhere — I'll only use each one where it fits the guest journey. For example, I'd keep the conference out of the 12-Month message.
                  </p>
                )}
              </AiSays>
            )}

            {acks.map((a, i) => (
              <div key={i} className="space-y-4">
                <div className="ai-rise ml-auto max-w-[80%] rounded-md bg-foreground px-3.5 py-2.5 text-[13.5px] text-background">{a.you}</div>
                <AiSays text={a.ai} />
              </div>
            ))}

            {/* Plan */}
            {phase === "plan" && (
              <AiSays text="Directful AI is ready to write for your hotel. Here's the plan.">
                <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
                  <div className="rounded-lg border border-border bg-card p-4 shadow-card">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">I'll use</p>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {CONTEXT_SOURCES.map((c, i) => (
                        <span key={c} style={{ animationDelay: `${i * 70}ms` }} className="ai-rise flex items-center gap-1.5 rounded-sm bg-brand-soft/60 px-2 py-1.5 text-[11.5px] font-medium text-card-foreground">
                          <Check size={12} className="text-brand" />{c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-card p-4 shadow-lift ai-edge">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-brand">Here's the plan</p>
                    <dl className="mt-3 space-y-2.5 text-[12.5px]">
                      {[
                        ["Content period", rangeLabel],
                        ["Campaigns", `${campaigns.length} campaigns`],
                        ["Channels", "Email + Text"],
                        ["Guest segments", "Direct + OTA"],
                        ["Direction", [...direction.tone, "return-focused"].join(", ")],
                        ["Events", chosen.filter((i) => i.group !== "Seasonal moments").map((i) => i.name).join(", ") || "None"],
                        ["Seasonality", chosen.filter((i) => i.group === "Seasonal moments").map((i) => i.name).join(", ") || "None"],
                        ...(direction.avoid.length ? [["Leaving out", direction.avoid.join(", ")]] : []),
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 border-b border-border/70 pb-2 last:border-0">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="text-right font-semibold capitalize text-card-foreground">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </AiSays>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      {(phase === "found" || phase === "plan") && (
        <div className="relative border-t border-border/70 bg-card/80 px-5 py-3 backdrop-blur-md">
          <div className="mx-auto max-w-3xl">
            {phase === "found" && acks.length === 0 && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {EXAMPLES.map((e) => (
                  <button key={e} onClick={() => tell(e)} className="shrink-0 rounded-sm border border-border bg-background px-2.5 py-1 text-[11.5px] text-muted-foreground hover:border-brand/50 hover:text-foreground">{e}</button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex flex-1 items-end gap-2 rounded-md bg-background p-2 ai-edge">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); tell(input); } }}
                  placeholder="Or tell Directful AI what you're thinking…  “Don't focus too much on events. Keep it warm and focused on bringing guests back.”"
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[13.5px] outline-none placeholder:text-muted-foreground/80"
                />
                <button onClick={() => tell(input)} disabled={!input.trim()} aria-label="Send" className="grid size-8 place-items-center rounded-sm bg-foreground text-background disabled:opacity-30">
                  <ArrowUp size={16} />
                </button>
              </div>
              {phase === "found" ? (
                <button onClick={() => setPhase("plan")} className="h-[50px] shrink-0 rounded-md px-4 text-[13px] font-semibold ai-button">
                  Review the plan
                </button>
              ) : (
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setPhase("found")} className="hidden h-[50px] rounded-md border border-border bg-card px-3 text-[12.5px] font-medium sm:block">Adjust direction</button>
                  <button onClick={generate} className="inline-flex h-[50px] items-center gap-2 rounded-md px-5 text-[13.5px] font-semibold ai-button ai-pulse">
                    <Sparkle size={15} className="ai-twinkle" />Generate my content
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Generation({ phase, step, written, campaigns, onReview }: { phase: Phase; step: number; written: number; campaigns: ReturnType<typeof useLibrary>["campaigns"]; onReview: () => void }) {
  const ready = phase === "ready";
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[320px_1fr]">
      <div>
        <span className={ready ? "" : "ai-float inline-block"}><AiMark size={48} live={!ready} /></span>
        {ready ? (
          <div className="ai-rise">
            <h2 className="mt-5 text-[34px] font-semibold leading-tight tracking-tight text-card-foreground">Your content is <span className="ai-text">ready.</span></h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">I created content for {campaigns.length} campaigns across your guest segments and channels.</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[[String(campaigns.length), "campaigns"], [`${campaigns.length * 2 + 10}`, "variations"], ["2", "channels"]].map(([n, l]) => (
                <div key={l} className="rounded-md bg-card p-3 shadow-card ai-edge"><p className="text-[22px] font-semibold text-brand">{n}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>
              ))}
            </div>
            <button onClick={onReview} className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-3 text-[14px] font-semibold ai-button ai-pulse">
              Review your content <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <h2 className="mt-5 text-[26px] font-semibold leading-tight tracking-tight text-card-foreground">Directful AI is creating your content</h2>
            <ul className="mt-5 space-y-2">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-2.5 text-[13px] transition-colors ${i < step ? "text-card-foreground" : i === step ? "font-semibold text-brand" : "text-muted-foreground/60"}`}>
                  <span className={`grid size-5 place-items-center rounded-sm ${i < step ? "bg-brand text-brand-foreground" : i === step ? "bg-brand-soft" : "border border-border"}`}>
                    {i < step ? <Check size={12} /> : i === step ? <Sparkle size={10} className="ai-twinkle text-brand" /> : null}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="grid content-start gap-2.5 sm:grid-cols-2">
        {campaigns.map((c, i) => {
          const done = i < written || ready;
          return (
            <div key={c.id} className={`relative overflow-hidden rounded-lg p-3.5 transition-all duration-500 ${done ? "bg-card shadow-card ai-edge" : "border border-dashed border-border bg-card/40"}`}>
              {!done && step >= 5 && i === written && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-soft to-transparent [animation:ai-sweep_1.1s_linear_infinite]" />}
              <div className="relative flex items-center justify-between">
                <p className="text-[12.5px] font-semibold text-card-foreground">{c.name}</p>
                {done ? <span className="ai-rise inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand"><Check size={11} />Written</span> : <span className="text-[10.5px] text-muted-foreground">Waiting</span>}
              </div>
              {done ? (
                <p className="ai-rise relative mt-1.5 line-clamp-2 text-[12px] italic leading-snug text-muted-foreground">“{fill(c.content.direct.email.heading)} — {fill(c.content.direct.text).slice(0, 70)}…”</p>
              ) : (
                <div className="relative mt-2 space-y-1.5"><div className="h-2 w-4/5 rounded-sm bg-muted" /><div className="h-2 w-3/5 rounded-sm bg-muted" /></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
