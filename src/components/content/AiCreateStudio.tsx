import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarRange, Check, FileSpreadsheet, FileText, Image, Loader2, Paperclip, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuItem, PromptInputActionMenuTrigger, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools, usePromptInputAttachments, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { AiMark } from "./shared";
import { CONTEXT_SOURCES, MONTHS, generateAll, ideasFor, parseTimeframe, readDirection, useLibrary, type Direction } from "@/lib/contentLibrary";

type Phase = "setup" | "discovery" | "plan" | "generating" | "ready";
const NOW = 8;
const STEPS = ["Understanding your hotel", "Reviewing existing content", "Connecting your uploaded context", "Finding timely opportunities", "Writing for Direct and OTA guests", "Preparing Email and Text previews"];

function ComposerAttachments() {
  const { files, remove } = usePromptInputAttachments();
  if (!files.length) return null;
  return <div className="flex gap-2 overflow-x-auto px-3 pt-3">{files.map((file) => <div key={file.id} className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-muted/45 px-2.5 py-2 text-[11.5px] text-card-foreground"><FileText size={13} className="text-brand" /><span className="max-w-36 truncate">{file.filename ?? "Attachment"}</span><button type="button" aria-label={`Remove ${file.filename ?? "attachment"}`} onClick={() => remove(file.id)} className="text-muted-foreground hover:text-foreground"><X size={13} /></button></div>)}</div>;
}

export function AiCreateStudio({ onClose, onReview }: { onClose: () => void; onReview: () => void }) {
  const { campaigns } = useLibrary();
  const [phase, setPhase] = useState<Phase>("setup");
  const [range, setRange] = useState({ s: NOW, e: NOW + 2 });
  const [direction, setDirection] = useState<Direction>({ tone: ["warm"], avoid: [], notes: [] });
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [step, setStep] = useState(0);
  const ideas = useMemo(() => ideasFor(range.s, range.e), [range]);
  const rangeLabel = `${MONTHS[range.s]} 2026 → ${MONTHS[range.e]} 2026`;

  useEffect(() => { const handler = (e: KeyboardEvent) => e.key === "Escape" && phase !== "generating" && onClose(); window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [onClose, phase]);
  useEffect(() => { if (phase !== "generating") return; if (step < STEPS.length) { const timer = window.setTimeout(() => setStep((v) => v + 1), 620); return () => window.clearTimeout(timer); } const timer = window.setTimeout(() => setPhase("ready"), 450); return () => window.clearTimeout(timer); }, [phase, step]);

  const submit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text && !message.files.length) return;
    const parsed = parseTimeframe(text);
    if (parsed) setRange(parsed);
    if (text) setDirection((value) => readDirection(text, value));
    const attachmentNote = message.files.length ? ` I’ll also use ${message.files.length} attached file${message.files.length === 1 ? "" : "s"} as hotel context.` : "";
    setMessages((value) => [...value, { role: "user", text: text || `Use the ${message.files.length} attached file${message.files.length === 1 ? "" : "s"}.` }, { role: "assistant", text: `${parsed ? `I updated the content period to ${MONTHS[parsed.s]}–${MONTHS[parsed.e]}. ` : ""}I’ll carry that direction across the plan.${attachmentNote}` }]);
  };
  const generate = () => { generateAll(ideas, direction, rangeLabel); setStep(0); setPhase("generating"); };

  return <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-canvas">
    <div className="pointer-events-none absolute inset-0 ai-grid opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
    <header className="relative flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md sm:px-6"><div className="flex items-center gap-3"><AiMark size={32} live={phase === "generating"} /><div><p className="text-[13.5px] font-semibold text-card-foreground">Directful AI</p><p className="text-[11px] text-muted-foreground">Content planner · Holiday Inn Times Square</p></div></div><Button variant="ghost" size="icon" onClick={onClose} disabled={phase === "generating"} aria-label="Close AI planner"><X /></Button></header>

    {phase === "generating" || phase === "ready" ? <Generation phase={phase} step={step} total={campaigns.length} onReview={onReview} /> : <>
      <Conversation className="relative min-h-0"><ConversationContent className="mx-auto w-full max-w-4xl gap-6 px-4 pb-8 pt-9 sm:px-6 sm:pt-12">
        <section className="text-center"><span className="ai-float inline-block"><AiMark size={54} live /></span><h2 className="mt-5 font-display text-[32px] font-semibold text-card-foreground sm:text-[40px]">Let’s personalize your guest content</h2><p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">Reach the right guest at the right moment with messages shaped around your hotel, season, and booking journey.</p></section>

        <Message from="assistant"><MessageContent><MessageResponse>{"First, choose when this content should run. You can also type a date range below — for example, “October to December.”"}</MessageResponse></MessageContent></Message>
        <section className="rounded-lg border border-border bg-card p-5 shadow-card"><div className="flex items-center gap-2"><CalendarRange size={17} className="text-brand" /><p className="text-[13px] font-semibold text-card-foreground">Content timeframe</p></div><div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-[11px] font-medium text-muted-foreground">From <select value={range.s} onChange={(e) => setRange((r) => ({ s: Number(e.target.value), e: Math.max(Number(e.target.value), r.e) }))} className="ml-2 h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-semibold text-card-foreground">{MONTHS.map((m, i) => i >= NOW && <option key={m} value={i}>{m} 2026</option>)}</select></label><ArrowRight size={14} className="text-muted-foreground" /><label className="text-[11px] font-medium text-muted-foreground">Until <select value={range.e} onChange={(e) => setRange((r) => ({ s: Math.min(r.s, Number(e.target.value)), e: Number(e.target.value) }))} className="ml-2 h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-semibold text-card-foreground">{MONTHS.map((m, i) => i >= NOW && <option key={m} value={i}>{m} 2026</option>)}</select></label><Button variant="brand" className="ml-auto" onClick={() => setPhase("discovery")}>Explore this period <ArrowRight /></Button></div></section>

        {phase !== "setup" && <Message from="assistant"><MessageContent><MessageResponse>{`I found ${ideas.length} useful signals for ${rangeLabel}. I’ll use them selectively, keeping the guest journey more important than the calendar.`}</MessageResponse></MessageContent></Message>}
        {phase !== "setup" && <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ideas.slice(0, 5).map((idea) => <article key={idea.id} className="rounded-md border border-border bg-card p-4 shadow-card"><div className="flex items-start justify-between gap-2"><span className="text-[22px]">{idea.emoji}</span><span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{idea.group}</span></div><p className="mt-3 text-[13px] font-semibold text-card-foreground">{idea.name}</p><p className="mt-1 text-[11.5px] text-muted-foreground">{idea.fit}</p></article>)}</section>}

        {messages.map((message, i) => <Message key={`${message.role}-${i}`} from={message.role}><MessageContent><MessageResponse>{message.text}</MessageResponse></MessageContent></Message>)}

        {phase === "plan" && <><Message from="assistant"><MessageContent><MessageResponse>{"Here is the content plan. Review it before I generate anything."}</MessageResponse></MessageContent></Message><section className="rounded-lg border border-brand/30 bg-card p-5 shadow-lift"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10.5px] font-semibold uppercase text-brand">Plan ready for review</p><h3 className="mt-1 text-[18px] font-semibold text-card-foreground">{rangeLabel}</h3></div><span className="rounded-sm bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand">{campaigns.length} campaigns</span></div><dl className="mt-5 grid gap-3 text-[12px] sm:grid-cols-2">{[["Guests", "Direct + OTA"], ["Channels", "Email + Text"], ["Voice", direction.tone.join(", ")], ["Context", `${CONTEXT_SOURCES.length} hotel signals`]].map(([k, v]) => <div key={k} className="border-t border-border pt-3"><dt className="text-muted-foreground">{k}</dt><dd className="mt-1 font-semibold capitalize text-card-foreground">{v}</dd></div>)}</dl><div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setPhase("discovery")}>Adjust plan</Button><Button variant="brand" onClick={generate}><Check />Approve plan</Button></div></section></>}
        {phase === "discovery" && <div className="flex justify-end"><Button variant="brand" onClick={() => setPhase("plan")}>Review plan <ArrowRight /></Button></div>}
      </ConversationContent><ConversationScrollButton /></Conversation>

      <div className="relative border-t border-border bg-card/90 px-4 py-3 backdrop-blur-md"><div className="mx-auto max-w-4xl"><TooltipProvider><PromptInput accept="image/*,video/*,.pdf,.doc,.docx,.csv,.xls,.xlsx" multiple maxFiles={8} onSubmit={submit} className="rounded-lg shadow-lift"><ComposerAttachments /><PromptInputTextarea placeholder="Tell Directful AI what matters, or add a document, spreadsheet, image, or video…" /><PromptInputFooter><PromptInputTools><PromptInputActionMenu><PromptInputActionMenuTrigger tooltip="Add context" /><PromptInputActionMenuContent><PromptInputActionAddAttachments label="Upload files"><Paperclip />Upload files</PromptInputActionAddAttachments><PromptInputActionMenuItem><FileSpreadsheet />Spreadsheet or CSV</PromptInputActionMenuItem><PromptInputActionMenuItem><FileText />Document</PromptInputActionMenuItem><PromptInputActionMenuItem><Image />Image</PromptInputActionMenuItem><PromptInputActionMenuItem><Video />Video</PromptInputActionMenuItem></PromptInputActionMenuContent></PromptInputActionMenu><span className="hidden text-[11px] text-muted-foreground sm:inline">Files stay with this content plan</span></PromptInputTools><PromptInputSubmit status="ready" /></PromptInputFooter></PromptInput></TooltipProvider></div></div>
    </>}
  </div>;
}

