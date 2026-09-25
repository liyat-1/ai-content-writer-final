import { useEffect, useState } from "react";
import { Check, HelpCircle, ShieldCheck, X } from "lucide-react";
import { Sparkle } from "@/components/ai/Sparkle";
import { AiEditPanel } from "@/components/ai/AiEditPanel";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { checkContent } from "@/components/marketing/contentChecks";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmailMock, IMAGES, OriginMarker, StatusBadge, fill } from "./shared";
import {
  IMAGE_LABEL, SEGMENT_LABEL, approveCampaign, saveCampaign, useLibrary,
  type Channel, type LibraryCampaign, type Segment,
} from "@/lib/contentLibrary";
import type { Copy } from "@/lib/aiWriter";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const input = "w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-card-foreground outline-none transition-colors focus:border-brand";

/**
 * The editor hotels already know — content, live preview and a Content
 * Intelligence column — with Directful AI as one more editing tool.
 */
export function ReviewWorkspace({ id, openAi = false, onClose }: { id: string; openAi?: boolean; onClose: () => void }) {
  const { campaigns } = useLibrary();
  const source = campaigns.find((c) => c.id === id)!;
  const [draft, setDraft] = useState<LibraryCampaign>(() => clone(source));
  const [baseline, setBaseline] = useState(() => JSON.stringify(source.content));
  const [segment, setSegment] = useState<Segment>("direct");
  const [channel, setChannel] = useState<Channel>(source.channels[0]);
  const [ai, setAi] = useState(openAi);
  const [aiTouched, setAiTouched] = useState(false);
  const [panel, setPanel] = useState<"help" | "spam" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [flash, setFlash] = useState(false);

  const c = draft.content[segment];
  const dirty = JSON.stringify(draft.content) !== baseline;
  const saved = campaigns.find((x) => x.id === id)!;

  // Viewing a segment/channel counts as reviewing it.
  const markReviewed = (s: Segment, ch: Channel) =>
    setDraft((d) => (d.content[s].reviewed[ch] ? d : { ...d, content: { ...d.content, [s]: { ...d.content[s], reviewed: { ...d.content[s].reviewed, [ch]: true } } } }));
  useEffect(() => markReviewed(segment, channel), [segment, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = (fn: (s: LibraryCampaign["content"][Segment]) => void) =>
    setDraft((d) => { const n = clone(d); fn(n.content[segment]); return n; });

  const save = () => {
    saveCampaign(draft, aiTouched ? "AI refinement + manual edit" : "Manual edit");
    setBaseline(JSON.stringify(draft.content));
    setAiTouched(false);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1600);
  };

  const copy: Copy = channel === "email"
    ? { kind: "email", email: { subject: c.email.subject, preheader: c.email.preheader, heading: c.email.heading, body: c.email.body, ctaLabel: c.email.cta } }
    : { kind: "text", text: { message: c.text } };

  const applyAi = (next: Copy) => {
    edit((s) => {
      if (next.kind === "email") s.email = { subject: next.email.subject, preheader: next.email.preheader, heading: next.email.heading, body: next.email.body, cta: next.email.ctaLabel };
      else s.text = next.text.message;
    });
    setAiTouched(true);
  };

  const spam = checkContent(channel === "text" ? [{ label: "message", text: c.text }] : [{ label: "subject", text: c.email.subject }, { label: "body", text: c.email.body }]);
  const spamOk = spam.every((s) => s.status !== "warn");
  const segs: Segment[] = ["direct", "ota"];
  const checklist = [
    ...(draft.channels.includes("email") ? [["Email reviewed", segs.every((s) => draft.content[s].reviewed.email)]] : []),
    ...(draft.channels.includes("text") ? [["Text reviewed", segs.every((s) => draft.content[s].reviewed.text)]] : []),
    ["Direct guest content reviewed", draft.channels.every((ch) => draft.content.direct.reviewed[ch])],
    ["OTA content reviewed", draft.channels.every((ch) => draft.content.ota.reviewed[ch])],
    ["Spam check passed", spamOk],
    ["Content saved", !dirty],
  ] as [string, boolean][];
  const allDone = checklist.every(([, v]) => v);

  const tool = (on: boolean) => `inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${on ? "border-brand bg-brand-soft text-brand" : "border-border text-muted-foreground hover:text-foreground"}`;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/70 p-2 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && (dirty ? setConfirm(true) : onClose())}>
      <section role="dialog" aria-modal="true" aria-label={`${draft.name} content`} className="flex h-[94vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-lg border border-border bg-canvas shadow-float">
        <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-medium text-muted-foreground">{draft.kind}</p>
            <h2 className="flex items-center gap-2 truncate text-[17px] font-semibold text-card-foreground">{draft.name}<StatusBadge status={saved.status} /></h2>
          </div>
          <span className={`text-[11.5px] ${flash ? "font-semibold text-brand" : dirty ? "text-warning" : "text-muted-foreground"}`}>{flash ? "✓ Saved" : dirty ? "Unsaved changes" : "Saved"}</span>
          <button disabled={!dirty} onClick={save} className="rounded-sm bg-foreground px-3 py-1.5 text-[12.5px] font-semibold text-background disabled:opacity-35">Save</button>
          <button onClick={() => (dirty ? setConfirm(true) : onClose())} aria-label="Close editor" className="grid size-8 place-items-center rounded-sm text-muted-foreground hover:bg-muted"><X size={18} /></button>
        </header>

        {/* Toolbar: segment, channel and editor utilities */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/70 px-4 py-2.5 sm:px-5">
          <label className="flex items-center gap-2 text-[11.5px] font-medium text-muted-foreground">
            Guest segment
            <select value={segment} onChange={(e) => setSegment(e.target.value as Segment)} className="rounded-sm border border-border bg-background px-2 py-1.5 text-[12.5px] font-semibold text-card-foreground">
              {segs.map((s) => <option key={s} value={s}>{SEGMENT_LABEL[s]}</option>)}
            </select>
          </label>
          <div className="flex gap-0.5 rounded-sm bg-muted p-0.5">
            {draft.channels.map((ch) => (
              <button key={ch} onClick={() => setChannel(ch)} className={`rounded-sm px-3 py-1 text-[12px] font-semibold ${channel === ch ? "bg-card text-card-foreground shadow-card" : "text-muted-foreground"}`}>{ch === "email" ? "Email" : "Text"}</button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <button className={tool(panel === "help")} onClick={() => setPanel((p) => (p === "help" ? null : "help"))}><HelpCircle size={13} />Help</button>
            <button className={tool(panel === "spam")} onClick={() => setPanel((p) => (p === "spam" ? null : "spam"))}><ShieldCheck size={13} />Spam check</button>
            <button onClick={() => setAi(true)} className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-semibold ai-button ai-pulse">
              <Sparkle size={12} className="ai-twinkle" />Edit with AI
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_300px]">
            {/* Column 1 — Content */}
            <div className="min-w-0 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Content · {SEGMENT_LABEL[segment]}</p>
              {panel && (
                <div className="rounded-md border border-border bg-muted/40 px-3.5 py-3 text-[12px] text-muted-foreground">
                  {panel === "help" ? (
                    <p>Edit any field directly, or open <strong className="text-brand">Edit with AI</strong> — it always works from what's in the editor now, including your own edits. Merge tags like {"{first_name}"} fill in per guest.</p>
                  ) : (
                    <ul className="space-y-1">{spam.map((s) => <li key={s.label}><span className={s.status === "warn" ? "text-warning" : "text-brand"}>●</span> <strong className="text-card-foreground">{s.label}:</strong> {s.detail}</li>)}</ul>
                  )}
                </div>
              )}
              {channel === "email" ? (
                <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-card">
                  {([["subject", "Subject line"], ["preheader", "Preview text"], ["heading", "Heading"]] as const).map(([k, l]) => (
                    <label key={k} className="block"><span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">{l}</span>
                      <input className={input} value={c.email[k]} onChange={(e) => edit((s) => { s.email[k] = e.target.value; })} /></label>
                  ))}
                  <label className="block"><span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">Email content</span>
                    <textarea rows={6} className={input} value={c.email.body} onChange={(e) => edit((s) => { s.email.body = e.target.value; })} /></label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">Button (CTA)</span>
                      <input className={input} value={c.email.cta} onChange={(e) => edit((s) => { s.email.cta = e.target.value; })} /></label>
                    <label className="block"><span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">Image</span>
                      <select className={input} value={draft.image} onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}>
                        {Object.keys(IMAGES).map((k) => <option key={k} value={k}>{IMAGE_LABEL[k]}</option>)}
                      </select></label>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground">Template · <strong className="text-card-foreground">{draft.template}</strong></p>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-4 shadow-card">
                  <span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">Text message</span>
                  <textarea rows={6} className={input} value={c.text} onChange={(e) => edit((s) => { s.text = e.target.value; })} />
                  <p className="mt-1.5 text-right text-[11px] text-muted-foreground">{c.text.length} characters · {Math.ceil(c.text.length / 160)} segment{c.text.length > 160 ? "s" : ""}</p>
                </div>
              )}
            </div>

            {/* Column 2 — Preview */}
            <div className="min-w-0">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">What {SEGMENT_LABEL[segment].replace(" guests", "")} guests receive</p>
              {channel === "email" ? (
                <EmailMock email={c.email} image={draft.image} />
              ) : (
                <div className="flex justify-center overflow-hidden"><SmsPreview message={fill(c.text)} sender="Holiday Inn" scale={0.58} /></div>
              )}
            </div>

            {/* Column 3 — Content Intelligence */}
            <aside className="min-w-0 space-y-3">
              <div className="rounded-lg bg-card p-4 shadow-card ai-edge">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand"><Sparkle size={11} />Content intelligence</p>
                <div className="mt-2"><OriginMarker origin={saved.origin} /></div>
                {draft.why ? (
                  <dl className="mt-3 space-y-2.5 text-[12px]">
                    <Row k="Created for" v={SEGMENT_LABEL[segment]} />
                    <Row k="Goal" v={draft.goal} />
                    {channel === "email" ? (
                      <>
                        <Row k="Template" v={draft.template} why={draft.why.template} />
                        <Row k="Subject" v={fill(c.email.subject)} why={draft.why.subject} />
                        <Row k="Image" v={IMAGE_LABEL[draft.image]} why={draft.why.image} />
                      </>
                    ) : (
                      <Row k="CTA" v={segment === "direct" ? "Book direct" : "Switch to direct booking"} why={draft.why.text} />
                    )}
                    <div>
                      <dt className="text-muted-foreground">Context used</dt>
                      <dd className="mt-1 flex flex-wrap gap-1">{draft.why.context.map((x) => <span key={x} className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium capitalize text-brand">{x}</span>)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">This is your team's own content. Open <strong className="text-brand">Edit with AI</strong> to improve it, or use <strong>Create with Directful AI</strong> in the library to refresh every campaign for the season.</p>
                )}
                <p className="mt-3 border-t border-border pt-3 text-[11.5px] text-muted-foreground"><strong className="text-card-foreground">What can I change?</strong> Everything — edit any field yourself, or ask AI. Nothing changes until you apply it.</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 shadow-card">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{allDone ? "Review complete" : "Review checklist"}</p>
                <ul className="mt-2.5 space-y-1.5">
                  {checklist.map(([l, ok]) => (
                    <li key={l} className={`flex items-center gap-2 text-[12px] ${ok ? "text-card-foreground" : "text-muted-foreground"}`}>
                      <span className={`grid size-4 place-items-center rounded-sm ${ok ? "bg-brand text-brand-foreground" : "border border-border"}`}>{ok && <Check size={10} />}</span>{l}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={!allDone || saved.status === "Approved" || saved.status === "Published"}
                  onClick={() => approveCampaign(id)}
                  className="mt-3 w-full rounded-sm bg-brand px-3 py-2 text-[12.5px] font-semibold text-brand-foreground disabled:opacity-40"
                >
                  {saved.status === "Approved" ? "Approved ✓" : saved.status === "Published" ? "Published" : "Approve content"}
                </button>
                {!allDone && <p className="mt-1.5 text-[10.5px] text-muted-foreground">Check both segments and channels, then save to approve.</p>}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {ai && (
        <AiEditPanel
          key={`${segment}-${channel}`}
          title={`${draft.name} · ${SEGMENT_LABEL[segment]} · ${channel === "email" ? "Email" : "Text"}`}
          copy={copy}
          onApply={applyAi}
          onClose={() => setAi(false)}
          onEditMyself={() => setAi(false)}
          className="z-[75]"
        />
      )}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Unsaved changes</AlertDialogTitle><AlertDialogDescription>You have unsaved changes to {draft.name}. Leave without saving?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={onClose}>Leave</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ k, v, why }: { k: string; v: string; why?: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-card-foreground">{v}</dd>
      {why && <dd className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground"><span className="font-medium text-brand">Why? </span>{why}</dd>}
    </div>
  );
}
