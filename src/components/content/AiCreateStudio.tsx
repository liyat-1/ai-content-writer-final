import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarRange, Check, Expand, FileSpreadsheet, FileText, Image, Images, Lightbulb, Loader2, MapPin, Minimize2, Paperclip, Sparkles, Video, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuItem, PromptInputActionMenuTrigger, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools, usePromptInputAttachments, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { AiMark, IMAGES } from "./shared";
import { ComposerThumbs, SentThumbs, type SentFile } from "@/components/ai/AttachmentThumbs";
import { ACCEPT_ALL, prepareAttachments } from "@/lib/attachments";
import { planAssist, type PlanEvent } from "@/lib/ai.functions";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CONTEXT_SOURCES, MEDIA_LIBRARY, MONTHS, generateAll, ideasFor, parseTimeframe, readDirection, useLibrary, type Direction, type Idea } from "@/lib/contentLibrary";

type Phase = "setup" | "discovery" | "plan" | "generating" | "ready";
const NOW = 8;
const STEPS = ["After Last Visit", "3 Months", "6 Months", "9 Months", "12 Months", "15 Months+", "Booking Confirmation", "Pre-Arrival", "Welcome Message", "Post-Stay Thank You"];

function ComposerAttachments() {
  const { files, remove } = usePromptInputAttachments();
  if (!files.length) return null;
  return <div className="flex gap-2 overflow-x-auto px-3 pt-3">{files.map((file) => <div key={file.id} className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-muted/45 px-2.5 py-2 text-[11.5px] text-card-foreground"><FileText size={13} className="text-brand" /><span className="max-w-36 truncate">{file.filename ?? "Attachment"}</span><Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${file.filename ?? "attachment"}`} onClick={() => remove(file.id)}><X size={13} /></Button></div>)}</div>;
}

export function AiCreateStudio({ onClose, onMinimize, minimized = false, onReview, onPublish }: { onClose: () => void; onMinimize: () => void; minimized?: boolean; onReview: () => void; onPublish: (range: string) => void }) {
  const { campaigns } = useLibrary();
  const [phase, setPhase] = useState<Phase>("setup");
  const [range, setRange] = useState({ s: NOW, e: NOW + 2 });
  const [direction, setDirection] = useState<Direction>({ tone: ["warm"], avoid: [], notes: [] });
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; files?: SentFile[] }[]>([])
  const [thinking, setThinking] = useState(false);
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState<Idea[]>([]);
  const ideas = useMemo(() => {
    const own = uploaded.filter((i) => i.month >= range.s && i.month <= range.e);
    const ownNames = new Set(own.map((i) => i.name.toLowerCase()));
    return [...own, ...ideasFor(range.s, range.e).filter((i) => !ownNames.has(i.name.toLowerCase()))];
  }, [range, uploaded]);
  const rangeLabel = `${MONTHS[range.s]} 2026 → ${MONTHS[range.e]} 2026`;

  useEffect(() => { if (phase !== "generating") return; if (step < STEPS.length) { const timer = window.setTimeout(() => setStep((value) => value + 1), 460); return () => window.clearTimeout(timer); } const timer = window.setTimeout(() => onReview(), 650); return () => window.clearTimeout(timer); }, [phase, step, onReview]);

  const submit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text && !message.files.length) return;
    const parsed = parseTimeframe(text);
    if (parsed) setRange(parsed);
    if (text) setDirection((value) => readDirection(text, value));
    setMessages((value) => [...value, { role: "user", text: text || "Use these files.", files: message.files.map((f) => ({ name: f.filename ?? "file", mediaType: f.mediaType ?? "", preview: f.mediaType?.startsWith("image/") ? f.url : undefined })) }]);
    setThinking(true);
    void (async () => {
      const prepared = await prepareAttachments(message.files);
      setMessages((value) => value.map((m, i) => i === value.length - 1 && m.files ? { ...m, files: m.files.map((f, j) => ({ ...f, preview: prepared[j]?.dataUrl?.startsWith("data:image") ? prepared[j].dataUrl : f.preview })) } : m));
      const res = await planAssist({ data: { text, files: prepared, history: messages.map((m) => ({ role: m.role, text: m.text })), range: rangeLabel, plan: ideas.map((i) => i.name) } }).catch(() => ({ reply: "", events: [], startMonth: null, endMonth: null, error: "The AI couldn't be reached. Please try again." }));
      setThinking(false);
      if (res.error) { setMessages((value) => [...value, { role: "assistant", text: `⚠️ ${res.error}` }]); return; }
      const events = res.events.map(toIdea).filter((e): e is Idea => e !== null);
      if (events.length) { setUploaded((value) => [...value.filter((v) => !events.some((e) => e.name === v.name)), ...events]); setPhase((p) => p === "setup" ? "discovery" : p); }
      const s0 = res.startMonth, e0 = res.endMonth;
      const future = events.map((e) => e.month).filter((m) => m >= NOW);
      if (!parsed && s0 !== null && e0 !== null && s0 >= 0 && e0 <= 11 && s0 <= e0) setRange({ s: Math.max(NOW, s0), e: e0 });
      else if (!parsed && future.length) setRange((r) => ({ s: Math.min(r.s, ...future), e: Math.max(r.e, ...future) }));
      setMessages((value) => [...value, { role: "assistant", text: res.reply || "Done — I’ve reflected that in the plan." }]);
    })();
  };
  const generate = () => { generateAll(ideas, direction, rangeLabel); setStep(0); setPhase("generating"); };

  if (minimized) {
    return <section aria-label="AI content planner" className="ai-rise flex min-h-[620px] max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lift">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3"><AiMark size={34} live={phase === "generating"} /><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-[13.5px] font-semibold text-card-foreground">Content assistant</p><span className="size-1.5 shrink-0 rounded-full bg-emerald-500" /></div><p className="truncate text-[11px] text-muted-foreground">{rangeLabel} · Holiday Inn Times Square</p></div></div>
        <div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" onClick={onMinimize} aria-label="Expand AI planner"><Expand size={16} /></Button><Button variant="ghost" size="icon" onClick={onClose} disabled={phase === "generating"} aria-label="Close AI planner"><X size={16} /></Button></div>
      </header>

      {phase === "generating" || phase === "ready" ? <CompactGeneration phase={phase} step={step} total={campaigns.length} rangeLabel={rangeLabel} onReview={onReview} onPublish={() => onPublish(rangeLabel)} /> : <>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="flex items-start gap-3"><AiMark size={30} /><div><h2 className="text-[18px] font-semibold leading-snug text-card-foreground">Shape your next guest release</h2><p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">I’ll keep the calendar visible while we plan the timing, voice, and seasonal moments.</p></div></div>

          <section className="mt-5 border-y border-border py-4"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground"><CalendarRange size={14} className="text-brand" />Release window</p><span className="text-[11px] font-semibold text-brand">{MONTHS[range.s]}–{MONTHS[range.e]}</span></div><div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"><select aria-label="Release starts" value={range.s} onChange={(event) => setRange((current) => ({ s: Number(event.target.value), e: Math.max(Number(event.target.value), current.e) }))} className="min-w-0 rounded-md border border-border bg-background px-2.5 py-2 text-[11.5px] font-semibold text-card-foreground">{MONTHS.map((month, index) => index >= NOW && <option key={month} value={index}>{month} 2026</option>)}</select><ArrowRight size={13} className="shrink-0 text-muted-foreground" /><select aria-label="Release ends" value={range.e} onChange={(event) => setRange((current) => ({ s: Math.min(current.s, Number(event.target.value)), e: Number(event.target.value) }))} className="min-w-0 rounded-md border border-border bg-background px-2.5 py-2 text-[11.5px] font-semibold text-card-foreground">{MONTHS.map((month, index) => index >= NOW && <option key={month} value={index}>{month} 2026</option>)}</select></div></section>

          {phase === "setup" ? <><p className="mt-5 text-[10.5px] font-semibold uppercase text-muted-foreground">Start with a direction</p><div className="mt-2 grid grid-cols-2 gap-2"><Button variant="outline" className="h-auto justify-start px-3 py-3 text-left" onClick={() => { setDirection((value) => readDirection("Make it feel warm and local", value)); setPhase("discovery"); }}><WandSparkles size={15} className="text-brand" /><span className="text-[11.5px]">Warm & local</span></Button><Button variant="outline" className="h-auto justify-start px-3 py-3 text-left" onClick={() => { setDirection((value) => readDirection("Focus on returning guests", value)); setPhase("discovery"); }}><Lightbulb size={15} className="text-brand" /><span className="text-[11.5px]">Return stays</span></Button></div><Button variant="brand" className="mt-4 w-full" onClick={() => setPhase("discovery")}>Build my plan <ArrowRight size={14} /></Button></> : <>
            <div className="mt-5 flex items-center justify-between gap-3"><p className="text-[10.5px] font-semibold uppercase text-muted-foreground">Seasonal opportunities</p><span className="text-[10.5px] text-muted-foreground">{ideas.length} found</span></div><div className="mt-2 space-y-2">{ideas.slice(0, 3).map((idea) => <article key={idea.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-canvas/50 p-3"><span className="text-lg">{idea.emoji}</span><div className="min-w-0"><p className="truncate text-[12px] font-semibold text-card-foreground">{idea.name}</p><p className="truncate text-[10.5px] text-muted-foreground">{idea.fit}</p></div><span className="text-[10px] text-muted-foreground">{idea.date}</span></article>)}</div>
            {messages.map((message, index) => <div key={`${message.role}-${index}`}><SentThumbs files={message.files} /><Message from={message.role} className="mt-4"><MessageContent className={message.role === "assistant" ? "bg-transparent p-0 text-[12px]" : "bg-primary text-primary-foreground"}><MessageResponse>{message.text}</MessageResponse></MessageContent></Message></div>)}{thinking && <Shimmer className="mt-3 text-[12px]">Reading your files and prompt…</Shimmer>}
            <Button variant="brand" className="mt-4 w-full" onClick={() => phase === "discovery" ? setPhase("plan") : generate()}>{phase === "discovery" ? "Review full plan" : "Generate content"}<ArrowRight size={14} /></Button>
          </>}
        </div>
        <CompactComposer onSubmit={submit} />
      </>}
    </section>;
  }

  return <section aria-label="AI content planner" className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-brand/20 bg-card shadow-lift">
    <div className="pointer-events-none absolute inset-0 ai-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
    <header className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md sm:px-6"><div className="flex min-w-0 items-center gap-3"><AiMark size={34} live={phase === "generating"} /><div className="min-w-0"><p className="truncate text-[13.5px] font-semibold text-card-foreground">Edit content with AI</p><p className="truncate text-[11px] text-muted-foreground">Holiday Inn Times Square</p></div></div><div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" onClick={onMinimize} aria-label={minimized ? "Expand AI planner" : "Minimize AI planner"}><Minimize2 /></Button><Button variant="ghost" size="icon" onClick={onClose} disabled={phase === "generating"} aria-label="Close AI planner"><X /></Button></div></header>

    {phase === "generating" || phase === "ready" ? <Generation phase={phase} step={step} total={campaigns.length} rangeLabel={rangeLabel} onReview={onReview} onPublish={() => onPublish(rangeLabel)} /> : <>
      <Conversation className="relative h-[calc(100vh-20rem)] min-h-[470px]"><ConversationContent className="mx-auto w-full max-w-5xl gap-6 px-4 pb-8 pt-10 sm:px-6">
        <section className="text-center"><span className="ai-float inline-block"><AiMark size={50} live /></span><h2 className="mt-4 font-display text-[30px] font-semibold text-card-foreground sm:text-[38px]">Let’s personalize your guest content</h2><p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">Reach the right guests at the right moment with a release shaped around your hotel, season, and booking journey.</p></section>
        <section className="rounded-lg border border-border bg-card p-5 shadow-card"><div className="flex items-center gap-2"><CalendarRange size={17} className="text-brand" /><p className="text-[13px] font-semibold text-card-foreground">When should this content run?</p></div><div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-[11px] font-medium text-muted-foreground">From <select value={range.s} onChange={(event) => setRange((current) => ({ s: Number(event.target.value), e: Math.max(Number(event.target.value), current.e) }))} className="ml-2 h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-semibold text-card-foreground">{MONTHS.map((month, index) => index >= NOW && <option key={month} value={index}>{month} 2026</option>)}</select></label><ArrowRight size={14} className="text-muted-foreground" /><label className="text-[11px] font-medium text-muted-foreground">Until <select value={range.e} onChange={(event) => setRange((current) => ({ s: Math.min(current.s, Number(event.target.value)), e: Number(event.target.value) }))} className="ml-2 h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-semibold text-card-foreground">{MONTHS.map((month, index) => index >= NOW && <option key={month} value={index}>{month} 2026</option>)}</select></label><Button variant="brand" className="ml-auto" onClick={() => setPhase("discovery")}>Build my plan <ArrowRight /></Button></div></section>
        {phase !== "setup" && <Message from="assistant"><MessageContent><MessageResponse>{`I’ve prepared the strongest opportunities for ${rangeLabel}. They support the guest journey instead of overwhelming it.`}</MessageResponse></MessageContent></Message>}
        {phase !== "setup" && <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ideas.slice(0, 5).map((idea) => <article key={idea.id} className="overflow-hidden rounded-md border border-border bg-card shadow-card"><div className="flex h-24 items-end bg-brand-soft p-3"><span className="text-3xl">{idea.emoji}</span></div><div className="p-3"><div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold text-card-foreground">{idea.name}</p><span className="text-[10px] text-muted-foreground">{idea.date}</span></div><p className="mt-1 text-[11.5px] text-muted-foreground">{idea.fit}</p></div></article>)}</section>}
        {messages.map((message, index) => <div key={`${message.role}-${index}`}><SentThumbs files={message.files} /><Message from={message.role}><MessageContent><MessageResponse>{message.text}</MessageResponse></MessageContent></Message></div>)}{thinking && <Shimmer className="mt-3 text-[12px]">Reading your files and prompt…</Shimmer>}
        {phase === "plan" && <><Message from="assistant"><MessageContent><MessageResponse>Here is exactly how I’ll build the release. You can adjust it or start generating when it looks right.</MessageResponse></MessageContent></Message><Plan rangeLabel={rangeLabel} campaigns={campaigns.length} ideas={ideas} tone={direction.tone} onAdjust={() => setPhase("discovery")} onGenerate={generate} /></>}
        {phase === "discovery" && <div className="flex justify-end"><Button variant="brand" onClick={() => setPhase("plan")}>Review full plan <ArrowRight /></Button></div>}
      </ConversationContent><ConversationScrollButton /></Conversation>
      <Composer onSubmit={submit} />
    </>}
  </section>;
}

function CompactComposer({ onSubmit }: { onSubmit: (message: PromptInputMessage) => void }) {
  return <div className="border-t border-border bg-card p-3.5"><TooltipProvider><PromptInput accept={ACCEPT_ALL} multiple maxFiles={8} onSubmit={onSubmit} className="[&_[data-slot=input-group]]:rounded-lg [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-background [&_[data-slot=input-group]]:shadow-card [&_[data-slot=input-group]]:focus-within:border-brand"><ComposerThumbs /><PromptInputTextarea placeholder="Ask AI to adjust the plan…" className="min-h-16 px-3.5 py-3 text-[12.5px]" /><PromptInputFooter className="border-t border-border/60 px-2 pb-2 pt-1.5"><PromptInputTools><PromptInputActionMenu><PromptInputActionMenuTrigger tooltip="Add photos, video, or files" className="size-8 rounded-md border border-border bg-card" /><PromptInputActionMenuContent className="w-48"><CompactAttachmentItem icon={<Image size={14} />} label="Add photos" /><CompactAttachmentItem icon={<Video size={14} />} label="Add video" /><CompactAttachmentItem icon={<Paperclip size={14} />} label="Add files" /></PromptInputActionMenuContent></PromptInputActionMenu></PromptInputTools><PromptInputSubmit status="ready" className="size-8 rounded-md bg-foreground text-background hover:bg-foreground/90" /></PromptInputFooter></PromptInput></TooltipProvider></div>;
}

function CompactAttachmentItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  const attachments = usePromptInputAttachments();
  return <PromptInputActionMenuItem onSelect={() => { window.setTimeout(() => attachments.openFileDialog(), 50); }}>{icon}{label}</PromptInputActionMenuItem>;
}

function CompactGeneration({ phase, step, total, rangeLabel, onReview, onPublish }: { phase: Phase; step: number; total: number; rangeLabel: string; onReview: () => void; onPublish: () => void }) {
  const ready = phase === "ready";
  const current = STEPS[Math.min(step, STEPS.length - 1)];
  return <div className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 overflow-y-auto p-5"><AiMark size={42} live={!ready} /><p className="mt-5 text-[10.5px] font-semibold uppercase text-brand">{ready ? "Release ready" : `${Math.min(step + 1, STEPS.length)} of ${STEPS.length}`}</p><h2 className="mt-1 text-[22px] font-semibold leading-tight text-card-foreground">{ready ? rangeLabel : `Writing ${current}`}</h2><p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{ready ? `${total} campaigns are ready to review or publish.` : "Building Direct and OTA versions for Email and Text."}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${ready ? 100 : Math.min(100, step / STEPS.length * 100)}%` }} /></div><div className="mt-5 space-y-2">{STEPS.slice(Math.max(0, step - 1), Math.min(STEPS.length, step + 4)).map((label, index) => { const actual = Math.max(0, step - 1) + index; const complete = ready || actual < step; return <div key={label} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${actual === step && !ready ? "border-brand/40 bg-brand-soft/50" : "border-border bg-card"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-md ${complete ? "bg-brand text-brand-foreground" : actual === step ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"}`}>{complete ? <Check size={13} /> : actual === step ? <Loader2 size={13} className="animate-spin" /> : <span className="text-[10px]">{actual + 1}</span>}</span><p className="min-w-0 truncate text-[11.5px] font-medium text-card-foreground">{label}</p></div>; })}</div></div>{ready && <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-2"><Button variant="outline" onClick={onReview}>Review</Button><Button variant="brand" onClick={onPublish}>Publish <ArrowRight size={14} /></Button></div>}</div>;
}

function Plan({ rangeLabel, campaigns, ideas, tone, onAdjust, onGenerate }: { rangeLabel: string; campaigns: number; ideas: ReturnType<typeof ideasFor>; tone: string[]; onAdjust: () => void; onGenerate: () => void }) {
  return <section className="overflow-hidden rounded-lg border border-brand/30 bg-card shadow-lift"><div className="ai-surface border-b border-brand/15 p-5"><p className="text-[10.5px] font-semibold uppercase text-brand">Your release plan</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><h3 className="font-display text-[22px] font-semibold text-card-foreground">{rangeLabel}</h3><span className="rounded-sm bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand">{campaigns} campaigns · Direct + OTA</span></div></div><div className="grid gap-0 lg:grid-cols-2"><div className="border-b border-border p-5 lg:border-b-0 lg:border-r"><h4 className="flex items-center gap-2 text-[13px] font-semibold text-card-foreground"><MapPin size={15} className="text-brand" />Moments I’ll weave in</h4><div className="mt-3 space-y-2">{ideas.slice(0, 4).map((idea) => <div key={idea.id} className="flex items-center gap-3 rounded-md bg-muted/45 p-2.5"><span className="text-xl">{idea.emoji}</span><div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-card-foreground">{idea.name}</p><p className="truncate text-[10.5px] text-muted-foreground">{idea.fit}</p></div><span className="text-[10px] text-muted-foreground">{idea.date}</span></div>)}</div></div><div className="p-5"><h4 className="flex items-center gap-2 text-[13px] font-semibold text-card-foreground"><Images size={15} className="text-brand" />Creative direction</h4><div className="mt-3 grid grid-cols-3 gap-2">{MEDIA_LIBRARY.slice(0, 3).map((media) => <div key={media.id}><img src={IMAGES[media.image ?? "lobby"]} alt="" className="aspect-[4/3] w-full rounded-md object-cover" /><p className="mt-1 truncate text-[10px] text-muted-foreground">{media.name}</p></div>)}</div><ul className="mt-4 space-y-2 text-[11.5px] text-card-foreground"><li>• Warm Image + CTA template for seasonal emails</li><li>• Concise one-link text messages for mobile</li><li>• {tone.join(" + ")} voice, informed by winning return campaigns</li><li>• Hotel details, existing content, and {CONTEXT_SOURCES.length - 2} other signals</li></ul></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4"><p className="text-[11px] text-muted-foreground">Nothing changes until this release is published.</p><div className="flex gap-2"><Button variant="outline" onClick={onAdjust}>Adjust plan</Button><Button variant="brand" onClick={onGenerate}><Sparkles />Generate content</Button></div></div></section>;
}

function Composer({ onSubmit }: { onSubmit: (message: PromptInputMessage) => void }) {
  return <div className="relative border-t border-border bg-card/90 px-4 py-3 backdrop-blur-md"><div className="mx-auto max-w-4xl"><TooltipProvider><PromptInput accept={ACCEPT_ALL} multiple maxFiles={8} onSubmit={onSubmit} className="rounded-lg shadow-lift"><ComposerThumbs /><PromptInputTextarea placeholder="Add hotel context, instructions, or a date range…" /><PromptInputFooter><PromptInputTools><PromptInputActionMenu><PromptInputActionMenuTrigger tooltip="Add context" /><PromptInputActionMenuContent><CompactAttachmentItem icon={<FileSpreadsheet size={14} />} label="Events calendar (CSV / sheet)" /><CompactAttachmentItem icon={<FileText size={14} />} label="Document" /><CompactAttachmentItem icon={<Image size={14} />} label="Photos" /><CompactAttachmentItem icon={<Video size={14} />} label="Video" /></PromptInputActionMenuContent></PromptInputActionMenu><span className="hidden text-[11px] text-muted-foreground sm:inline">Documents, sheets, images, and video</span></PromptInputTools><PromptInputSubmit status="ready" /></PromptInputFooter></PromptInput></TooltipProvider></div></div>;
}

function Generation({ phase, step, total, rangeLabel, onReview, onPublish }: { phase: Phase; step: number; total: number; rangeLabel: string; onReview: () => void; onPublish: () => void }) {
  const ready = phase === "ready";
  return <main className="relative min-h-[560px] overflow-hidden p-5 sm:p-9"><div className="pointer-events-none absolute inset-0 ai-surface opacity-70" /><section className="relative mx-auto max-w-5xl"><div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr]"><div className="flex flex-col justify-center py-5"><AiMark size={58} live={!ready} /><p className="mt-5 text-[11px] font-semibold uppercase text-brand">{ready ? "Release ready" : `${Math.min(step + 1, STEPS.length)} of ${STEPS.length} campaigns`}</p><h2 className="mt-2 font-display text-[28px] font-semibold text-card-foreground sm:text-[36px]">{ready ? `Generated for ${rangeLabel}` : `Writing ${STEPS[Math.min(step, STEPS.length - 1)]}`}</h2><p className="mt-3 max-w-md text-[13px] leading-6 text-muted-foreground">{ready ? "Review any campaign you want, or publish the complete release now." : "Direct and OTA guest versions are being shaped for Email and Text, then checked against the seasonal plan."}</p><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.min(100, step / STEPS.length * 100)}%` }} /></div></div><div className="grid gap-2 sm:grid-cols-2">{STEPS.map((label, index) => <div key={label} className={`relative overflow-hidden rounded-md border p-3.5 transition-colors ${index < step || ready ? "border-brand/20 bg-card text-card-foreground" : index === step ? "border-brand bg-brand-soft text-brand shadow-card" : "border-border bg-card/60 text-muted-foreground"}`}>{index === step && !ready && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand [animation:ai-sweep_1.2s_ease-in-out_infinite]" />}<div className="flex items-start gap-3">{index < step || ready ? <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground"><Check size={13} /></span> : index === step ? <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-soft text-brand"><Loader2 size={14} className="animate-spin" /></span> : <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-semibold">{index + 1}</span>}<div><p className="text-[12.5px] font-semibold">{label}</p><p className="mt-1 text-[10.5px] opacity-75">{index < step || ready ? "Direct + OTA · Email + Text complete" : index === step ? "Writing guest-specific versions…" : "Queued"}</p></div></div></div>)}</div></div>{ready && <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-brand/25 bg-card p-5 shadow-lift"><span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand"><Sparkles size={18} /></span><div className="min-w-52 flex-1"><p className="text-[13px] font-semibold text-card-foreground">{total} campaigns are ready</p><p className="text-[11.5px] text-muted-foreground">Review is optional. Publishing makes the full release live for the selected timeframe.</p></div><Button variant="outline" onClick={onReview}>Review campaigns</Button><Button variant="brand" onClick={onPublish}>Publish release <ArrowRight /></Button></div>}</section></main>;
}

function toIdea(e: PlanEvent, index: number): Idea | null {
  const m = e.date?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m || !e.name) return null;
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { id: `ai-${index}-${e.name}`, group: e.kind === "holiday" ? "Holidays" : "Hotel events", emoji: e.kind === "holiday" ? "🎉" : "📅", name: e.name, date: `${MONTHS[month].slice(0, 3)} ${Number(m[3])}`, month, fit: e.note || "From your files" };
}