function Generation({ phase, step, total, onReview }: { phase: Phase; step: number; total: number; onReview: () => void }) {
  const ready = phase === "ready";
  return <main className="relative grid min-h-0 flex-1 place-items-center overflow-y-auto px-5 py-10"><section className="w-full max-w-3xl rounded-lg border border-border bg-card p-6 shadow-float sm:p-9"><div className="flex items-center gap-4"><AiMark size={48} live={!ready} /><div><p className="text-[11px] font-semibold uppercase text-brand">{ready ? "Generation complete" : "Building your content"}</p><h2 className="font-display text-[25px] font-semibold text-card-foreground">{ready ? "Your campaign drafts are ready" : STEPS[Math.min(step, STEPS.length - 1)]}</h2></div></div><div className="mt-7 grid gap-2 sm:grid-cols-2">{STEPS.map((label, i) => <div key={label} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] ${i < step || ready ? "border-brand/20 bg-brand-soft/45 text-card-foreground" : i === step ? "border-brand text-brand" : "border-border text-muted-foreground"}`}>{i < step || ready ? <Check size={13} /> : i === step ? <Loader2 size={13} className="animate-spin" /> : <span className="size-3" />}{label}</div>)}</div>{ready && <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><p className="text-[13px] text-muted-foreground"><strong className="text-card-foreground">{total} campaigns</strong> are ready for guest-by-guest review.</p><Button variant="brand" onClick={onReview}>Review generated content <ArrowRight /></Button></div>}</section></main>;
}