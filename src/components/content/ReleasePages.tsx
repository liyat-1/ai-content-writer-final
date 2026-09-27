import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ThumbsDown, ThumbsUp } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ai/Sparkle";
import { MONTHS } from "@/lib/contentLibrary";
import { useMarketing } from "@/lib/marketing";
import { CONFIDENCE, INSIGHTS, RELEASES, RESULT_KPIS, TOTAL_PROPERTIES, versionsFor, type Confidence, type Release } from "@/lib/releases";

const card = "rounded-lg border border-border bg-card shadow-card";

function Page({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <MarketingShell title={title}>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <h1 className="font-display text-[30px] font-semibold text-card-foreground">{title}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>
        <div className="mt-6 space-y-6">{children}</div>
      </main>
    </MarketingShell>
  );
}

export function ConfidenceTag({ c }: { c: Confidence }) {
  return <span className={`rounded-sm px-1.5 py-0.5 text-[10.5px] font-semibold ${CONFIDENCE[c].cls}`}>{CONFIDENCE[c].label}</span>;
}

function Crumbs({ path, onPick }: { path: string[]; onPick: (i: number) => void }) {
  return (
    <nav aria-label="Drill-down" className="flex flex-wrap items-center gap-1 text-[12.5px]">
      {path.map((p, i) => (
        <span key={p + i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={13} className="text-muted-foreground" />}
          <button onClick={() => onPick(i)} className={i === path.length - 1 ? "font-semibold text-card-foreground" : "text-brand hover:underline"}>{p}</button>
        </span>
      ))}
    </nav>
  );
}

type Drill = { release?: Release; month?: number; campaign?: string };
function useDrill() {
  const [d, setD] = useState<Drill>({});
  const mk = useMarketing();
  const cname = mk.campaigns.find((c) => c.id === d.campaign)?.name;
  const path = ["All releases", d.release?.name, d.month !== undefined ? MONTHS[d.month] : undefined, cname].filter(Boolean) as string[];
  const pick = (i: number) => setD(i === 0 ? {} : i === 1 ? { release: d.release } : i === 2 ? { release: d.release, month: d.month } : d);
  return { d, setD, path, pick, campaigns: mk.campaigns };
}

