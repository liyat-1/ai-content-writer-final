import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, FlaskConical, Mail, MessageSquare, Pencil, WandSparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
import { TestCampaignDialog } from "@/components/marketing/MarketingDialogs";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, STRATEGY_LABEL, lastEdit, strategyHasEmail, timeAgo, useMarketing, type MarketingCampaign } from "@/lib/marketing";
import { EDITOR_ID, MONTH_PACKAGES, MONTHS, packageSnippet, publishApproved, useLibrary, type LibraryCampaign, type MonthPackage } from "@/lib/contentLibrary";
import { Sparkle } from "@/components/ai/Sparkle";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";

const START_MONTH = 8;
const GROUP_LABEL: Record<MarketingCampaign["group"], string> = { invites: "Automated Invites", transactional: "Automated Transactional", in_property: "In-Property Transactional" };

function PublishedCard({ campaign, libraryCampaign, pack, aiEdited, onEdit, onTest, onReview }: { campaign: MarketingCampaign; libraryCampaign?: LibraryCampaign; pack: MonthPackage; aiEdited: boolean; onEdit: () => void; onTest: () => void; onReview?: () => void }) {
  const edit = lastEdit(campaign);
  const hasEmail = strategyHasEmail(campaign.strategy);
  const snippet = libraryCampaign ? packageSnippet(libraryCampaign, pack) : STRATEGY_LABEL[campaign.strategy];
  return (
    <article className={`group flex min-h-[245px] flex-col overflow-hidden rounded-md border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift ${aiEdited ? "border-brand/45" : "border-border"}`}>
      <div className={`h-1 ${pack.source === "ai" ? "bg-brand" : pack.source === "team" ? "bg-chart-2" : "bg-muted"}`} />
      {aiEdited && <div className="flex items-center gap-1.5 border-b border-brand/15 bg-brand-soft/60 px-4 py-2 text-[11px] font-semibold text-brand"><Sparkle size={12} />AI draft · ready for review</div>}
      <div className="flex-1 px-4 pt-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase text-brand">{GROUP_LABEL[campaign.group]}</p><h3 className="mt-1 text-[16px] font-semibold text-card-foreground">{campaign.name}</h3></div><span className="rounded-sm bg-muted px-2 py-1 text-[10.5px] font-semibold text-muted-foreground">{pack.version}</span></div>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground"><Clock3 size={12} />{campaign.timing}</p>
        <p className="mt-4 line-clamp-2 min-h-10 text-[12px] leading-relaxed text-card-foreground">“{snippet}”</p>
        <div className="mt-3 flex flex-wrap gap-1.5"><span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-[11px] text-card-foreground"><MessageSquare size={12} />Text</span>{hasEmail && <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-[11px] text-card-foreground"><Mail size={12} />Email</span>}<span className="rounded-sm bg-muted px-2 py-1 text-[11px] text-muted-foreground">Direct + OTA</span></div>
      </div>
      <div className="mt-3 flex items-center gap-2 px-4 pb-3 text-[11px] text-muted-foreground"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand">{edit?.by?.split(" ").map((n) => n[0]).join("") ?? CURRENT_USER.initials}</span><span className="truncate">{aiEdited ? "Generated today" : edit ? `${edit.by} · updated ${timeAgo(edit.at)}` : pack.note}</span></div>
      <div className="flex gap-2 border-t border-border p-2"><Button variant="ghost" size="sm" onClick={onTest}><FlaskConical size={14} />Test</Button><Button variant="brand" size="sm" className="flex-1" onClick={onReview ?? onEdit}>{onReview ? <><Check size={14} />Review</> : <><Pencil size={14} />Edit content</>}</Button></div>
    </article>
  );
}

