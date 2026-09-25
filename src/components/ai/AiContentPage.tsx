import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  FlaskConical,
  History,
  Image as ImageIcon,
  LayoutTemplate,
  Mail,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import {
  AB_TESTS,
  AI_CAMPAIGNS,
  APPROACHES,
  CONTEXT_ITEMS,
  EDIT_ACTIONS,
  EVENTS,
  HOTEL,
  LEARNINGS,
  QUICK_PROMPTS,
  RELEASES,
  SCHEDULE,
  SEASON_HISTORY,
  TREND,
  VERSIONS,
  applyEdit,
  type AbTest,
  type AiCampaign,
  type ContentState,
} from "@/lib/aiContent";

/** Directful AI sparkle mark — simple four-point star. */
export function Sparkle({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 1.5c.6 5.4 3.6 8.4 10.5 10.5-6.9 2.1-9.9 5.1-10.5 10.5C11.4 17.1 8.4 14.1 1.5 12 8.4 9.9 11.4 6.9 12 1.5Z" fill="currentColor" />
    </svg>
  );
}

const STATE_STYLE: Record<ContentState, string> = {
  Draft: "bg-muted text-muted-foreground",
  "In review": "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Scheduled: "bg-sky-100 text-sky-800",
  Published: "bg-brand-soft text-brand",
  Archived: "bg-muted text-muted-foreground/70",
};

