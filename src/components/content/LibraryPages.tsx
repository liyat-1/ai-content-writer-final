import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Sparkle } from "@/components/ai/Sparkle";
import { useLibrary } from "@/lib/contentLibrary";

function Page({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <MarketingShell title={`Content Library · ${title}`}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-[22px] font-semibold tracking-tight text-card-foreground">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>
        <div className="mt-5">{children}</div>
      </div>
    </MarketingShell>
  );
}
const card = "rounded-lg border border-border bg-card shadow-card";

export function PublishedPage() {
  const { publications, campaigns } = useLibrary();
  const name = (id: string) => campaigns.find((c) => c.id === id)?.name ?? id;
  return (
    <Page title="Published" sub="What was published, when, and exactly which campaigns, versions, segments and channels went live.">
      <div className="space-y-3">
        {publications.map((p, i) => (
          <div key={p.id} className={`${card} p-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold text-card-foreground">{p.name}</h3>
              {i === 0 && <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[10.5px] font-semibold text-brand-foreground">Live now</span>}
              <span className="ml-auto text-[12px] text-muted-foreground">Published {p.when}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{p.campaigns.length} campaigns · {p.pieces} content pieces · {p.channels} · {p.segments} · versions {p.version}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{p.campaigns.map((id) => <span key={id} className="rounded-sm bg-muted px-2 py-0.5 text-[11.5px] text-card-foreground">{name(id)}</span>)}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function HistoryPage() {
  const { campaigns, versions } = useLibrary();
  const [sel, setSel] = useState(campaigns[1]?.id ?? campaigns[0].id);
  const list = versions.filter((v) => v.campaignId === sel);
  return (
    <Page title="History" sub="Every version of every campaign — kept here so the Create workspace stays focused on creating.">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className={`${card} p-1.5`}>
          {campaigns.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} className={`flex w-full justify-between rounded-sm px-3 py-2 text-left text-[12.5px] ${sel === c.id ? "bg-brand-soft font-semibold text-brand" : "hover:bg-muted"}`}>
              {c.name}<span className="text-[11px] text-muted-foreground">v{c.version}</span>
            </button>
          ))}
        </div>
        <ol className={`${card} divide-y divide-border`}>
          {list.map((v, i) => (
            <li key={`${v.v}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-sm bg-muted text-[12px] font-bold text-card-foreground">v{v.v}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-card-foreground">{v.by === "Directful AI" && <Sparkle size={11} className="text-brand" />}{v.label}</span>
                <span className="block text-[11.5px] text-muted-foreground">{v.by} · {v.when}</span>
              </span>
              {i === 0 && <span className="text-[11px] font-semibold text-brand">Current</span>}
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}

const PERF = [
  ["After Last Visit", 7.8, 6], ["3 Months", 8.2, 21], ["6 Months", 6.1, 4], ["9 Months", 5.4, -3], ["12 Months", 4.9, 2],
  ["15 Months", 3.4, -8], ["15 Months+", 2.7, -12], ["Booking Confirmation", 61.2, 1], ["Pre-Arrival", 44.8, 5], ["Post-Stay Thank You", 12.3, 3],
] as const;

export function PerformancePage() {
  return (
    <Page title="Performance" sub="How your published content performs. Sample figures for Holiday Inn Times Square.">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[["Click rate", "6.8%", "+0.7 pts vs Summer"], ["Bookings from content", "42", "+7 vs Summer"], ["Best performer", "3 Months", "Seasonal subject line"]].map(([k, v, s]) => (
          <div key={k} className={`${card} p-4`}><p className="text-[11.5px] text-muted-foreground">{k}</p><p className="mt-1 text-[22px] font-semibold text-card-foreground">{v}</p><p className="text-[11.5px] text-brand">{s}</p></div>
        ))}
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="px-4 py-2.5 font-medium">Campaign</th><th className="px-4 py-2.5 font-medium">Click rate</th><th className="px-4 py-2.5 font-medium">vs previous version</th></tr></thead>
          <tbody>
            {PERF.map(([n, r, d]) => (
              <tr key={n} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-semibold text-card-foreground">{n}</td>
                <td className="px-4 py-2.5">{r}%</td>
                <td className={`px-4 py-2.5 ${d >= 0 ? "text-brand" : "text-destructive"}`}>{d >= 0 ? <ArrowUpRight size={13} className="inline" /> : <ArrowDownRight size={13} className="inline" />} {Math.abs(d)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

const TESTS = [
  { c: "3 Months", el: "Email subject", a: ["Fall in New York is calling", 6.9], b: ["Your room above Times Square awaits", 8.4], s: "Clear leader" },
  { c: "15 Months+", el: "Text message", a: ["No offer", 2.6], b: ["Book direct and save 10%", 2.9], s: "Collecting data" },
  { c: "After Last Visit", el: "Hero image", a: ["Lobby arrival", 3.1], b: ["Rooftop at dusk", 3.2], s: "No clear difference" },
] as const;

export function AbTestsPage() {
  return (
    <Page title="A/B Tests" sub="Tests and results, kept separate from creation.">
      <div className="space-y-3">
        {TESTS.map((t) => (
          <div key={t.c + t.el} className={`${card} p-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-semibold text-card-foreground">{t.c} · {t.el}</h3>
              <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{t.s}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[["A", t.a], ["B", t.b]].map(([k, v]) => {
                const [label, rate] = v as readonly [string, number];
                return <div key={k as string} className="rounded-md bg-muted/50 px-3 py-2.5"><p className="text-[11px] text-muted-foreground">Version {k as string}</p><p className="text-[13px] font-medium text-card-foreground">{label}</p><p className="text-[18px] font-semibold text-card-foreground">{rate}%</p></div>;
              })}
            </div>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-brand/35 px-3 py-1.5 text-[12px] font-semibold text-brand hover:bg-brand-soft"><Sparkle size={11} />Create variation with AI</button>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function SettingsPage() {
  const [voice, setVoice] = useState("Warm, confident, city-savvy. We invite guests back — we don't sell to them.");
  return (
    <Page title="Settings" sub="How Directful AI writes for Holiday Inn Times Square.">
      <div className={`${card} max-w-2xl space-y-4 p-5`}>
        <label className="block"><span className="mb-1 block text-[12px] font-semibold text-card-foreground">Brand voice</span>
          <textarea rows={3} value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px]" /></label>
        {["Always keep a direct-booking reason in invites", "Avoid heavy discount language", "Suggest images from the Media Library"].map((l) => (
          <label key={l} className="flex items-center gap-2.5 text-[13px] text-card-foreground"><input type="checkbox" defaultChecked className="accent-[var(--brand)]" />{l}</label>
        ))}
      </div>
    </Page>
  );
}