export function CreateWorkspace() {
  const [offset, setOffset] = useState(0);
  const [studio, setStudio] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const mk = useMarketing();
  const { campaigns: drafts } = useLibrary();
  const approved = drafts.filter((c) => c.status === "Approved");
  const month = (START_MONTH + offset) % 12;
  const year = 2026 + Math.floor((START_MONTH + offset) / 12);
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(year, month, 1));
  const packages = useMemo(() => MONTH_PACKAGES.filter((p) => p.month === month && p.year === year), [month, year]);
  const [selectedPackages, setSelectedPackages] = useState<Record<string, string>>({ "8-2026": "sep-live", "9-2026": "oct-ai", "10-2026": "nov-ai" });
  const selectedPack = packages.find((p) => p.id === selectedPackages[`${month}-${year}`]) ?? packages[0] ?? { id: "default", month, year, label: "Original year-round", version: "v1", source: "default" as const, status: offset === 0 ? "Live now" as const : "Scheduled" as const, note: "Fallback content" };
  const aiIds = new Set(drafts.filter((c) => c.origin !== "manual" && c.status !== "Published").map((c) => EDITOR_ID[c.id]));
  const reviewId = (id: string) => drafts.find((c) => EDITOR_ID[c.id] === id && c.status === "Needs review")?.id;

  return (
    <MarketingShell title="Content Library">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div><p className="text-[11px] font-semibold uppercase text-brand">Content Library / Published content</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">Your published content</h1><p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">See what guests receive now, prepare what comes next, and revisit every version.</p></div>
          <Button variant="brand" onClick={() => setChoiceOpen(true)}><Pencil size={15} />Edit content</Button>
        </header>

        <section className="relative pt-6" aria-label="Monthly published content">
          <div className="rounded-lg border border-border bg-card shadow-card">
            <div className="grid items-center gap-4 border-b border-border p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-5">
              <div className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex"><CalendarDays size={16} className="text-brand" />Content calendar</div>
              <div className="flex items-center justify-center gap-3"><Button variant="ghost" size="icon" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset((v) => v - 1)}><ChevronLeft /></Button><div className="min-w-40 text-center"><p className="font-display text-[24px] font-semibold text-card-foreground">{monthName}</p><p className="text-[11px] text-muted-foreground">{year}</p></div><Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setOffset((v) => v + 1)}><ChevronRight /></Button></div>
              <div className="flex justify-center sm:justify-end"><span className={`rounded-sm px-2 py-1 text-[11px] font-semibold ${selectedPack.status === "Live now" ? "bg-success-soft text-success" : "bg-brand-soft text-brand"}`}>{selectedPack.status}</span></div>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-[10.5px] font-semibold uppercase text-muted-foreground">Content version</p><p className="mt-0.5 text-[13px] text-card-foreground">{selectedPack.note}</p></div>
              <select aria-label="Content version" value={selectedPack.id} onChange={(e) => setSelectedPackages((v) => ({ ...v, [`${month}-${year}`]: e.target.value }))} className="h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-semibold text-card-foreground outline-none focus:border-brand">
                {packages.length ? packages.map((p) => <option key={p.id} value={p.id}>{p.version} · {p.label}</option>) : <option value="default">v1 · Original year-round</option>}
              </select>
            </div>
          </div>

          {notice && <div role="status" className="mt-4 rounded-md bg-brand-soft p-3 text-[12px] text-brand">{notice}</div>}
          <div className="mt-7 space-y-9">{(["invites", "transactional", "in_property"] as const).map((group) => { const items = mk.campaigns.filter((c) => c.group === group); return <section key={group} aria-label={GROUP_LABEL[group]}><div className="mb-3 flex items-baseline gap-2 border-b border-border pb-2"><h3 className="text-[15px] font-semibold text-card-foreground">{GROUP_LABEL[group]}</h3><span className="text-[11px] text-muted-foreground">{items.length} campaigns</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((c) => { const lib = drafts.find((d) => EDITOR_ID[d.id] === c.id); return <PublishedCard key={c.id} campaign={c} libraryCampaign={lib} pack={selectedPack} aiEdited={aiIds.has(c.id)} onEdit={() => setEditing(c.id)} onTest={() => setTesting(c.id)} onReview={reviewId(c.id) ? () => setReviewing(reviewId(c.id) ?? null) : undefined} />; })}</div></section>; })}</div>
        </section>
      </main>

      {choiceOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setChoiceOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="edit-choice-title" className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-float"><div className="p-6 sm:p-8"><span className="grid size-11 place-items-center rounded-md bg-brand-soft text-brand"><WandSparkles size={21} /></span><h2 id="edit-choice-title" className="mt-5 font-display text-[26px] font-semibold text-card-foreground">How would you like to shape {monthName}?</h2><p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">Keep Directful’s proven default messages, or create a timely version around your hotel, guests, and what is happening locally.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="rounded-md border border-border p-5 text-left transition-colors hover:border-brand/40 hover:bg-muted/40" onClick={() => { setChoiceOpen(false); setSelectedPackages((v) => ({ ...v, [`${month}-${year}`]: packages.find((p) => p.source === "default")?.id ?? "default" })); }}><span className="text-[14px] font-semibold text-card-foreground">Use default content</span><span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">Continue with the year-round messages already set up for every guest journey.</span></button><button className="rounded-md border border-brand/35 bg-brand-soft/50 p-5 text-left transition-colors hover:border-brand" onClick={() => { setChoiceOpen(false); setStudio(true); }}><span className="flex items-center gap-2 text-[14px] font-semibold text-brand"><Sparkle size={14} />Edit content with AI</span><span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">Build a seasonal plan, add hotel context, and review every message before publishing.</span></button></div><div className="mt-5 flex justify-end"><Button variant="ghost" onClick={() => setChoiceOpen(false)}>Cancel</Button></div></div></section></div>}
      {approved.length > 0 && <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3"><Check size={16} className="text-brand" /><p className="flex-1 text-[12px] text-card-foreground">{approved.length} reviewed campaign{approved.length !== 1 ? "s" : ""} ready to publish</p><Button variant="brand" onClick={() => { const n = publishApproved(); setNotice(`${n} campaign${n !== 1 ? "s" : ""} published.`); }}>Publish all</Button></div></div>}
      {studio && <AiCreateStudio onClose={() => setStudio(false)} onReview={() => { setStudio(false); setNotice("AI drafts are ready. Open Review on each changed campaign before publishing."); }} />}
      {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
      <TestCampaignDialog campaign={mk.campaigns.find((c) => c.id === testing) ?? null} open={Boolean(testing)} onClose={() => setTesting(null)} />
      {reviewing && <ReviewWorkspace id={reviewing} onClose={() => setReviewing(null)} />}
    </MarketingShell>
  );
}