function StateBadge({ state }: { state: ContentState }) {
  return <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${STATE_STYLE[state]}`}>{state}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>{children}</div>;
}

function AiLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
      <Sparkle size={11} /> {children}
    </span>
  );
}

type Tab = "create" | "review" | "performance" | "tests" | "history" | "schedule" | "settings";
const TABS: { key: Tab; label: string }[] = [
  { key: "create", label: "Create" },
  { key: "review", label: "Review" },
  { key: "performance", label: "Performance" },
  { key: "tests", label: "A/B tests" },
  { key: "history", label: "Content history" },
  { key: "schedule", label: "Schedule" },
  { key: "settings", label: "Settings" },
];

type Stage = "source" | "invites" | "preparing" | "recommend" | "generating";

type Draft = AiCampaign & { state: ContentState };

export function AiContentPage() {
  const [tab, setTab] = useState<Tab>("create");
  const [stage, setStage] = useState<Stage>("source");
  const [prompt, setPrompt] = useState("");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const start = (p: string) => {
    setPrompt(p);
    setStage("preparing");
  };

  const generate = (approach: string) => {
    setStage("generating");
    setTimeout(() => {
      setDrafts(AI_CAMPAIGNS.map((c) => ({ ...c, state: "Draft" as ContentState })));
      setStage("source");
      setTab("review");
      toast.success(`Directful AI created ${approach.toLowerCase()} content for 7 campaigns`);
    }, 2200);
  };

  const open = drafts?.find((d) => d.id === openId) ?? null;

  return (
    <MarketingShell title="AI Content">
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <AiLabel>Directful AI</AiLabel>
            <p className="mt-1 text-[13px] text-muted-foreground">Create, review and improve your hotel marketing with Directful AI.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}>
            <Sparkle size={12} className="text-brand" /> Ask Directful AI
          </Button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setOpenId(null);
              }}
              className={`shrink-0 border-b-2 px-3 py-2 text-[12.5px] font-medium transition-colors ${
                tab === t.key ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.key === "review" && drafts && (
                <span className="ml-1.5 rounded bg-brand-soft px-1.5 text-[10.5px] text-brand">{drafts.filter((d) => d.state === "Draft").length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "create" && (
          <CreateFlow stage={stage} setStage={setStage} prompt={prompt} start={start} generate={generate} />
        )}
        {tab === "review" &&
          (open ? (
            <CampaignReview
              draft={open}
              onBack={() => setOpenId(null)}
              onChange={(d) => setDrafts((all) => all!.map((x) => (x.id === d.id ? d : x)))}
            />
          ) : (
            <ReviewHub drafts={drafts} setDrafts={setDrafts} onOpen={setOpenId} onCreate={() => setTab("create")} />
          ))}
        {tab === "performance" && <Performance />}
        {tab === "tests" && <AbTests />}
        {tab === "history" && <ContentHistory />}
        {tab === "schedule" && <Schedule />}
        {tab === "settings" && <Settings />}
      </div>
      {chatOpen && <AskPanel onClose={() => setChatOpen(false)} context={open?.name ?? TABS.find((t) => t.key === tab)!.label} />}
    </MarketingShell>
  );
}

/* ---------------- Create flow ---------------- */

function CreateFlow({
  stage,
  setStage,
  prompt,
  start,
  generate,
}: {
  stage: Stage;
  setStage: (s: Stage) => void;
  prompt: string;
  start: (p: string) => void;
  generate: (a: string) => void;
}) {
  const [input, setInput] = useState("");

  if (stage === "preparing") return <Preparing prompt={prompt} onDone={() => setStage("recommend")} />;
  if (stage === "recommend") return <Recommendation onBack={() => setStage("invites")} onGenerate={generate} />;
  if (stage === "generating")
    return (
      <Card className="py-16 text-center">
        <Sparkle size={28} className="mx-auto animate-pulse text-brand" />
        <p className="mt-3 text-[15px] font-semibold">Writing emails and texts for all 7 campaigns…</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">Subject lines, preheaders, body copy, CTAs and matching texts.</p>
      </Card>
    );

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-brand-soft/60 to-card">
        <h2 className="text-[22px] font-semibold tracking-tight">Create smarter content with Directful AI</h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted-foreground">
          Let AI use your hotel's campaigns, brand, content and performance history to help plan and create your next messages.
        </p>
      </Card>

      {stage === "source" ? (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Step 1 · What would you like to work on?</p>
          <div className="grid gap-3 md:grid-cols-3">
            <SourceCard title="Automated Invites" meta="7 campaigns · Email + Text" desc="Create and refresh content across your automated guest follow-ups." onClick={() => setStage("invites")} />
            <SourceCard title="Drip Campaigns" meta="Coming soon" desc="Create content across your guest communication sequences." disabled />
            <SourceCard title="OTA Buster" meta="Guest Journey · Coming soon" desc="Create content across the guest journey." disabled />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setStage("source")} className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
            <ArrowLeft size={13} /> Back
          </button>
          <Card>
            <h3 className="text-[16px] font-semibold">Automated Invites</h3>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Directful AI can create and refine content across your seven automated guest campaigns.</p>
            <div className="mt-4 divide-y divide-border rounded-md border border-border">
              {AI_CAMPAIGNS.map((c, i) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid size-6 place-items-center rounded bg-muted text-[11px] font-semibold">{i + 1}</span>
                  <div className="min-w-[180px] flex-1">
                    <p className="text-[13px] font-semibold">{c.name}</p>
                    <p className="text-[12px] text-muted-foreground">{c.purpose}</p>
                  </div>
                  <span className="text-[11.5px] text-muted-foreground">Email: Existing · Text: Existing</span>
                  <span className="text-[11.5px] text-muted-foreground">Updated {c.lastUpdated}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-[14px] font-semibold">What would you like Directful AI to work on?</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="Create a fall content plan for my Automated Invites."
              className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2.5 text-[13.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} onClick={() => start(q)} className="rounded-full border border-border px-3 py-1 text-[12px] hover:border-brand hover:text-brand">
                  {q}
                </button>
              ))}
              <Button className="ml-auto" size="sm" onClick={() => start(input || "Create a fall content plan for my Automated Invites.")}>
                <Sparkle size={12} /> Start
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SourceCard({ title, meta, desc, onClick, disabled }: { title: string; meta: string; desc: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-5 text-left transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-brand enabled:hover:shadow-lift disabled:opacity-55"
    >
      <p className="text-[15px] font-semibold">{title}</p>
      <p className="mt-0.5 text-[11.5px] font-medium text-brand">{meta}</p>
      <p className="mt-2 text-[12.5px] text-muted-foreground">{desc}</p>
    </button>
  );
}

function Preparing({ prompt, onDone }: { prompt: string; onDone: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= CONTEXT_ITEMS.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), 280);
    return () => clearTimeout(t);
  }, [n, onDone]);
  return (
    <Card className="mx-auto max-w-lg">
      <p className="text-[12px] text-muted-foreground">“{prompt}”</p>
      <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold">
        <Sparkle className="animate-pulse text-brand" /> Directful AI is preparing your content plan
      </p>
      <ul className="mt-4 space-y-2">
        {CONTEXT_ITEMS.map((c, i) => (
          <li key={c} className={`flex items-center gap-2 text-[13px] transition-opacity ${i < n ? "opacity-100" : "opacity-35"}`}>
            <span className={`grid size-4 place-items-center rounded-full ${i < n ? "bg-brand text-brand-foreground" : "border border-border"}`}>
              {i < n && <Check size={10} />}
            </span>
            {c}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Recommendation({ onBack, onGenerate }: { onBack: () => void; onGenerate: (a: string) => void }) {
  const [pick, setPick] = useState("A");
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft size={13} /> Back
      </button>
      <Card>
        <AiLabel>AI recommendation</AiLabel>
        <h3 className="mt-1 text-[17px] font-semibold">Refresh all 7 campaigns with fall content</h3>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Your Fall 2025 content lifted click rate from 5.4% to 6.8%. 15 Months and 15 Months+ are down 8–12% versus their previous version, so they get the biggest refresh.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {EVENTS.map((e) => (
            <div key={e.name} className="rounded-md border border-border bg-muted/40 p-3">
              <AiLabel>Event</AiLabel>
              <p className="mt-1 text-[13px] font-semibold">{e.name}</p>
              <p className="text-[11.5px] text-muted-foreground">{e.date} · {e.note}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-[14px] font-semibold">Directful AI created 3 approaches</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {APPROACHES.map((a) => (
            <button
              key={a.key}
              onClick={() => setPick(a.key)}
              className={`rounded-lg border p-4 text-left transition-colors ${pick === a.key ? "border-brand bg-brand-soft/50" : "border-border hover:border-brand/50"}`}
            >
              <p className="text-[13.5px] font-semibold">Option {a.key} — {a.name}</p>
              <p className="text-[11.5px] font-medium text-brand">{a.tone}</p>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">Nothing is published until you review and approve it.</p>
          <Button onClick={() => onGenerate(APPROACHES.find((a) => a.key === pick)!.name)}>
            <Sparkle size={12} /> Generate content
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Review ---------------- */

function ReviewHub({
  drafts,
  setDrafts,
  onOpen,
  onCreate,
}: {
  drafts: Draft[] | null;
  setDrafts: (d: Draft[]) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [publishing, setPublishing] = useState(false);
  if (!drafts)
    return (
      <Card className="py-14 text-center">
        <Sparkle size={24} className="mx-auto text-brand" />
        <p className="mt-3 text-[15px] font-semibold">Let's create your first content plan</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">Nothing is waiting for review yet.</p>
        <Button className="mt-4" size="sm" onClick={onCreate}>Start with Directful AI</Button>
      </Card>
    );
  const approved = drafts.filter((d) => d.state === "Approved").length;
  const published = drafts.filter((d) => d.state === "Published").length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold">Your content is ready to review</h2>
          <p className="text-[12.5px] text-muted-foreground">
            {approved} of {drafts.length} approved{published > 0 ? ` · ${published} published` : ""} · 14 messages (7 emails, 7 texts)
          </p>
        </div>
        <div className="flex gap-2">
          {drafts.some((d) => d.state === "Draft") && (
            <Button variant="outline" size="sm" onClick={() => setDrafts(drafts.map((d) => (d.state === "Draft" ? { ...d, state: "Approved" } : d)))}>Approve all</Button>
          )}
          <Button size="sm" disabled={approved === 0} onClick={() => setPublishing(true)}>
            <Send size={13} /> Publish release
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {drafts.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold">{d.name}</p>
              <StateBadge state={d.state} />
            </div>
            <p className="mt-2 truncate text-[12.5px]"><Mail size={12} className="mr-1 inline text-muted-foreground" />{d.email.subject}</p>
            <p className="mt-1 line-clamp-1 text-[12.5px] text-muted-foreground"><MessageSquare size={12} className="mr-1 inline" />{d.text.message}</p>
            <p className="mt-2 text-[11.5px] text-muted-foreground"><Sparkle size={10} className="mr-1 inline text-brand" />{d.rationale}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onOpen(d.id)}>Review</Button>
              {d.state === "Draft" && (
                <Button size="sm" variant="ghost" onClick={() => setDrafts(drafts.map((x) => (x.id === d.id ? { ...x, state: "Approved" } : x)))}>
                  <Check size={13} /> Approve
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      {publishing && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-foreground/45 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-float">
            <h3 className="text-[16px] font-semibold">Publish Automated Invites — Fall 2026?</h3>
            <ul className="mt-3 space-y-1 text-[12.5px]">
              {drafts.map((d) => (
                <li key={d.id} className={d.state === "Approved" ? "" : "text-muted-foreground line-through"}>
                  {d.state === "Approved" ? "✓" : "–"} {d.name}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted-foreground">Only approved campaigns are published. Previous versions are kept in Content history.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPublishing(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={() => {
                  setDrafts(drafts.map((d) => (d.state === "Approved" ? { ...d, state: "Published" } : d)));
                  setPublishing(false);
                  toast.success(`${approved} campaigns published`);
                }}
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignReview({ draft, onBack, onChange }: { draft: Draft; onBack: () => void; onChange: (d: Draft) => void }) {
  const [channel, setChannel] = useState<"email" | "text">("email");
  const setEmail = (k: keyof Draft["email"], v: string) => onChange({ ...draft, email: { ...draft.email, [k]: v } });
  const edit = (a: string) => {
    if (a === "Change the CTA") {
      onChange({ ...draft, email: { ...draft.email, cta: "Reserve your room" } });
    } else if (a.startsWith("Create a matching")) {
      setChannel(a.endsWith("text") ? "text" : "email");
    } else if (channel === "email") {
      setEmail("body", applyEdit(draft.email.body, a));
    } else {
      onChange({ ...draft, text: { ...draft.text, message: applyEdit(draft.text.message, a) } });
    }
    toast(`Directful AI: ${a.toLowerCase()} — saved as a new version`);
  };
  const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] outline-none focus:border-brand";
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft size={13} /> All campaigns
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-semibold">{draft.name}</h2>
          <StateBadge state={draft.state} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onChange({ ...draft, state: "In review" })}>Send for review</Button>
          <Button size="sm" onClick={() => onChange({ ...draft, state: "Approved" })}><Check size={13} /> Approve</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-4 flex gap-1 rounded-md bg-muted p-1 text-[12.5px]">
            {(["email", "text"] as const).map((c) => (
              <button key={c} onClick={() => setChannel(c)} className={`flex-1 rounded px-3 py-1.5 font-medium ${channel === c ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                {c === "email" ? "Email" : "Text"}
              </button>
            ))}
          </div>
          {channel === "email" ? (
            <div className="space-y-3">
              {(["subject", "preheader", "heading"] as const).map((k) => (
                <label key={k} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</span>
                  <input className={`${field} mt-1`} value={draft.email[k]} onChange={(e) => setEmail(k, e.target.value)} />
                </label>
              ))}
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Body</span>
                <textarea rows={5} className={`${field} mt-1`} value={draft.email.body} onChange={(e) => setEmail("body", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Button</span>
                <input className={`${field} mt-1`} value={draft.email.cta} onChange={(e) => setEmail("cta", e.target.value)} />
              </label>
            </div>
          ) : (
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Message</span>
              <textarea rows={5} className={`${field} mt-1`} value={draft.text.message} onChange={(e) => onChange({ ...draft, text: { ...draft.text, message: e.target.value } })} />
              <span className="mt-1 block text-[11.5px] text-muted-foreground">{draft.text.message.length} characters</span>
            </label>
          )}
          <div className="mt-4 border-t border-border pt-4">
            <AiLabel>Edit with AI</AiLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {EDIT_ACTIONS.map((a) => (
                <button key={a} onClick={() => edit(a)} className="rounded-full border border-border px-3 py-1 text-[12px] hover:border-brand hover:text-brand">{a}</button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <AiLabel>Why this content</AiLabel>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">{draft.rationale}</p>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold"><LayoutTemplate size={14} /> Recommended template</p>
            <p className="mt-1 text-[13px]">{draft.template}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">{draft.templateReason}</p>
            <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => toast("Template applied")}>Use template</Button></div>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold"><ImageIcon size={14} /> Suggested image</p>
            <p className="mt-1 text-[13px]">{draft.image}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">From your Media Library. {draft.imageReason}</p>
            <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => toast("Image added to email")}>Add to email</Button></div>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold"><History size={14} /> Versions</p>
            <ul className="mt-2 space-y-2">
              {VERSIONS.map((v) => (
                <li key={v.v} className="flex items-start justify-between gap-2 text-[12px]">
                  <span><b>{v.v}</b> {v.label}<br /><span className="text-muted-foreground">{v.by} · {v.when}</span></span>
                  <StateBadge state={v.state} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Performance ---------------- */

function statusOf(change: number) {
  if (change >= 10) return { label: "Strong", cls: "text-emerald-700" };
  if (change >= 0) return { label: "Stable", cls: "text-foreground" };
  if (change > -5) return { label: "Watch", cls: "text-amber-700" };
  if (change > -10) return { label: "Needs attention", cls: "text-orange-700" };
  return { label: "Review", cls: "text-destructive" };
}

function Performance() {
  const counts = useMemo(() => {
    const s = AI_CAMPAIGNS.map((c) => statusOf(c.change).label);
    return { improving: s.filter((x) => x === "Strong" || x === "Stable").length, under: s.filter((x) => x === "Needs attention" || x === "Review").length };
  }, []);
  const r = RELEASES[0];
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[16px] font-semibold">{r.name}</p>
            <p className="text-[12px] text-muted-foreground">Published {r.published} · {r.campaigns} campaigns</p>
          </div>
          <StateBadge state={r.state} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Overall click rate", `${r.clickRate}%`],
            ["Bookings", String(r.bookings)],
            ["Improving", `${counts.improving} campaigns`],
            ["Underperforming", `${counts.under} campaigns`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md bg-muted/50 p-3">
              <p className="text-[11px] text-muted-foreground">{k}</p>
              <p className="text-[18px] font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-52">
          <ResponsiveContainer>
            <AreaChart data={TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(l, p) => `${l} · ${p?.[0]?.payload?.version ?? ""}`} />
              <Area dataKey="rate" name="Click rate" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-[12.5px]">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2.5">Campaign</th><th className="px-4">Click rate</th><th className="px-4">vs previous</th><th className="px-4">Status</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {AI_CAMPAIGNS.map((c) => {
              const s = statusOf(c.change);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 tabular-nums">{c.clickRate}%</td>
                  <td className={`px-4 tabular-nums ${c.change < 0 ? "text-destructive" : "text-emerald-700"}`}>{c.change > 0 ? "+" : ""}{c.change}%</td>
                  <td className={`px-4 font-medium ${s.cls}`}>{s.label}</td>
                  <td className="px-4 text-right">{c.change < -5 && <button onClick={() => toast("Added to your next release")} className="text-[12px] font-medium text-brand">Refresh</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card>
        <AiLabel>AI insight</AiLabel>
        <p className="mt-1.5 text-[13px]"><b>15 Months+ engagement is down 12%</b> compared with the previous version. The subject line changed from a seasonal angle to a generic one.</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">Suggested: reuse the successful seasonal approach from 3 Months.</p>
        <p className="mt-3 text-[13px] font-semibold">Recommended for your next release</p>
        <ul className="mt-1 list-inside list-disc text-[12.5px] text-muted-foreground">
          <li>Refresh 15 Months+</li><li>Reuse the successful seasonal approach</li><li>Test an offer in 15 Months</li>
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- A/B tests ---------------- */

function AbTests() {
  const [tests, setTests] = useState<AbTest[]>(AB_TESTS);
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">Tests compare two versions of the same campaign for your hotel only.</p>
        <Button size="sm" onClick={() => setCreating(true)}><FlaskConical size={13} /> New test</Button>
      </div>
      {tests.map((t) => {
        const lead = t.b.rate >= t.a.rate ? "B" : "A";
        return (
          <Card key={t.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[14px] font-semibold">{t.campaign} · {t.name}</p>
                <p className="text-[12px] text-muted-foreground">Testing {t.element} · Winning metric: {t.metric}</p>
              </div>
              <span className="rounded bg-muted px-2 py-0.5 text-[11.5px] font-semibold">{t.status}</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["a", "b"] as const).map((k) => (
                <div key={k} className={`rounded-md border p-3 ${t.status !== "Collecting data" && lead === k.toUpperCase() ? "border-brand" : "border-border"}`}>
                  <p className="text-[11px] font-semibold text-muted-foreground">Version {k.toUpperCase()}</p>
                  <p className="mt-0.5 text-[12.5px]">{t[k].label}</p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums">{t[k].rate}%</p>
                  <p className="text-[11px] text-muted-foreground">{t[k].sends.toLocaleString()} sends</p>
                </div>
              ))}
            </div>
            {t.status === "Clear leader" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => { setTests(tests.map((x) => (x.id === t.id ? { ...x, status: "Test complete" } : x))); toast.success(`Version ${lead} is now the live content`); }}>Choose winner</Button>
                <Button size="sm" variant="outline" onClick={() => toast("Test continues")}>Keep testing</Button>
              </div>
            )}
          </Card>
        );
      })}
      {creating && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-foreground/45 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-float">
            <h3 className="text-[16px] font-semibold">Create an A/B test</h3>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Test two versions of your 3-Month message to see which performs better.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
              {["Subject line", "Email content", "Hero image", "CTA", "Text message", "Offer"].map((e) => (
                <label key={e} className="flex items-center gap-2 rounded border border-border px-3 py-2"><input type="radio" name="el" defaultChecked={e === "Subject line"} /> {e}</label>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground"><Sparkle size={10} className="mr-1 inline text-brand" />Directful AI will write Version B. Traffic splits 50/50.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
              <Button size="sm" onClick={() => {
                setTests([{ id: `t${Date.now()}`, campaign: "3 Months", name: "New test", element: "Subject line", metric: "Click rate", a: { label: "Current content", rate: 0, sends: 0 }, b: { label: "AI version", rate: 0, sends: 0 }, status: "Collecting data" }, ...tests]);
                setCreating(false);
              }}>Start test</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- History / Schedule / Settings ---------------- */

function ContentHistory() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="text-[14px] font-semibold">Releases</p>
        <ul className="mt-3 divide-y divide-border">
          {RELEASES.map((r) => (
            <li key={r.name} className="flex items-center justify-between py-2.5 text-[12.5px]">
              <span><b>{r.name}</b><br /><span className="text-muted-foreground">Published {r.published} · {r.campaigns} campaigns · {r.clickRate}% click rate</span></span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <p className="text-[14px] font-semibold">3 Months · seasonal history</p>
        <ul className="mt-3 space-y-2">
          {SEASON_HISTORY.map((s) => (
            <li key={s.season} className="flex items-center gap-3 text-[12.5px]">
              <span className="w-20">{s.season}</span>
              <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-brand" style={{ width: `${s.rate * 10}%` }} /></div>
              <span className="tabular-nums">{s.rate}%</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="lg:col-span-2">
        <AiLabel>What Directful AI has learned about your hotel</AiLabel>
        <ul className="mt-2 space-y-1.5 text-[13px]">
          {LEARNINGS.map((l) => <li key={l} className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-brand" />{l}</li>)}
        </ul>
        <p className="mt-3 text-[11.5px] text-muted-foreground">Learning uses only {HOTEL.name}'s own content and results.</p>
      </Card>
    </div>
  );
}

function Schedule() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {SCHEDULE.map((m) => (
        <Card key={m.month}>
          <p className="flex items-center gap-1.5 text-[14px] font-semibold"><Clock size={14} />{m.month}</p>
          <ul className="mt-3 space-y-2 text-[12.5px]">
            {m.items.map((i) => <li key={i} className="rounded-md bg-muted/50 px-3 py-2">{i}</li>)}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function Settings() {
  const [freq, setFreq] = useState("Quarterly");
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <p className="text-[14px] font-semibold">Content refresh reminders</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">How often should Directful AI suggest new content?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Monthly", "Quarterly", "Seasonally", "Only when performance drops"].map((f) => (
            <button key={f} onClick={() => setFreq(f)} className={`rounded-md border px-3 py-1.5 text-[12.5px] ${freq === f ? "border-brand bg-brand-soft text-brand" : "border-border"}`}>{f}</button>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-[14px] font-semibold">Brand voice</p>
        <p className="mt-1 text-[13px]">{HOTEL.voice}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Learned from your published content and edits. {HOTEL.location}.</p>
      </Card>
    </div>
  );
}

/* ---------------- Ask Directful AI ---------------- */

function AskPanel({ onClose, context }: { onClose: () => void; context: string }) {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: `I'm looking at ${context}. What would you like to know or change?` },
  ]);
  const [input, setInput] = useState("");
  const send = (q: string) => {
    if (!q.trim()) return;
    const reply = /work|best|perform/i.test(q)
      ? "Your 3 Months campaign is strongest at 8.2% (+21%). Seasonal subject lines have worked best for your guests. Want me to apply that approach to 15 Months+?"
      : /shorter|short/i.test(q)
        ? "I can shorten the body copy by about 40% while keeping the booking CTA. Open a campaign in Review and choose “Make it shorter”."
        : "Here's my suggestion: refresh 15 Months and 15 Months+ first — they're down 8–12% vs their previous version. I can draft both for your review.";
    setMsgs((m) => [...m, { me: true, text: q }, { me: false, text: reply }]);
    setInput("");
  };
  return (
    <div className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-sm flex-col border-l border-border bg-card shadow-float">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold"><Sparkle className="text-brand" /> Ask Directful AI</p>
        <button onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-[12.5px] ${m.me ? "ml-auto bg-brand text-brand-foreground" : "bg-muted"}`}>{m.text}</div>
        ))}
      </div>
      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {["What worked best?", "Make it shorter", "What should I refresh?"].map((q) => (
            <button key={q} onClick={() => send(q)} className="rounded-full border border-border px-2.5 py-0.5 text-[11.5px] hover:border-brand">{q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your content…" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-[13px] outline-none focus:border-brand" />
          <Button size="sm" type="submit"><Send size={13} /></Button>
        </form>
      </div>
    </div>
  );
}
