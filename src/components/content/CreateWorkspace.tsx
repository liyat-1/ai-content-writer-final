import { useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, FlaskConical, Mail, MessageSquare, Pencil, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
import { TestCampaignDialog } from "@/components/marketing/MarketingDialogs";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, STRATEGY_LABEL, lastEdit, strategyHasEmail, timeAgo, useMarketing, type MarketingCampaign } from "@/lib/marketing";
import { EDITOR_ID, MONTHS, publishApproved, useLibrary } from "@/lib/contentLibrary";
import { Sparkle } from "@/components/ai/Sparkle";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";

const START_MONTH = 8;
const GROUP_LABEL: Record<MarketingCampaign["group"], string> = {
  invites: "Automated Invites", transactional: "Automated Transactional", in_property: "In-Property Transactional",
};

function PublishedCard({ campaign, aiEdited, onEdit, onTest, onReview }: { campaign: MarketingCampaign; aiEdited: boolean; onEdit: () => void; onTest: () => void; onReview?: () => void }) {
  const edit = lastEdit(campaign);
  const hasEmail = strategyHasEmail(campaign.strategy);
  return (
    <article className={`flex min-h-[215px] flex-col overflow-hidden rounded-md border bg-card shadow-card transition-shadow hover:shadow-lift ${aiEdited ? "border-brand/45" : "border-border"}`}>
      {aiEdited && <div className="flex items-center gap-1.5 border-b border-brand/15 bg-brand-soft/60 px-4 py-2 text-[11px] font-semibold text-brand"><Sparkle size={12} />AI draft · ready for review</div>}
      <div className="flex-1 px-4 pt-4">
        <p className="text-[10px] font-semibold uppercase text-brand">{GROUP_LABEL[campaign.group]}</p>
        <h3 className="mt-1 text-[16px] font-semibold text-card-foreground">{campaign.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground"><Clock3 size={12} />{campaign.timing}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-[11px] text-card-foreground"><MessageSquare size={12} />Text</span>
          {hasEmail && <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-[11px] text-card-foreground"><Mail size={12} />Email</span>}
          <span className="rounded-sm bg-muted px-2 py-1 text-[11px] text-muted-foreground">Direct + OTA</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{STRATEGY_LABEL[campaign.strategy]}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 px-4 pb-3 text-[11px] text-muted-foreground">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand">{edit?.by?.split(" ").map((n) => n[0]).join("") ?? CURRENT_USER.initials}</span>
        <span className="truncate">{edit ? `${edit.by} · updated ${timeAgo(edit.at)}` : "Original content · year-round"}</span>
      </div>
      <div className="flex gap-2 border-t border-border p-2">
        <Button variant="ghost" size="sm" onClick={onTest}><FlaskConical size={14} />Test</Button>
        <Button variant="brand" size="sm" className="flex-1" onClick={onReview ?? onEdit}>{onReview ? <><Check size={14} />Review</> : <><Pencil size={14} />Edit content</>}</Button>
      </div>
    </article>
  );
}

export function CreateWorkspace() {
  const [offset, setOffset] = useState(0);
  const [studio, setStudio] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const mk = useMarketing();
  const { campaigns: drafts, publications } = useLibrary();
  const approved = drafts.filter((c) => c.status === "Approved");
  const month = (START_MONTH + offset) % 12;
  const year = 2026 + Math.floor((START_MONTH + offset) / 12);
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(year, month, 1));
  const isFuture = offset > 0;
  const aiIds = new Set(drafts.filter((c) => c.origin !== "manual" && c.status !== "Published").map((c) => EDITOR_ID[c.id]));
  const reviewId = (id: string) => drafts.find((c) => EDITOR_ID[c.id] === id && c.status === "Needs review")?.id;
  const showPrompt = isFuture && !dismissed.includes(offset) && aiIds.size === 0;

  return (
    <MarketingShell title="Content Library">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        <header className="border-b border-border pb-6">
          <p className="text-[11px] font-semibold uppercase text-brand">CONTENT LIBRARY / PUBLISHED CONTENT</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">Your published content</h1>
              <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">One shared set of guest messages, used throughout the year. Edit individual campaigns or plan a seasonal version together.</p>
            </div>
            <Button variant="brand" onClick={() => setStudio(true)}><Sparkle size={15} />Write with Directful AI</Button>
          </div>
        </header>

        <div className="grid gap-0 border-b border-border py-5 sm:grid-cols-3">
          <div className="py-2 sm:border-r sm:border-border sm:pr-6"><p className="text-[11px] text-muted-foreground">Current package</p><p className="mt-1 text-[16px] font-semibold text-card-foreground">Original content <span className="ml-1 text-[11px] font-normal text-muted-foreground">· year-round</span></p></div>
          <div className="py-2 sm:border-r sm:border-border sm:px-6"><p className="text-[11px] text-muted-foreground">Campaigns</p><p className="mt-1 text-[16px] font-semibold text-card-foreground">{mk.campaigns.length} <span className="ml-1 text-[11px] font-normal text-muted-foreground">across 3 campaign types</span></p></div>
          <div className="py-2 sm:pl-6"><p className="text-[11px] text-muted-foreground">Availability</p><p className="mt-1 flex items-center gap-1.5 text-[16px] font-semibold text-card-foreground"><Check size={15} className="text-success" />Published for every month</p></div>
        </div>

        <section className="pt-6" aria-label="Monthly published content">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-brand-soft text-brand"><CalendarDays size={19} /></span>
              <div><p className="text-[11px] font-semibold uppercase text-muted-foreground">Content calendar</p><h2 className="font-display text-[23px] font-semibold text-card-foreground">{monthName} {year}</h2></div>
              <span className={`rounded-sm px-2 py-1 text-[11px] font-semibold ${isFuture ? "bg-muted text-muted-foreground" : "bg-success-soft text-success"}`}>{isFuture ? "Upcoming" : "Live now"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" title="Previous month" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset(offset - 1)}><ChevronLeft size={17} /></Button>
              <Button variant="outline" size="icon" title="Next month" aria-label="Next month" onClick={() => setOffset(offset + 1)}><ChevronRight size={17} /></Button>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">{isFuture ? "The same published messages will be used unless you prepare a new version for this month." : "The original published messages are in use this month."}</p>

          {showPrompt && <div className="relative mt-5 overflow-hidden rounded-md border border-brand/30 bg-brand-soft/60 p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-card/50 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="max-w-xl"><p className="flex items-center gap-2 text-[11px] font-semibold uppercase text-brand"><Sparkles size={14} />Make this month yours</p><h3 className="mt-1 text-[19px] font-semibold text-card-foreground">Personalize your {monthName} content</h3><p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">Your year-round content will continue unchanged. You can write a new version for this month, or keep what’s already published.</p></div>
              <div className="flex shrink-0 flex-wrap gap-2"><Button variant="outline" onClick={() => setDismissed((d) => [...d, offset])}>Keep current content</Button><Button variant="brand" onClick={() => setStudio(true)}><Sparkle size={14} />Personalize with AI <ArrowRight size={14} /></Button></div>
            </div>
          </div>}

          {notice && <div role="status" className="mt-4 rounded-md bg-brand-soft p-3 text-[12px] text-brand">{notice}</div>}
          <div className="mt-7 space-y-9">
            {(["invites", "transactional", "in_property"] as const).map((group) => {
              const items = mk.campaigns.filter((c) => c.group === group);
              return <section key={group} aria-label={GROUP_LABEL[group]}>
                <div className="mb-3 flex items-baseline gap-2 border-b border-border pb-2"><h3 className="text-[15px] font-semibold text-card-foreground">{GROUP_LABEL[group]}</h3><span className="text-[11px] text-muted-foreground">{items.length} campaigns</span></div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((c) => <PublishedCard key={c.id} campaign={c} aiEdited={aiIds.has(c.id)} onEdit={() => setEditing(c.id)} onTest={() => setTesting(c.id)} onReview={reviewId(c.id) ? () => setReviewing(reviewId(c.id) ?? null) : undefined} />)}</div>
              </section>;
            })}
          </div>
        </section>
      </main>
      {approved.length > 0 && <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3"><Check size={16} className="text-brand" /><p className="flex-1 text-[12px] text-card-foreground">{approved.length} reviewed AI campaign{approved.length !== 1 ? "s" : ""} ready to publish</p><Button variant="brand" onClick={() => { const n = publishApproved(); setNotice(`${n} campaign${n !== 1 ? "s" : ""} published in this sample workspace.`); }}>Publish reviewed content</Button></div></div>}
      {studio && <AiCreateStudio initialMonth={month} onClose={() => setStudio(false)} onReview={() => { setStudio(false); setNotice("AI draft ready. Review each changed campaign before publishing."); }} />}
      {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
      <TestCampaignDialog campaign={mk.campaigns.find((c) => c.id === testing) ?? null} open={Boolean(testing)} onClose={() => setTesting(null)} />
      {reviewing && <ReviewWorkspace id={reviewing} onClose={() => setReviewing(null)} />}
    </MarketingShell>
  );
}