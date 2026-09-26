import { useState } from "react";
import { Check, Mail, MessageSquare } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Sparkle } from "@/components/ai/Sparkle";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";
import { AiMark, OriginMarker, StatusBadge, fill } from "./shared";
import { Button } from "@/components/ui/button";
import { publishApproved, useLibrary, type Channel, type LibraryCampaign, type Segment } from "@/lib/contentLibrary";

export function CreateWorkspace() {
  const { campaigns } = useLibrary();
  const [studio, setStudio] = useState(false);
  const [open, setOpen] = useState<{ id: string; ai: boolean } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<number | null>(null);
  const [freshAi, setFreshAi] = useState(false);

  const approved = campaigns.filter((c) => c.status === "Approved");
  const needsReview = campaigns.filter((c) => c.status === "Needs review").length;

  return (
    <MarketingShell title="Content Library">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="relative overflow-hidden border-b border-border pb-5 pt-1 sm:pb-6">
          <div className="pointer-events-none absolute inset-0 ai-surface opacity-80" />
          <div className="pointer-events-none absolute inset-0 ai-grid opacity-50 [mask-image:linear-gradient(90deg,transparent,black)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Current guest communications</p>
              <h2 className="font-display mt-1 text-[30px] font-semibold text-card-foreground">Your campaigns</h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">Review what guests receive, edit it yourself, or ask Directful AI to rewrite it in place.</p>
            </div>
            <Button onClick={() => setStudio(true)} variant="brand" className="ai-pulse h-10">
                <Sparkle size={15} className="ai-twinkle" />Create with Directful AI
            </Button>
          </div>
        </div>

        {freshAi && (
          <div className="ai-rise mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-card ai-edge">
            <AiMark size={28} />
            <p className="min-w-0 flex-1 text-[13px] text-card-foreground"><strong>Your new content is in place.</strong> {needsReview} campaigns are ready for review — open one to compare, edit or refine it with AI.</p>
          </div>
        )}

        {/* Library */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c, i) => (
            <CampaignCard key={c.id} c={c} index={i} onEdit={(ai) => setOpen({ id: c.id, ai })} />
          ))}
        </div>
      </div>

      {/* Publish bar */}
      {approved.length > 0 && (
        <div className="ai-rise sticky bottom-0 z-20 border-t border-border bg-card/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <Check size={16} className="text-brand" />
            <p className="flex-1 text-[13px] text-card-foreground"><strong>{approved.length}</strong> approved campaign{approved.length > 1 ? "s" : ""} ready to publish</p>
            <button onClick={() => setPublishing(true)} className="rounded-sm bg-brand px-4 py-2 text-[12.5px] font-semibold text-brand-foreground">Publish content</button>
          </div>
        </div>
      )}
      {published !== null && (
        <div className="ai-rise fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-4 py-2.5 text-[13px] text-background shadow-float">
          Published {published} campaign{published > 1 ? "s" : ""}. You'll find the record under Content Library → Published.
        </div>
      )}

      <AlertDialog open={publishing} onOpenChange={setPublishing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You're publishing</AlertDialogTitle>
            <AlertDialogDescription>
              {approved.length} campaigns · {approved.reduce((n, c) => n + c.channels.length * 2, 0)} content pieces · Email + Text · Direct + OTA. This becomes the current content guests receive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-[12.5px]">{approved.map((c) => <li key={c.id} className="flex items-center gap-2"><Check size={12} className="text-brand" />{c.name}</li>)}</ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { const n = publishApproved(); setPublished(n); window.setTimeout(() => setPublished(null), 4000); }}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {studio && <AiCreateStudio onClose={() => setStudio(false)} onReview={() => { setStudio(false); setFreshAi(true); }} />}
      {open && <ReviewWorkspace id={open.id} openAi={open.ai} onClose={() => setOpen(null)} />}
    </MarketingShell>
  );
}

function CampaignCard({ c, index, onEdit }: { c: LibraryCampaign; index: number; onEdit: (ai: boolean) => void }) {
  const isAi = c.origin !== "manual";
  const [channel, setChannel] = useState<Channel>(c.channels[0]);
  const [segment, setSegment] = useState<Segment>("direct");
  const current = c.content[segment];
  const quote = channel === "email" ? `${current.email.heading}. ${current.email.body}` : current.text;
  const tab = (active: boolean) => `rounded-sm px-2 py-1 text-[10.5px] font-semibold transition-colors ${active ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-brand-soft hover:text-brand"}`;
  return (
    <article
      style={{ animationDelay: `${index * 40}ms` }}
      className={`ai-rise group relative flex min-h-[20rem] flex-col overflow-hidden rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift ${isAi ? "bg-card shadow-lift ai-edge" : "border border-border bg-card shadow-card"}`}
    >
      {isAi && <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-brand-soft/70 [mask-image:linear-gradient(black,transparent)]" />}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-card-foreground">{c.name}</h3>
        <span className="shrink-0 text-[10.5px] font-medium text-muted-foreground">{c.kind}</span>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-border/70 py-2">
        <div className="flex rounded-sm bg-muted/70 p-0.5">
        {c.channels.map((ch) => (
          <button key={ch} onClick={() => setChannel(ch)} className={tab(channel === ch)}>
            {ch === "email" ? <Mail size={11} /> : <MessageSquare size={11} />}{ch}
          </button>
        ))}
        </div>
        <div className="flex rounded-sm bg-muted/70 p-0.5">
          <button onClick={() => setSegment("direct")} className={tab(segment === "direct")}>Direct</button>
          <button onClick={() => setSegment("ota")} className={tab(segment === "ota")}>OTA</button>
        </div>
      </div>
      <div className="mt-3 min-h-[6rem] rounded-md bg-background/70 p-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-brand">{channel === "email" ? "Email preview" : "Text preview"} · {segment === "direct" ? "Direct guest" : "OTA guest"}</p>
        <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-card-foreground/80">“{fill(quote)}”</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-2"><OriginMarker origin={c.origin} /><span className="text-[11px] text-muted-foreground">· {c.updated === "Today" ? "Updated today" : `Last edited ${c.updated}`}</span></span>
        <StatusBadge status={c.status} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => onEdit(false)} variant="brand" size="sm" className="flex-1">
          {c.status === "Needs review" ? "Review" : "Edit content"}
        </Button>
        <Button onClick={() => onEdit(true)} variant="outline" size="sm" className="border-brand/35 text-brand hover:bg-brand-soft">
          <Sparkle size={12} className="group-hover:ai-twinkle" />Edit with AI
        </Button>
      </div>
    </article>
  );
}
