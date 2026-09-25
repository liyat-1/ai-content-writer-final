import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, ChevronDown, GitCompare, RefreshCw, SlidersHorizontal, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "./Sparkle";
import {
  EDIT_QUICK_ACTIONS,
  FEEDBACK_REASONS,
  FOCUSES,
  LENGTHS,
  TONES,
  diffWords,
  refine,
  type Copy,
  type Personalize,
} from "@/lib/aiWriter";

type Msg =
  | { role: "user"; text: string }
  | { role: "ai"; text: string; proposal?: { copy: Copy; changes: string[]; why: string; state: "open" | "applied" | "kept" } };

export function copyText(copy: Copy) {
  return copy.kind === "text"
    ? copy.text.message
    : `Subject: ${copy.email.subject}\nPreview: ${copy.email.preheader}\n\n${copy.email.heading}\n\n${copy.email.body}\n\nButton: ${copy.email.ctaLabel}`;
}

export function Diff({ before, after }: { before: string; after: string }) {
  return (
    <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">
      {diffWords(before, after).map((p, i) =>
        p.s === "same" ? <span key={i}>{p.t}</span> : p.s === "add" ? (
          <span key={i} className="rounded-sm bg-brand-soft text-brand">{p.t}</span>
        ) : (
          <span key={i} className="text-muted-foreground line-through decoration-destructive/60">{p.t}</span>
        ),
      )}
    </p>
  );
}

/**
 * Right-side Directful AI panel. The current content stays visible on the left;
 * every AI response is a proposal the hotel applies, keeps current, or retries.
 */
