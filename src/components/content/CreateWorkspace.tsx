import { useMemo, useState } from "react";
import { Check, Mail, MessageSquare, Plus, Search } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Sparkle } from "@/components/ai/Sparkle";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";
import { AiMark, OriginMarker, StatusBadge, fill } from "./shared";
import { publishApproved, useLibrary, type LibraryCampaign } from "@/lib/contentLibrary";

const FILTERS = ["All", "Email", "Text", "AI generated", "Manually edited", "Needs review", "Approved"] as const;
type Filter = (typeof FILTERS)[number];

function matches(c: LibraryCampaign, f: Filter) {
  switch (f) {
    case "Email": return c.channels.includes("email");
    case "Text": return c.channels.includes("text");
    case "AI generated": return c.origin !== "manual";
    case "Manually edited": return c.origin === "manual" || c.origin === "ai-edited";
    case "Needs review": return c.status === "Needs review";
    case "Approved": return c.status === "Approved";
    default: return true;
  }
}

export function CreateWorkspace() {
  const { campaigns } = useLibrary();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [studio, setStudio] = useState(false);
  const [open, setOpen] = useState<{ id: string; ai: boolean } | null>(null);
  const [manualMenu, setManualMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<number | null>(null);
  const [freshAi, setFreshAi] = useState(false);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return campaigns.filter((c) => matches(c, filter)).filter((c) => {
      if (!t) return true;
      const hay = [c.name, c.kind, ...c.channels, "direct", "ota", c.content.direct.text, c.content.ota.text, c.content.direct.email.body, c.content.direct.email.subject, c.content.ota.email.body].join(" ").toLowerCase();
      return hay.includes(t);
    });
  }, [campaigns, q, filter]);

  const approved = campaigns.filter((c) => c.status === "Approved");
  const needsReview = campaigns.filter((c) => c.status === "Needs review").length;

  return (
    <MarketingShell title="Content Library">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header — create your way */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="pointer-events-none absolute inset-0 ai-surface opacity-80" />
          <div className="pointer-events-none absolute inset-0 ai-grid opacity-50 [mask-image:linear-gradient(90deg,transparent,black)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Create your way</p>
              <h2 className="mt-1 text-[26px] font-semibold tracking-tight text-card-foreground">Content Library</h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">Create, edit and manage the content your hotel sends to guests.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button onClick={() => setManualMenu((v) => !v)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2.5 text-[13px] font-semibold text-card-foreground hover:border-foreground/30">
                  <Plus size={15} />Create manually
                </button>
                {manualMenu && (
                  <div className="absolute right-0 top-full z-20 mt-1 max-h-72 w-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-float">
                    <p className="px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Write content for</p>
                    {campaigns.map((c) => (
                      <button key={c.id} onClick={() => { setManualMenu(false); setOpen({ id: c.id, ai: false }); }} className="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-[12.5px] hover:bg-muted">
                        {c.name}<span className="text-[10.5px] text-muted-foreground">{c.kind.replace("Automated ", "")}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setStudio(true)} className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold ai-button ai-pulse">
                <Sparkle size={15} className="ai-twinkle" />Create with Directful AI
              </button>
            </div>
          </div>
        </div>

        {freshAi && (
          <div className="ai-rise mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-card ai-edge">
            <AiMark size={28} />
            <p className="min-w-0 flex-1 text-[13px] text-card-foreground"><strong>Your new content is in place.</strong> {needsReview} campaigns are ready for review — open one to compare, edit or refine it with AI.</p>
            <button onClick={() => setFilter("Needs review")} className="rounded-sm border border-brand/40 px-3 py-1.5 text-[12px] font-semibold text-brand hover:bg-brand-soft">Show what needs review</button>
          </div>
        )}

        {/* Search + filters */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative md:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns or content…" className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand" />
          </label>
          <div className="flex gap-1 overflow-x-auto">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-sm px-2.5 py-1.5 text-[12px] font-medium transition-colors ${filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {f === "AI generated" && <Sparkle size={10} className="mr-1 inline" />}{f}
              </button>
            ))}
          </div>
        </div>

        {/* Library */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c, i) => (
            <CampaignCard key={c.id} c={c} index={i} onEdit={(ai) => setOpen({ id: c.id, ai })} />
          ))}
          {!list.length && <p className="col-span-full py-16 text-center text-[13px] text-muted-foreground">No campaigns match “{q || filter}”.</p>}
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

      {studio && <AiCreateStudio onClose={() => setStudio(false)} onReview={() => { setStudio(false); setFreshAi(true); setFilter("All"); }} />}
      {open && <ReviewWorkspace id={open.id} openAi={open.ai} onClose={() => setOpen(null)} />}
    </MarketingShell>
  );
}

function CampaignCard({ c, index, onEdit }: { c: LibraryCampaign; index: number; onEdit: (ai: boolean) => void }) {
  const isAi = c.origin !== "manual";
  const quote = c.channels.includes("email") ? `${c.content.direct.email.heading}. ${c.content.direct.email.body}` : c.content.direct.text;
  return (
    <article
      style={{ animationDelay: `${index * 40}ms` }}
      className={`ai-rise group relative flex flex-col rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift ${isAi ? "bg-card shadow-card ai-edge" : "border border-border bg-card shadow-card"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-card-foreground">{c.name}</h3>
        <span className="shrink-0 text-[10.5px] font-medium text-muted-foreground">{c.kind}</span>
      </div>
      <p className="mt-2.5 line-clamp-3 min-h-[3.9rem] text-[13px] italic leading-relaxed text-card-foreground/80">“{fill(quote)}”</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {c.channels.map((ch) => (
          <span key={ch} className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            {ch === "email" ? <Mail size={11} /> : <MessageSquare size={11} />}{ch}
          </span>
        ))}
        <span className="ml-1 text-[11px] text-muted-foreground">Direct <Check size={11} className="inline text-brand" /> · OTA <Check size={11} className="inline text-brand" /></span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-2"><OriginMarker origin={c.origin} /><span className="text-[11px] text-muted-foreground">· {c.updated === "Today" ? "Updated today" : `Last edited ${c.updated}`}</span></span>
        <StatusBadge status={c.status} />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onEdit(false)} className="flex-1 rounded-sm bg-foreground px-3 py-2 text-[12.5px] font-semibold text-background hover:opacity-90">
          {c.status === "Needs review" ? "Review" : "Edit content"}
        </button>
        <button onClick={() => onEdit(true)} className="inline-flex items-center gap-1.5 rounded-sm border border-brand/35 bg-brand-soft/60 px-3 py-2 text-[12.5px] font-semibold text-brand transition-all hover:border-brand hover:shadow-[0_0_0_3px_color-mix(in_oklch,var(--brand)_14%,transparent)]">
          <Sparkle size={12} className="group-hover:ai-twinkle" />Edit with AI
        </button>
      </div>
    </article>
  );
}