export function ReleasesPage() {
  const { d, setD, path, pick, campaigns } = useDrill();
  const [removed, setRemoved] = useState<string[]>([]);
  const list = RELEASES.filter((r) => !removed.includes(r.id));
  return (
    <Page title="Releases" sub="Every release you've published, layered by date. For any month, the top-most release is live.">
      <section className={`${card} p-5`} aria-label="Release timeline">
        <div className="grid grid-cols-12 text-center text-[10.5px] font-semibold text-muted-foreground">{MONTHS.map((m) => <span key={m}>{m}</span>)}</div>
        <div className="mt-3 space-y-2">
          {list.map((r, i) => (
            <div key={r.id} className="grid grid-cols-12 items-center">
              <button onClick={() => setD({ release: r })} style={{ gridColumn: `${r.from + 1} / ${r.to + 2}` }} className={`truncate rounded-sm px-2 py-1.5 text-left text-[11px] font-semibold ${i === list.length - 1 ? "bg-brand text-brand-foreground" : "bg-muted text-card-foreground"}`}>
                {r.source === "AI generated" && <Sparkle size={10} className="mr-1 inline" />}{r.name}{i === list.length - 1 ? " · live on top" : ""}
              </button>
            </div>
          ))}
        </div>
      </section>

      <Crumbs path={path} onPick={pick} />

      {!d.release && (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((r) => (
            <article key={r.id} className={`${card} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="text-[15px] font-semibold text-card-foreground">{r.name}</h3><p className="text-[12px] text-muted-foreground">{MONTHS[r.from]}–{MONTHS[r.to]} · {r.source} · {r.created}</p></div>
                <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-brand">{r.status}</span>
              </div>
              <p className="mt-3 text-[12.5px] text-card-foreground">{r.properties} of {TOTAL_PROPERTIES} properties using it{r.editedCampaigns ? ` · ${r.editedCampaigns} campaign edited` : ""}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="brand" onClick={() => setD({ release: r })}>Open</Button>
                {r.id !== "default" && <Button size="sm" variant="ghost" onClick={() => setRemoved((x) => [...x, r.id])}>Remove release</Button>}
                <Link to="/content/results" className="ml-auto self-center text-[12px] font-semibold text-brand">View results →</Link>
              </div>
            </article>
          ))}
          {removed.length > 0 && <p className="text-[12px] text-muted-foreground md:col-span-2">Removed releases fall back to the layer below.</p>}
        </div>
      )}

      {d.release && d.month === undefined && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: d.release.to - d.release.from + 1 }, (_, i) => d.release!.from + i).map((m) => (
            <button key={m} onClick={() => setD({ ...d, month: m })} className={`${card} p-4 text-left hover:border-brand`}><p className="text-[15px] font-semibold text-card-foreground">{MONTHS[m]}</p><p className="text-[11.5px] text-muted-foreground">{campaigns.length} campaigns</p></button>
          ))}
        </div>
      )}

      {d.release && d.month !== undefined && !d.campaign && (
        <ul className={`${card} divide-y divide-border`}>
          {campaigns.map((c) => { const v = versionsFor(c.id, d.month!); return (
            <li key={c.id}><button onClick={() => setD({ ...d, campaign: c.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
              <span className="flex-1 text-[13px] font-semibold text-card-foreground">{c.name}</span>
              <span className="text-[11.5px] text-muted-foreground">{v.map((x) => `v${x.v}: ${x.properties}`).join(" · ")}</span>
              <span className="rounded-sm bg-muted px-1.5 text-[11px] font-semibold">live v{v[0].v}</span>
            </button></li>
          ); })}
        </ul>
      )}

      {d.campaign && d.month !== undefined && (
        <ol className={`${card} divide-y divide-border`}>
          {versionsFor(d.campaign, d.month).map((v, i) => (
            <li key={v.v} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-sm bg-muted text-[12px] font-bold">v{v.v}</span>
              <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-card-foreground">{v.kind} · {v.by} · {v.when}</span><span className="block text-[11.5px] text-muted-foreground">{v.note} · {v.properties} properties</span></span>
              {i === 0 ? <span className="text-[11px] font-semibold text-brand">Live</span> : <Button size="sm" variant="outline">Revert to v{v.v}</Button>}
            </li>
          ))}
        </ol>
      )}
    </Page>
  );
}

export function ResultsPage() {
  const { d, setD, path, pick, campaigns } = useDrill();
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  return (
    <Page title="Results" sub="How your releases perform. Last year counts the full period; this year only the days elapsed.">
      <section className="grid gap-3 sm:grid-cols-3">
        {RESULT_KPIS.map((k) => (
          <div key={k.label} className={`${card} p-4`}><p className="text-[11.5px] text-muted-foreground">{k.label}</p><p className="mt-1 text-[26px] font-semibold text-card-foreground">{k.value}</p><p className="text-[11.5px] text-muted-foreground">{k.delta}</p><div className="mt-2"><ConfidenceTag c={k.conf} /></div></div>
        ))}
      </section>

      <section className={`${card} p-5`}>
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-card-foreground"><Sparkle size={13} className="text-brand" />AI summary</h2>
        <ul className="mt-3 space-y-3">
          {INSIGHTS.map((i) => (
            <li key={i.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center gap-2"><ConfidenceTag c={i.conf} />
                <span className="ml-auto flex gap-1">
                  <Button size="icon" variant={votes[i.id] === "up" ? "secondary" : "ghost"} className="size-7" aria-label="Helpful" onClick={() => setVotes((v) => ({ ...v, [i.id]: "up" }))}><ThumbsUp size={13} /></Button>
                  <Button size="icon" variant={votes[i.id] === "down" ? "secondary" : "ghost"} className="size-7" aria-label="Not helpful" onClick={() => setVotes((v) => ({ ...v, [i.id]: "down" }))}><ThumbsDown size={13} /></Button>
                </span>
              </div>
              {i.conf === "early" ? <p className="mt-2 text-[12.5px] text-muted-foreground">Too early to tell. {i.evidence}</p> : <><p className="mt-2 text-[13px] text-card-foreground">{i.text}</p><p className="mt-1 text-[11.5px] text-muted-foreground">Evidence: {i.evidence}</p></>}
            </li>
          ))}
        </ul>
      </section>

      <Crumbs path={path} onPick={pick} />

      {!d.release && (
        <div className="grid gap-3 md:grid-cols-2">
          {RELEASES.map((r) => (
            <button key={r.id} onClick={() => setD({ release: r })} className={`${card} p-4 text-left hover:border-brand`}>
              <h3 className="text-[14px] font-semibold text-card-foreground">{r.name}</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">{r.id === "default" ? "7.1% click · last Sept 6.3%" : "7.9% click since Sep 27"}</p>
              <div className="mt-2"><ConfidenceTag c={r.id === "default" ? "solid" : "early"} /></div>
            </button>
          ))}
        </div>
      )}
      {d.release && d.month === undefined && (
        <div className={`${card} p-5`}>
          <p className="text-[12.5px] text-muted-foreground">Monthly click rate — v1 vs v2</p>
          <div className="mt-4 flex h-40 items-end gap-3">
            {Array.from({ length: d.release.to - d.release.from + 1 }, (_, i) => d.release!.from + i).map((m, i) => (
              <button key={m} onClick={() => setD({ ...d, month: m })} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end gap-1"><div className="flex-1 rounded-t-sm bg-muted" style={{ height: `${50 + i * 5}%` }} /><div className="flex-1 rounded-t-sm bg-brand" style={{ height: `${60 + i * 6}%` }} /></div>
                <span className="text-[11px] font-semibold">{MONTHS[m]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {d.release && d.month !== undefined && (
        <ul className={`${card} divide-y divide-border`}>
          {campaigns.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-[12.5px]">
              <span className="flex-1 font-semibold text-card-foreground">{c.name}</span>
              <span className="text-muted-foreground">v1 {(5 + (i % 3) * 0.6).toFixed(1)}% · v2 {(6 + (i % 4) * 0.5).toFixed(1)}%</span>
              <ConfidenceTag c={d.month === 8 ? "early" : "solid"} />
            </li>
          ))}
        </ul>
      )}
      <Link to="/content/releases" className="inline-block text-[12.5px] font-semibold text-brand">View versions →</Link>
    </Page>
  );
}