export function AiEditPanel({
  title,
  copy,
  onApply,
  onClose,
  onEditMyself,
  className = "z-[70]",
}: {
  title: string;
  copy: Copy;
  onApply: (copy: Copy) => void;
  onClose: () => void;
  onEditMyself?: () => void;
  className?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: `I'm working on the current ${copy.kind === "email" ? "email" : "text message"} for ${title} — including any edits you've made. What would you like to change?` },
  ]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(0);
  const [lastRequest, setLastRequest] = useState("");
  const [memory, setMemory] = useState<string[]>([]);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [personal, setPersonal] = useState<Personalize>({ tone: "Warm", length: "Medium", focus: "Return stay" });
  const [compareIdx, setCompareIdx] = useState<number | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const openProposal = () => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.role === "ai" && m.proposal?.state === "open") return m.proposal.copy;
    }
    return null;
  };

  const ask = (request: string, opts?: { personalize?: Personalize; retry?: boolean }) => {
    const q = request.trim();
    if (!q) return;
    const r = q.toLowerCase();
    // Session memory: constraints stated earlier keep applying.
    const nextMemory = [...memory];
    if (/(don'?t|do not|no|without).{0,20}(discount|offer|promo)/.test(r)) nextMemory.push("don't mention the discount");
    setMemory(nextMemory);

    const open = openProposal();
    let base: Copy = open && !/current version|from the current|start over/.test(r) ? open : copy;
    // "keep the first paragraph from the current version but use the CTA from the new version"
    if (open && /cta from the (new|suggest)/.test(r) && copy.kind === "email" && open.kind === "email") {
      base = { kind: "email", email: { ...copy.email, ctaLabel: open.email.ctaLabel } };
    }
    const nextSeed = opts?.retry ? seed + 1 : seed;
    setSeed(nextSeed + 1);
    const withMemory = [q, ...nextMemory.filter((c) => !r.includes(c))].join(". ");
    const result = refine(base, withMemory, nextSeed, opts?.personalize);
    const kindChanged = result.copy.kind !== copy.kind;
    setLastRequest(q);
    setMsgs((m) => [
      ...m.map((x) => (x.role === "ai" && x.proposal?.state === "open" ? { ...x, proposal: { ...x.proposal, state: "kept" as const } } : x)),
      ...(opts?.retry ? [] : [{ role: "user" as const, text: q }]),
      {
        role: "ai",
        text: kindChanged ? result.reply : opts?.retry ? "Here's a different take on the same request." : result.reply,
        proposal: { copy: result.copy, changes: result.changes, why: result.why, state: "open" },
      },
    ]);
    setInput("");
    setCompareIdx(null);
  };

  const setState = (idx: number, state: "applied" | "kept") =>
    setMsgs((m) => m.map((x, i) => (i === idx && x.role === "ai" && x.proposal ? { ...x, proposal: { ...x.proposal, state } } : x)));

  const chip = (active: boolean) => `rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${active ? "border-brand bg-brand-soft text-brand" : "border-border text-muted-foreground hover:border-brand/45 hover:text-foreground"}`;

  return (
    <aside role="dialog" aria-label="Directful AI" className={`fixed inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-border bg-card shadow-float ${className}`}>
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-card-foreground"><Sparkle className="text-brand" size={15} />Directful AI</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{title} · {copy.kind === "email" ? "Email" : "Text"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Directful AI"><X size={16} /></Button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {msgs.map((m, idx) =>
          m.role === "user" ? (
            <div key={idx} className="ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-[12.5px] text-primary-foreground">{m.text}</div>
          ) : (
            <div key={idx} className="space-y-2">
              <p className="flex gap-2 text-[12.5px] leading-relaxed text-card-foreground"><Sparkle size={12} className="mt-1 shrink-0 text-brand" />{m.text}</p>
              {m.proposal && (
                <div className={`rounded-md border ${m.proposal.state === "open" ? "border-brand/40" : "border-border opacity-70"}`}>
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Suggested update</p>
                    {m.proposal.state !== "open" && <span className="text-[11px] text-muted-foreground">{m.proposal.state === "applied" ? "Applied" : "Not used"}</span>}
                  </div>
                  <div className="max-h-64 overflow-y-auto px-3 py-2.5">
                    {compareIdx === idx ? (
                      <Diff before={copyText(copy)} after={copyText(m.proposal.copy)} />
                    ) : (
                      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-card-foreground">{copyText(m.proposal.copy)}</p>
                    )}
                  </div>
                  <ul className="flex flex-wrap gap-1 border-t border-border px-3 py-2">
                    {m.proposal.changes.map((c) => <li key={c} className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground">{c}</li>)}
                  </ul>
                  <details className="border-t border-border px-3 py-2 text-[11.5px] text-muted-foreground">
                    <summary className="cursor-pointer select-none font-medium text-card-foreground">Why this suggestion?</summary>
                    <p className="mt-1">{m.proposal.why}</p>
                  </details>
                  {m.proposal.state === "open" && (
                    <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
                      <Button size="sm" variant="brand" onClick={() => { onApply(m.proposal!.copy); setState(idx, "applied"); }}><Check size={13} />Apply changes</Button>
                      <Button size="sm" variant="outline" onClick={() => { setState(idx, "kept"); setFeedbackFor(idx); }}>Keep current</Button>
                      <Button size="sm" variant="ghost" onClick={() => ask(lastRequest, { retry: true })}><RefreshCw size={12} />Try another</Button>
                      <Button size="sm" variant="ghost" onClick={() => setCompareIdx(compareIdx === idx ? null : idx)}><GitCompare size={12} />{compareIdx === idx ? "Hide changes" : "Compare"}</Button>
                      {onEditMyself && <Button size="sm" variant="ghost" onClick={onEditMyself}><Pencil size={12} />Edit myself</Button>}
                    </div>
                  )}
                  {feedbackFor === idx && (
                    <div className="border-t border-border px-3 py-2.5">
                      <p className="text-[11.5px] font-medium text-card-foreground">Tell Directful AI why <span className="font-normal text-muted-foreground">(optional)</span></p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {FEEDBACK_REASONS.map((f) => (
                          <button key={f} className={chip(false)} onClick={() => { setFeedbackFor(null); ask(`${f}. Try a different direction.`); }}>{f}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border px-4 py-3">
        <button onClick={() => setShowPersonalize((v) => !v)} className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-card-foreground">
          <SlidersHorizontal size={13} />Personalize<ChevronDown size={13} className={`transition-transform ${showPersonalize ? "rotate-180" : ""}`} />
        </button>
        {showPersonalize && (
          <div className="mb-3 space-y-2 rounded-md border border-border p-2.5">
            {([["Tone", "tone", TONES], ["Length", "length", LENGTHS], ["Focus", "focus", FOCUSES]] as const).map(([label, key, opts]) => (
              <div key={key}>
                <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <div className="flex flex-wrap gap-1">
                  {opts.map((o) => <button key={o} className={chip(personal[key] === o)} onClick={() => setPersonal((p) => ({ ...p, [key]: o }))}>{o}</button>)}
                </div>
              </div>
            ))}
            <Button size="sm" variant="brand" className="w-full" onClick={() => ask(`Personalize: ${personal.tone} tone, ${personal.length.toLowerCase()} length, focus on ${personal.focus.toLowerCase()}`, { personalize: personal })}>
              <Sparkle size={12} />Apply personalization
            </Button>
          </div>
        )}
        <div className="mb-2 flex max-h-[76px] flex-wrap gap-1.5 overflow-y-auto">
          {EDIT_QUICK_ACTIONS.filter((a) => copy.kind === "email" || !/subject|text version/i.test(a)).map((a) => (
            <button key={a} className={chip(false)} onClick={() => ask(a)}>{a}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
            rows={2}
            placeholder="Ask Directful AI to refine this content…"
            className="w-full resize-none rounded-md border border-input bg-background py-2 pl-3 pr-11 text-[13px] outline-none focus:border-brand"
          />
          <Button type="submit" size="icon" variant="brand" className="absolute bottom-2.5 right-2 size-7" disabled={!input.trim()} aria-label="Send"><ArrowUp size={14} /></Button>
        </form>
        <p className="mt-1.5 text-[10.5px] text-muted-foreground">Directful AI only suggests content — nothing is published or replaced until you apply it.</p>
      </div>
    </aside>
  );
}
