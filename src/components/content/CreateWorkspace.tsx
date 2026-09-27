import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, FlaskConical, Mail, MessageSquare, Pencil, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
import { TestCampaignDialog } from "@/components/marketing/MarketingDialogs";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, STRATEGY_LABEL, lastEdit, strategyHasEmail, useMarketing, type MarketingCampaign } from "@/lib/marketing";
import { EDITOR_ID, MONTH_PACKAGES, packageSnippet, publishDraftRelease, useLibrary, type Channel, type LibraryCampaign, type MonthPackage, type Segment } from "@/lib/contentLibrary";
import { Sparkle } from "@/components/ai/Sparkle";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { History, MoreHorizontal, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PINNED_PROPERTIES, RISK, TOTAL_PROPERTIES, markReviewed, resetReviewed, revertMonth, riskFor, setDismissed, topRelease, useReleaseUi, versionsFor, type Release } from "@/lib/releases";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";

const START_MONTH = 8;
const GROUP_LABEL: Record<MarketingCampaign["group"], string> = { invites: "Automated Invites", transactional: "Automated Transactional", in_property: "In-Property Transactional" };

function PublishedCard({ campaign, libraryCampaign, pack, draft, month, monthName, release, forceChannel, reviewed, onEdit, onTest, onReview }: { campaign: MarketingCampaign; libraryCampaign?: LibraryCampaign; pack: MonthPackage; draft: boolean; month: number; monthName: string; release: Release; forceChannel?: Channel; reviewed: boolean; onEdit: () => void; onTest: () => void; onReview?: () => void }) {
  const edit = lastEdit(campaign);
  const channels: Channel[] = strategyHasEmail(campaign.strategy) ? ["text", "email"] : ["text"];
  const [ownChannel, setChannel] = useState<Channel>(channels[0]);
  const channel = forceChannel && channels.includes(forceChannel) ? forceChannel : ownChannel;
  const [segment, setSegment] = useState<Segment>("direct");
  const [history, setHistory] = useState(false);
  const versions = versionsFor(campaign.id, month);
  const live = versions[0];
  const risk = RISK[riskFor(campaign.id)];
  const fallback = libraryCampaign ? packageSnippet(libraryCampaign, pack, segment) : STRATEGY_LABEL[campaign.strategy];
  const content = libraryCampaign ? channel === "email" ? libraryCampaign.content[segment].email.subject : libraryCampaign.content[segment].text : fallback;
  const manual = live.kind === "Manual edit" && !draft;
  return <article className={`flex min-h-[270px] flex-col overflow-hidden rounded-md border bg-card shadow-card ${draft ? "border-dashed border-brand/50" : "border-border"}`}>
    <div className={`h-1 ${draft ? "bg-brand/40" : release.source === "AI generated" ? "bg-brand" : "bg-muted"}`} />
    {draft && <div className="flex items-center justify-between border-b border-brand/15 bg-brand-soft/50 px-4 py-2 text-[11px] font-semibold"><span className="flex items-center gap-1.5 text-card-foreground"><span className={`size-2 rounded-full ${risk.dot}`} />{risk.label}</span><span className="flex items-center gap-1 text-brand"><Sparkle size={11} />AI generated</span></div>}
    <div className="flex-1 px-4 pt-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-[16px] font-semibold text-card-foreground">{campaign.name} <span className="font-normal text-muted-foreground">· {GROUP_LABEL[campaign.group]}</span></h3><p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground"><Clock3 size={12} />{campaign.timing}</p><p className="text-[11.5px] text-muted-foreground">{STRATEGY_LABEL[campaign.strategy]}</p></div><div className="flex items-center gap-1"><span className="rounded-sm bg-muted px-2 py-1 text-[10.5px] font-semibold text-muted-foreground">v{draft ? live.v + 1 : live.v}</span>{!draft && <span className="rounded-sm bg-brand-soft px-1.5 py-1 text-[10.5px] font-semibold text-brand">Live</span>}</div></div>
      <div className="mt-4 flex items-center justify-between gap-2"><div className="flex gap-1">{channels.map((value) => <Button key={value} size="sm" variant={channel === value ? "secondary" : "ghost"} className="h-7 px-2 text-[10.5px]" onClick={() => setChannel(value)}>{value === "email" ? <Mail size={11} /> : <MessageSquare size={11} />}{value === "email" ? "Email" : "Text"}</Button>)}</div><div className="flex gap-1">{(["direct", "ota"] as Segment[]).map((value) => <Button key={value} size="sm" variant={segment === value ? "secondary" : "ghost"} className="h-7 px-2 text-[10.5px]" onClick={() => setSegment(value)}>{value === "direct" ? "Direct" : "OTA"}</Button>)}</div></div>
      <p className="mt-3 line-clamp-2 min-h-10 text-[12px] leading-relaxed text-card-foreground">“{content}”</p></div>
    {!draft && <div className="mt-3 flex items-center gap-2 px-4 pb-3 text-[11px] text-muted-foreground">{manual || edit ? <><span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand">{(manual ? live.by : edit!.by).split(" ").map((n) => n[0]).join("")}</span><span className="truncate">Updated · {manual ? live.by : edit!.by} · {manual ? "yesterday" : "recently"}</span></> : <span className="inline-flex items-center gap-1 font-semibold text-brand"><Sparkle size={11} />AI generated</span>}</div>}
    <div className="flex gap-2 border-t border-border p-2">{draft ? <Button variant="brand" size="sm" className="w-full" onClick={onReview}>Review</Button> : <><Button variant="ghost" size="sm" onClick={onTest}><FlaskConical size={14} />Test</Button><Button variant="brand" size="sm" className="flex-1" onClick={onEdit}><Pencil size={14} />Edit content</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label="More actions"><MoreHorizontal size={15} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setHistory(true)}><History size={14} />Version history</DropdownMenuItem></DropdownMenuContent></DropdownMenu></>}</div>
    <Dialog open={history} onOpenChange={setHistory}><DialogContent><DialogHeader><DialogTitle>{campaign.name} · {monthName}</DialogTitle><DialogDescription>Reverting creates a new version that copies the old one, then goes to Review before republishing.</DialogDescription></DialogHeader><ol className="divide-y divide-border rounded-md border border-border">{versions.map((v, i) => <li key={v.v} className="flex items-center gap-3 px-3 py-2.5"><span className="grid size-8 place-items-center rounded-sm bg-muted text-[11.5px] font-bold">v{v.v}</span><span className="min-w-0 flex-1 text-[12px]"><span className="block font-semibold text-card-foreground">{v.kind} · {v.by} · {v.when}</span><span className="block text-muted-foreground">{v.note} · {v.properties} properties</span></span>{i === 0 ? <span className="text-[11px] font-semibold text-brand">Live</span> : <Button size="sm" variant="outline" onClick={() => { setHistory(false); toast.success(`v${versions[0].v + 1} created as a copy of v${v.v} — sent to Review.`); }}>Revert to v{v.v}</Button>}</li>)}</ol></DialogContent></Dialog>
  </article>;
}

export function CreateWorkspace() {
  const [offset, setOffset] = useState(0);
  const [studio, setStudio] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const ui = useReleaseUi();
  const [filter, setFilter] = useState<"attention" | "all" | "reviewed">("all");
  const [show, setShow] = useState<Channel>("text");
  const [confirmRevert, setConfirmRevert] = useState(false);
  const [conflict, setConflict] = useState(false);
  const mk = useMarketing();
  const { campaigns: libraryCampaigns } = useLibrary();
  const hasDrafts = libraryCampaigns.some((campaign) => campaign.status === "Needs review" || campaign.status === "Approved");
  const month = (START_MONTH + offset) % 12;
  const year = 2026 + Math.floor((START_MONTH + offset) / 12);
  const monthName = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));
  const packages = useMemo(() => MONTH_PACKAGES.filter((pack) => pack.month === month && pack.year === year), [month, year]);
  const [selectedPackages, setSelectedPackages] = useState<Record<string, string>>({ "8-2026": "sep-live", "9-2026": "oct-ai", "10-2026": "nov-ai" });
  const selectedPack = packages.find((pack) => pack.id === selectedPackages[`${month}-${year}`]) ?? packages[0] ?? { id: "default", month, year, label: "Original year-round", version: "v1", source: "default" as const, status: offset === 0 ? "Live now" as const : "Scheduled" as const, note: "Fallback content" };
  const reviewId = (id: string) => libraryCampaigns.find((campaign) => EDITOR_ID[campaign.id] === id && (campaign.status === "Needs review" || campaign.status === "Approved"))?.id;
  const top = topRelease(month, Boolean(ui.reverted[month]));
  const personalize = selectedPack.source === "default" || (month === 8 && selectedPack.id === "sep-live");

  const publish = (range: string) => { const count = publishDraftRelease(range); setStudio(false); setNotice(`${count} campaigns published as the ${range} release.`); };

  return <MarketingShell title="Content Library"><main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-4 pb-5"><div><p className="text-[11px] font-semibold uppercase text-brand">Content / Published content</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">Your published content</h1><p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">This is your current published content. It’s used across your properties.</p></div><Button variant="brand" onClick={() => setStudio(true)}><Sparkles size={15} />Edit content with AI</Button></header>
    {notice && <div role="status" className="mb-4 rounded-md bg-brand-soft p-3 text-[12px] font-medium text-brand">{notice}</div>}
    {studio && <AiCreateStudio onClose={() => setStudio(false)} onReview={() => { setStudio(false); setNotice(""); }} onPublish={publish} />}
    {!studio && <section className="overflow-hidden rounded-lg border border-border bg-card shadow-card" aria-label="Monthly published content">
      <div className="grid items-center gap-4 border-b border-border p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-5"><div className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex"><CalendarDays size={16} className="text-brand" />Content calendar</div><div className="flex items-center justify-center gap-3"><Button variant="ghost" size="icon" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset((value) => value - 1)}><ChevronLeft /></Button><div className="min-w-40 text-center"><p className="font-display text-[24px] font-semibold text-card-foreground">{monthName}</p><p className="text-[11px] text-muted-foreground">{year}</p></div><Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setOffset((value) => value + 1)}><ChevronRight /></Button></div><div className="flex justify-center sm:justify-end"><span className={`rounded-sm px-2 py-1 text-[11px] font-semibold ${selectedPack.status === "Live now" ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"}`}>{selectedPack.status}</span></div></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5"><Popover><PopoverTrigger asChild><button className="text-[12.5px] font-medium text-card-foreground underline decoration-dotted underline-offset-4">{TOTAL_PROPERTIES - PINNED_PROPERTIES.length} of {TOTAL_PROPERTIES} properties on live content</button></PopoverTrigger><PopoverContent className="w-72"><p className="text-[12px] font-semibold text-card-foreground">On other versions</p><ul className="mt-2 space-y-1.5">{PINNED_PROPERTIES.map((p) => <li key={p.name} className="text-[12px]"><span className="block font-medium text-card-foreground">{p.name}</span><span className="text-muted-foreground">{p.on} · {p.why}</span></li>)}</ul><Link to="/content/releases" className="mt-3 inline-block text-[12px] font-semibold text-brand">See in Releases →</Link></PopoverContent></Popover>{top.id !== "default" && !hasDrafts && <Button variant="ghost" size="sm" onClick={() => setConfirmRevert(true)}><RotateCcw size={13} />Revert {monthName}</Button>}</div>
      {!hasDrafts && top.id === "default" && !ui.dismissed[month] && <div className="relative overflow-hidden border-b border-brand/20 ai-surface px-5 py-6 sm:px-7"><div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground shadow-card"><Sparkle size={20} /></span><div><p className="text-[10.5px] font-semibold uppercase text-brand">{monthName} {year}</p><h2 className="mt-1 font-display text-[21px] font-semibold text-card-foreground">Personalize {monthName} for the season</h2><p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">Your {monthName} content is the same as the rest of the year. Personalize and schedule it for the season.</p></div></div><div className="flex gap-2"><Button variant="ghost" onClick={() => setDismissed(month, true)}>Keep current content</Button><Button variant="brand" onClick={() => setStudio(true)}><Sparkle size={14} />Personalize with AI</Button></div></div></div>}
      {!hasDrafts && top.id === "default" && ui.dismissed[month] && <div className="flex items-center gap-2 border-b border-border px-5 py-2.5 text-[12px] text-muted-foreground">Using year-round content · <button className="font-semibold text-brand" onClick={() => setStudio(true)}>Personalize</button></div>}
      {hasDrafts && <div className="flex flex-wrap items-center gap-3 border-b border-brand/20 bg-brand-soft/40 px-5 py-4"><div className="flex-1"><p className="text-[13px] font-semibold text-card-foreground">Your generated content is ready</p><p className="text-[11.5px] text-muted-foreground">Open any campaign to review it if you like, or publish now.</p></div><span className="text-[11.5px] text-muted-foreground">Show:</span>{(["text", "email"] as Channel[]).map((c) => <Button key={c} size="sm" variant={show === c ? "secondary" : "ghost"} onClick={() => setShow(c)}>{c === "text" ? "Text" : "Email"}</Button>)}<Button variant="brand" onClick={() => setConflict(true)}>Publish</Button></div>}
      <div className="space-y-9 p-4 sm:p-6">{(["invites", "transactional", "in_property"] as const).map((group) => { const items = mk.campaigns.filter((campaign) => campaign.group === group).sort((a, b) => hasDrafts ? RISK[riskFor(a.id)].order - RISK[riskFor(b.id)].order : 0); if (!items.length) return null; return <section key={group} aria-label={GROUP_LABEL[group]}><div className="mb-3 flex items-baseline gap-2 border-b border-border pb-2"><h3 className="text-[15px] font-semibold text-card-foreground">{GROUP_LABEL[group]}</h3><span className="text-[11px] text-muted-foreground">{items.length} campaigns</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((campaign) => { const libraryCampaign = libraryCampaigns.find((item) => EDITOR_ID[item.id] === campaign.id); const id = reviewId(campaign.id); return <PublishedCard key={campaign.id} campaign={campaign} libraryCampaign={libraryCampaign} pack={selectedPack} draft={Boolean(id)} month={month} monthName={monthName} release={top} forceChannel={hasDrafts ? show : undefined} reviewed={Boolean(ui.reviewed[campaign.id])} onEdit={() => setEditing(campaign.id)} onTest={() => setTesting(campaign.id)} onReview={id ? () => setReviewing(id) : undefined} />; })}</div></section>; })}</div>
    </section>}
  </main>
  {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
  <TestCampaignDialog campaign={mk.campaigns.find((campaign) => campaign.id === testing) ?? null} open={Boolean(testing)} onClose={() => setTesting(null)} />
  <AlertDialog open={confirmRevert} onOpenChange={setConfirmRevert}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Revert {monthName}?</AlertDialogTitle><AlertDialogDescription>This rolls back the top release for {monthName} ({top.name}). {monthName} falls back to the release underneath. Nothing is deleted.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { revertMonth(month); toast.success(`${monthName} reverted.`); }}>Revert {monthName}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  <AlertDialog open={conflict} onOpenChange={setConflict}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>1 manually edited campaign will be replaced — keep it?</AlertDialogTitle><AlertDialogDescription>After Last Visit · September v3 was edited by Maria Chen and is used by 7 properties.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => { resetReviewed(); publish(`${monthName} ${year}`); }}>Keep it</AlertDialogCancel><AlertDialogAction onClick={() => { resetReviewed(); publish(`${monthName} ${year}`); }}>Replace</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  {reviewing && <ReviewWorkspace id={reviewing} onClose={() => setReviewing(null)} />}
  </MarketingShell>;
}
