import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, FileText, GitCompare, Image, Minimize2, Paperclip, Plus, RefreshCw, SlidersHorizontal, Pencil, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { AiMark } from "@/components/content/shared";
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

function ComposerAttachments() {
  const attachments = usePromptInputAttachments();
  if (!attachments.files.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-3 pt-3">
      {attachments.files.map((file) => (
        <div key={file.id} className="flex max-w-48 items-center gap-2 rounded-md border border-border bg-muted/55 px-2 py-1.5 text-[11px] text-card-foreground">
          {file.mediaType?.startsWith("image/") ? <Image size={14} /> : file.mediaType?.startsWith("video/") ? <Video size={14} /> : <FileText size={14} />}
          <span className="truncate">{file.filename ?? "Attachment"}</span>
          <Button type="button" variant="ghost" size="icon-sm" className="size-5" onClick={() => attachments.remove(file.id)} aria-label={`Remove ${file.filename ?? "attachment"}`}><X size={12} /></Button>
        </div>
      ))}
    </div>
  );
}

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

/** Floating Directful AI workspace shown over the still-visible campaign editor. */
export function AiEditPanel({
  title,
  copy,
  onApply,
  onClose,
  onEditMyself,
  className = "z-[70]",
  embedded = false,
  onMinimize,
}: {
  title: string;
  copy: Copy;
  onApply: (copy: Copy) => void;
  onClose: () => void;
  onEditMyself?: () => void;
  className?: string;
  embedded?: boolean;
  onMinimize?: () => void;
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
    <div className={embedded ? "h-full min-h-[520px]" : `fixed inset-0 grid place-items-center bg-foreground/25 p-3 backdrop-blur-[3px] sm:p-6 ${className}`} onMouseDown={(event) => !embedded && event.target === event.currentTarget && onClose()}>
    <aside role={embedded ? "region" : "dialog"} aria-modal={embedded ? undefined : "true"} aria-label="Directful AI" className={`ai-rise relative flex w-full flex-col overflow-hidden border border-border bg-card ${embedded ? "h-full min-h-[560px] rounded-lg shadow-lift" : "max-h-[min(86vh,50rem)] max-w-[48rem] rounded-xl shadow-float"}`}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/70 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <AiMark size={32} />
          <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-[13.5px] font-semibold text-card-foreground">Content assistant</p><span className="size-1.5 shrink-0 rounded-full bg-emerald-500" /></div>
          <p className="truncate text-[11px] text-muted-foreground">{title} · {copy.kind === "email" ? "Email" : "Text"}</p></div>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && <Button variant="ghost" size="icon" onClick={onMinimize} aria-label="Minimize Directful AI"><Minimize2 size={16} /></Button>}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Directful AI"><X size={16} /></Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-5">
        {msgs.map((m, idx) =>
          m.role === "user" ? (
            <Message key={idx} from="user" className="max-w-[85%]"><MessageContent className="bg-primary px-3 py-2 text-[12.5px] text-primary-foreground"><MessageResponse>{m.text}</MessageResponse></MessageContent></Message>
          ) : (
            <div key={idx} className="space-y-3">
               <Message from="assistant" className="max-w-full"><MessageContent className="w-full bg-transparent p-0"><div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 text-[12.5px] leading-relaxed text-card-foreground"><AiMark size={28} /><MessageResponse className="pt-1">{m.text}</MessageResponse></div></MessageContent></Message>
              {m.proposal && (
                 <div className={`ml-10 overflow-hidden rounded-lg border bg-canvas/45 ${m.proposal.state === "open" ? "border-brand/30 shadow-card" : "border-border opacity-70"}`}>
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
                       <Button size="sm" variant="brand" onClick={() => { if (!m.proposal) return; onApply(m.proposal.copy); setState(idx, "applied"); }}><Check size={13} />Apply changes</Button>
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

      <div className="border-t border-border/70 bg-card px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPersonalize((v) => !v)} className="shrink-0 px-2 text-[12px]">
          <SlidersHorizontal size={13} />Personalize<ChevronDown size={13} className={`transition-transform ${showPersonalize ? "rotate-180" : ""}`} />
          </Button>
          {EDIT_QUICK_ACTIONS.filter((a) => copy.kind === "email" || !/subject|text version/i.test(a)).slice(0, 3).map((a) => (
            <Button key={a} variant="outline" size="sm" className="min-w-0 justify-start truncate px-2.5 text-[11.5px] font-medium" onClick={() => ask(a)}>{a}</Button>
          ))}
        </div>
        {showPersonalize && (
          <div className="mb-3 space-y-2 rounded-lg border border-border bg-canvas/45 p-3">
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
        <TooltipProvider><PromptInput
          accept="image/*,video/*,application/pdf,text/plain,.doc,.docx,.ppt,.pptx"
          multiple
          maxFiles={6}
          maxFileSize={20 * 1024 * 1024}
          onSubmit={({ text, files }) => {
            const attachmentNote = files.length ? `${text ? "\n\n" : ""}Use attached ${files.map((file) => file.filename ?? "file").join(", ")}.` : "";
            ask(`${text}${attachmentNote}`);
          }}
          className="[&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-lift [&_[data-slot=input-group]]:focus-within:border-brand"
        >
          <ComposerAttachments />
          <PromptInputTextarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to refine this content…"
            className="min-h-20 px-4 py-3 text-[13px]"
          />
          <PromptInputFooter className="border-t border-border/60 px-2.5 pb-2.5 pt-2">
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger className="size-8 rounded-md border border-border bg-background shadow-card" tooltip="Add photos, video, or files"><Plus size={17} /></PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent className="w-52 p-1.5">
                  <AttachmentMenuItem icon={<Image size={15} />} label="Add photos" />
                  <AttachmentMenuItem icon={<Video size={15} />} label="Add video" />
                  <AttachmentMenuItem icon={<Paperclip size={15} />} label="Add files" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">Photos, video, or files</span>
            </PromptInputTools>
            <PromptInputSubmit status="ready" className="size-9 rounded-md bg-foreground text-background hover:bg-foreground/90" disabled={!input.trim()} />
          </PromptInputFooter>
        </PromptInput></TooltipProvider>
        <p className="mt-2 text-center text-[10.5px] text-muted-foreground">Review every suggestion before it changes your content.</p>
      </div>
    </aside>
    </div>
  );
}

function AttachmentMenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  const attachments = usePromptInputAttachments();
  return <PromptInputActionMenuItem onSelect={(event) => { event.preventDefault(); attachments.openFileDialog(); }}>{icon}{label}</PromptInputActionMenuItem>;
}
