import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarDays, Check, ChevronRight, Clock3, Layers3, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/lib/contentLibrary";
import { useMarketing } from "@/lib/marketing";
import { ACTIVE_RELEASE_ID, CONFIDENCE, RELEASE_RESULTS, RELEASES, TOTAL_PROPERTIES, useSelectedRelease, versionsFor, type Confidence, type Release } from "@/lib/releases";

type DetailView = "overview" | "months" | "campaigns";

const panel = "rounded-lg border border-border bg-card shadow-card";

function ConfidenceTag({ c }: { c: Confidence }) {
  return <span className={`rounded-sm px-2 py-1 text-[10px] font-semibold ${CONFIDENCE[c].cls}`}>{CONFIDENCE[c].label}</span>;
}

function PublicationHistory({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const years = Array.from(new Set(RELEASES.map((release) => release.year))).sort((a, b) => b - a);
  return (
    <aside className="lg:sticky lg:top-[76px] lg:self-start" aria-label="Publication history">
      <div className={`${panel} overflow-hidden`}>
        <div className="border-b border-border px-4 py-4">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Publication history</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Choose one publication to view.</p>
        </div>
        <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-2">
          {years.map((year) => (
            <section key={year} className="mb-3 last:mb-0">
              <p className="px-2 py-2 text-[11px] font-bold text-card-foreground">{year}</p>
              <div className="space-y-1">
                {RELEASES.filter((release) => release.year === year).map((release) => {
                  const selected = release.id === selectedId;
                  const active = release.id === ACTIVE_RELEASE_ID;
                  return (
                    <button
                      type="button"
                      key={release.id}
                      onClick={() => onSelect(release.id)}
                      className={`w-full rounded-md border px-3 py-3 text-left transition-all duration-200 ${selected ? "border-brand bg-brand-soft shadow-card" : "border-transparent hover:border-border hover:bg-muted/60"}`}
                    >
                      <span className="flex items-start gap-2">
                        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${active ? "bg-brand" : "bg-muted-foreground/35"}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-semibold text-card-foreground">{release.name}</span>
                          <span className="mt-1 block text-[10.5px] text-muted-foreground">Published {release.created} · {release.source}</span>
                          {active && <span className="mt-2 inline-flex items-center gap-1 rounded-sm bg-brand px-1.5 py-0.5 text-[9.5px] font-semibold text-brand-foreground"><span className="size-1 rounded-full bg-brand-foreground" />Live now</span>}
                        </span>
                        {selected && <ChevronRight size={14} className="mt-0.5 shrink-0 text-brand" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}

function PageHeader({ page, release }: { page: "Releases" | "Results"; release: Release }) {
  const active = release.id === ACTIVE_RELEASE_ID;
  return (
    <header className="border-b border-border pb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-semibold uppercase text-brand">Content / {page}</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[34px]">{page}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">Every detail below belongs to the selected publication.</p>
        </div>
        {active && <span className="inline-flex items-center gap-2 rounded-md border border-brand/20 bg-brand-soft px-3 py-2 text-[11px] font-semibold text-brand"><span className="size-2 rounded-full bg-brand" />Currently live publication</span>}
      </div>
    </header>
  );
}

function PublicationHero({ release, page }: { release: Release; page: "release" | "results" }) {
  const active = release.id === ACTIVE_RELEASE_ID;
  const result = RELEASE_RESULTS[release.id];
  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="border-t-[3px] border-brand px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase text-muted-foreground">
              <span>{release.source} publication</span>
              <span>·</span>
              <span>{release.publishedAt}</span>
            </div>
            <h2 className="mt-2 text-[24px] font-semibold text-card-foreground sm:text-[28px]">{page === "results" ? "Results for " : ""}{release.name}</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-muted-foreground">{release.summary}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-sm px-2 py-1 text-[10.5px] font-semibold ${active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>{active ? "Live now" : "Archived"}</span>
            {page === "results" && result && <span className="text-[11px] text-muted-foreground">Measured through {result.measuredThrough}</span>}
          </div>
        </div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
          <Stat label="Timeframe" value={`${MONTHS[release.from]}–${MONTHS[release.to]} ${release.year}`} />
          <Stat label="Coverage" value={`${release.properties} of ${TOTAL_PROPERTIES} properties`} />
          <Stat label="Campaigns" value={`${release.campaignCount} included`} />
          <Stat label={page === "results" ? "Compared with" : "Publication layer"} value={page === "results" ? release.comparison : release.replaces ? `Replaced ${release.replaces}` : "Year-round foundation"} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-card px-4 py-3"><p className="text-[9.5px] font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 text-[12px] font-semibold text-card-foreground">{value}</p></div>;
}

function ViewTabs({ value, onChange }: { value: DetailView; onChange: (value: DetailView) => void }) {
  return (
    <div className="flex gap-1 border-b border-border" role="tablist" aria-label="Breakdown view">
      {(["overview", "months", "campaigns"] as const).map((item) => (
        <button key={item} type="button" role="tab" aria-selected={value === item} onClick={() => onChange(item)} className={`border-b-2 px-3 py-2.5 text-[12px] font-semibold capitalize transition-colors ${value === item ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-card-foreground"}`}>{item === "months" ? "By month" : item === "campaigns" ? "By campaign" : "Overview"}</button>
      ))}
    </div>
  );
}

function ReleaseOverview({ release, onView }: { release: Release; onView: (view: DetailView) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <section className={`${panel} p-5 sm:p-6`}>
        <div className="flex items-center gap-2"><Sparkles size={16} className="text-brand" /><h3 className="text-[14px] font-semibold text-card-foreground">What changed in this publication</h3></div>
        <ul className="mt-5 divide-y divide-border">
          {release.changes.map((change, index) => <li key={change} className="flex gap-3 py-3 first:pt-0"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">{index + 1}</span><span className="pt-0.5 text-[13px] text-card-foreground">{change}</span></li>)}
        </ul>
        <div className="mt-3 rounded-md bg-muted px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Likely effect</p><p className="mt-1 text-[12.5px] leading-5 text-card-foreground">{release.expectedEffect}</p></div>
      </section>
      <section className={`${panel} p-5 sm:p-6`}>
        <h3 className="text-[14px] font-semibold text-card-foreground">Publication coverage</h3>
        <div className="mt-5 space-y-4">
          <div><div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Properties live</span><span className="font-semibold text-card-foreground">{release.properties}/{TOTAL_PROPERTIES}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${release.properties / TOTAL_PROPERTIES * 100}%` }} /></div></div>
          <div className="grid grid-cols-2 gap-2"><Stat label="Months" value={`${release.to - release.from + 1}`} /><Stat label="Manual edits" value={`${release.editedCampaigns ?? 0}`} /></div>
        </div>
        <Button variant="outline" className="mt-5 w-full justify-between" onClick={() => onView("months")}>Explore monthly breakdown <ArrowRight size={14} /></Button>
      </section>
    </div>
  );
}

function ReleaseMonths({ release, campaigns, onCampaign }: { release: Release; campaigns: ReturnType<typeof useMarketing>["campaigns"]; onCampaign: (id: string, month: number) => void }) {
  const [month, setMonth] = useState(release.from);
  return (
    <section className={panel}>
      <div className="flex gap-2 overflow-x-auto border-b border-border p-3">
        {Array.from({ length: release.to - release.from + 1 }, (_, index) => release.from + index).map((item) => <button key={item} type="button" onClick={() => setMonth(item)} className={`min-w-[110px] rounded-md border px-3 py-2.5 text-left transition-colors ${month === item ? "border-brand bg-brand-soft" : "border-border hover:bg-muted"}`}><span className="block text-[12px] font-semibold text-card-foreground">{MONTHS[item]}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{campaigns.length} campaigns</span></button>)}
      </div>
      <div className="px-4 py-3"><p className="text-[11px] text-muted-foreground">Live content for <span className="font-semibold text-card-foreground">{MONTHS[month]} {release.year}</span></p></div>
      <CampaignRows campaigns={campaigns} release={release} month={month} onCampaign={onCampaign} />
    </section>
  );
}

function CampaignRows({ campaigns, release, month, onCampaign }: { campaigns: ReturnType<typeof useMarketing>["campaigns"]; release: Release; month: number; onCampaign: (id: string, month: number) => void }) {
  return <ul className="divide-y divide-border border-t border-border">{campaigns.map((campaign, index) => { const versions = versionsFor(campaign.id, month); const version = release.id === ACTIVE_RELEASE_ID ? versions[0]?.v ?? 1 : 1; return <li key={campaign.id}><button type="button" onClick={() => onCampaign(campaign.id, month)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[1.2fr_.8fr_auto]"><span><span className="block text-[12.5px] font-semibold text-card-foreground">{campaign.name}</span><span className="block text-[10.5px] text-muted-foreground">{campaign.timing}</span></span><span className="hidden text-[11px] text-muted-foreground sm:block">{campaign.strategy === "text" ? "Text" : "Text + Email"}</span><span className="flex items-center gap-2"><span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-semibold text-card-foreground">v{version}</span>{index < 3 && release.id === ACTIVE_RELEASE_ID && <span className="hidden text-[10px] font-medium text-brand md:inline">Changed</span>}<ChevronRight size={14} className="text-muted-foreground" /></span></button></li>; })}</ul>;
}

function VersionDetail({ campaignId, month, campaignName, onBack }: { campaignId: string; month: number; campaignName: string; onBack: () => void }) {
  return <section className={panel}><div className="flex items-center gap-3 border-b border-border px-4 py-4"><Button size="sm" variant="ghost" onClick={onBack}>Back</Button><div><h3 className="text-[14px] font-semibold text-card-foreground">{campaignName}</h3><p className="text-[10.5px] text-muted-foreground">{MONTHS[month]} version history</p></div></div><ol className="divide-y divide-border">{versionsFor(campaignId, month).map((version, index) => <li key={version.v} className="flex flex-wrap items-center gap-3 px-4 py-4"><span className={`grid size-9 place-items-center rounded-md text-[11px] font-bold ${index === 0 ? "bg-brand text-brand-foreground" : "bg-muted text-card-foreground"}`}>v{version.v}</span><span className="min-w-0 flex-1"><span className="block text-[12.5px] font-semibold text-card-foreground">{version.kind} · {version.by}</span><span className="mt-0.5 block text-[10.5px] text-muted-foreground">{version.when} · {version.note} · {version.properties} properties</span></span>{index === 0 ? <span className="flex items-center gap-1 text-[10px] font-semibold text-brand"><Check size={12} />Live in this slot</span> : <Button size="sm" variant="outline">Use this version</Button>}</li>)}</ol></section>;
}

function PublicationWorkspace({ page }: { page: "releases" | "results" }) {
  const [selectedId, setSelectedId] = useSelectedRelease();
  const [view, setView] = useState<DetailView>("overview");
  const [campaignDrill, setCampaignDrill] = useState<{ id: string; month: number } | null>(null);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const { campaigns } = useMarketing();
  const release = RELEASES.find((item) => item.id === selectedId) ?? RELEASES[0];
  const result = RELEASE_RESULTS[release.id] ?? RELEASE_RESULTS.default;
  const campaign = campaignDrill ? campaigns.find((item) => item.id === campaignDrill.id) : undefined;
  const maxClicks = Math.max(...result.months.map((item) => item.clicks), 1);
  const selectRelease = (id: string) => { setSelectedId(id); setView("overview"); setCampaignDrill(null); };
  const openCampaign = (id: string, month: number) => setCampaignDrill({ id, month });

  return (
    <MarketingShell title={page === "releases" ? "Releases" : "Results"}>
      <main className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <PageHeader page={page === "releases" ? "Releases" : "Results"} release={release} />
        <div className="mt-6 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <PublicationHistory selectedId={release.id} onSelect={selectRelease} />
          <div className="min-w-0 space-y-5">
            <PublicationHero release={release} page={page === "releases" ? "release" : "results"} />
            <ViewTabs value={view} onChange={(next) => { setView(next); setCampaignDrill(null); }} />

            {page === "releases" && view === "overview" && <ReleaseOverview release={release} onView={setView} />}
            {page === "releases" && view === "months" && !campaignDrill && <ReleaseMonths key={release.id} release={release} campaigns={campaigns} onCampaign={openCampaign} />}
            {page === "releases" && view === "campaigns" && !campaignDrill && <section className={panel}><div className="px-4 py-4"><h3 className="text-[14px] font-semibold text-card-foreground">All campaigns in {release.name}</h3><p className="mt-1 text-[11px] text-muted-foreground">Open any campaign to inspect the versions published in this release.</p></div><CampaignRows campaigns={campaigns} release={release} month={release.from} onCampaign={openCampaign} /></section>}
            {page === "releases" && campaignDrill && campaign && <VersionDetail campaignId={campaign.id} month={campaignDrill.month} campaignName={campaign.name} onBack={() => setCampaignDrill(null)} />}

            {page === "results" && view === "overview" && <>
              <div className="grid gap-3 sm:grid-cols-3">{result.metrics.map((metric) => <section key={metric.label} className={`${panel} p-4`}><p className="text-[10.5px] font-medium text-muted-foreground">{metric.label}</p><p className="mt-2 text-[26px] font-semibold text-card-foreground">{metric.value}</p><p className="mt-1 text-[11px] font-medium text-brand">{metric.delta}</p></section>)}</div>
              <section className={`${panel} p-5 sm:p-6`}><div className="flex items-center gap-2"><Sparkles size={16} className="text-brand" /><h3 className="text-[14px] font-semibold text-card-foreground">AI insights for {release.name}</h3></div><p className="mt-1 text-[11px] text-muted-foreground">{result.sampleNote}</p><ul className="mt-4 divide-y divide-border">{result.insights.map((insight) => <li key={insight.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-center gap-2"><ConfidenceTag c={insight.conf} /><span className="ml-auto flex gap-1"><Button size="icon-sm" variant={votes[insight.id] === "up" ? "secondary" : "ghost"} aria-label="Helpful" onClick={() => setVotes((current) => ({ ...current, [insight.id]: "up" }))}><ThumbsUp size={13} /></Button><Button size="icon-sm" variant={votes[insight.id] === "down" ? "secondary" : "ghost"} aria-label="Not helpful" onClick={() => setVotes((current) => ({ ...current, [insight.id]: "down" }))}><ThumbsDown size={13} /></Button></span></div><p className="mt-2 text-[13px] font-medium text-card-foreground">{insight.text}</p><p className="mt-1 text-[11.5px] leading-5 text-muted-foreground"><span className="font-semibold text-card-foreground">Why we think this:</span> {insight.evidence}</p></li>)}</ul></section>
            </>}
            {page === "results" && view === "months" && <section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between gap-4"><div><h3 className="text-[14px] font-semibold text-card-foreground">Monthly performance</h3><p className="mt-1 text-[11px] text-muted-foreground">Clicks generated by {release.name}</p></div><span className="text-[10px] text-muted-foreground">{result.sampleNote}</span></div><div className="mt-7 flex h-56 items-end gap-3">{result.months.map((item) => <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-2"><span className="text-[10px] font-semibold text-card-foreground">{item.clicks ? item.clicks.toLocaleString() : "—"}</span><div className="flex h-40 w-full items-end rounded-sm bg-muted/60"><div className="w-full rounded-sm bg-brand transition-[height] duration-200" style={{ height: `${item.clicks ? Math.max(12, item.clicks / maxClicks * 100) : 4}%` }} /></div><span className="text-[10.5px] font-medium text-muted-foreground">{MONTHS[item.month]}</span></div>)}</div><div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">{result.months.map((item) => <Stat key={item.month} label={`${MONTHS[item.month]} engagement`} value={item.engagement ? `${item.engagement.toFixed(1)}% · ${item.calls} calls` : "Not live yet"} />)}</div></section>}
            {page === "results" && view === "campaigns" && <section className={panel}><div className="px-4 py-4"><h3 className="text-[14px] font-semibold text-card-foreground">Campaign performance</h3><p className="mt-1 text-[11px] text-muted-foreground">Results attributable to {release.name} only.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="border-y border-border bg-muted/50 text-[10px] font-semibold uppercase text-muted-foreground"><tr><th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Clicks</th><th className="px-4 py-3">Engagement</th><th className="px-4 py-3">Lift</th><th className="px-4 py-3">Confidence</th></tr></thead><tbody className="divide-y divide-border">{result.campaigns.map((row) => { const name = campaigns.find((item) => item.id === row.campaignId)?.name ?? row.campaignId; return <tr key={row.campaignId} className="hover:bg-muted/40"><td className="px-4 py-3 text-[12px] font-semibold text-card-foreground">{name}</td><td className="px-4 py-3 text-[12px] text-card-foreground">{row.clicks.toLocaleString()}</td><td className="px-4 py-3 text-[12px] text-card-foreground">{row.engagement.toFixed(1)}%</td><td className="px-4 py-3 text-[12px] font-semibold text-brand">+{row.lift.toFixed(1)} pts</td><td className="px-4 py-3"><ConfidenceTag c={row.confidence} /></td></tr>; })}</tbody></table></div></section>}

            <div className="flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 size={13} />Publication data updated Sep 27, 2026</span><Link to={page === "releases" ? "/content/results" : "/content/releases"} className="flex items-center gap-1 font-semibold text-brand">{page === "releases" ? "View this publication’s results" : "View publication details"}<ArrowRight size={13} /></Link></div>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}

export function ReleasesPage() { return <PublicationWorkspace page="releases" />; }
export function ResultsPage() { return <PublicationWorkspace page="results" />; }
