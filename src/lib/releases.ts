import { useSyncExternalStore } from "react";

/** Mock scenario (today = Sep 27 2026) that drives Content, Releases and Results. */
export const TODAY_LABEL = "Sep 27";
export const TOTAL_PROPERTIES = 31;

export type ReleaseStatus = "Live" | "Scheduled" | "Replaced" | "Removed";
export type Release = {
  id: string;
  name: string;
  from: number; // month index
  to: number;
  source: "Default" | "AI generated" | "Manual";
  created: string;
  status: ReleaseStatus;
  properties: number;
  replaces?: string;
  editedCampaigns?: number;
};

export const RELEASES: Release[] = [
  { id: "default", name: "Year-round release", from: 0, to: 11, source: "Default", created: "Jan 2", status: "Live", properties: 31 },
  { id: "sep-nov", name: "Sept–Nov release", from: 8, to: 10, source: "AI generated", created: "Sep 27", status: "Live", properties: 29, editedCampaigns: 1 },
];

export type SlotVersion = { v: number; by: string; when: string; kind: "Default" | "AI generated" | "Manual edit" | "Revert"; properties: number; note: string };

/** Version list for the demo slot After Last Visit · September. */
export const SLOT_VERSIONS: Record<string, SlotVersion[]> = {
  "after-last-visit": [
    { v: 3, by: "Maria Chen", when: "Sep 28", kind: "Manual edit", properties: 7, note: "Shortened the text and added the rooftop reopening." },
    { v: 2, by: "Directful AI", when: "Sep 27", kind: "AI generated", properties: 22, note: "Autumn in New York angle with Broadway week." },
    { v: 1, by: "Directful AI", when: "Jan 2", kind: "Default", properties: 2, note: "Year-round default content." },
  ],
};
export function versionsFor(campaignId: string, month: number): SlotVersion[] {
  if (SLOT_VERSIONS[campaignId] && month === 8) return SLOT_VERSIONS[campaignId];
  const inAi = month >= 8 && month <= 10;
  return inAi
    ? [{ v: 2, by: "Directful AI", when: "Sep 27", kind: "AI generated", properties: 29, note: "Seasonal release content." }, { v: 1, by: "Directful AI", when: "Jan 2", kind: "Default", properties: 2, note: "Year-round default content." }]
    : [{ v: 1, by: "Directful AI", when: "Jan 2", kind: "Default", properties: 31, note: "Year-round default content." }];
}

export const PINNED_PROPERTIES = [
  { name: "Holiday Inn Newark Airport", on: "September v1", why: "Kept an older version" },
  { name: "Holiday Inn Brooklyn", on: "September v1", why: "Kept an older version" },
];

export type Confidence = "early" | "emerging" | "solid";
export const CONFIDENCE: Record<Confidence, { label: string; cls: string }> = {
  early: { label: "Early signal · 3 days", cls: "bg-muted text-muted-foreground" },
  emerging: { label: "Emerging trend · 2 weeks", cls: "bg-warning-soft text-warning" },
  solid: { label: "Solid · full month vs last year", cls: "bg-foreground text-background" },
};

export type Risk = "minor" | "angle" | "significant";
export const RISK: Record<Risk, { label: string; dot: string; order: number }> = {
  significant: { label: "Significant change", dot: "bg-destructive", order: 0 },
  angle: { label: "New angle", dot: "bg-warning", order: 1 },
  minor: { label: "Minor tone change", dot: "bg-brand", order: 2 },
};
const RISK_BY_CAMPAIGN: Record<string, Risk> = { "after-last-visit": "significant", "lost-3": "angle", "lost-6": "minor", "lost-9": "angle", "lost-12": "significant", "lost-15": "minor", "just-booked": "minor", "before-arrival": "angle", "during-stay": "minor", "post-checkout": "angle" };
export const riskFor = (id: string): Risk => RISK_BY_CAMPAIGN[id] ?? "minor";

/** Per-month personalize banner state (remembered per month). */
type UiState = { dismissed: Record<number, boolean>; reviewed: Record<string, boolean>; reverted: Record<number, boolean> };
let ui: UiState = { dismissed: { 9: true }, reviewed: {}, reverted: {} };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export function useReleaseUi() {
  return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => ui, () => ui);
}
export const setDismissed = (m: number, v: boolean) => { ui = { ...ui, dismissed: { ...ui.dismissed, [m]: v } }; emit(); };
export const markReviewed = (id: string) => { ui = { ...ui, reviewed: { ...ui.reviewed, [id]: true } }; emit(); };
export const resetReviewed = () => { ui = { ...ui, reviewed: {} }; emit(); };
export const revertMonth = (m: number) => { ui = { ...ui, reverted: { ...ui.reverted, [m]: true } }; emit(); };

/** Which release is on top for a month (layering rule). */
export function topRelease(month: number, reverted = false): Release {
  const layers = RELEASES.filter((r) => r.status !== "Removed" && month >= r.from && month <= r.to);
  if (reverted && layers.length > 1) return layers[layers.length - 2];
  return layers[layers.length - 1];
}

export const RESULT_KPIS = [
  { label: "Clicks", value: "4,812", delta: "+12% vs last Sept", conf: "solid" as Confidence },
  { label: "Engagement rate", value: "7.4%", delta: "+0.9 pts", conf: "solid" as Confidence },
  { label: "Calls received", value: "318", delta: "+6% vs last Sept", conf: "solid" as Confidence },
];

export type Insight = { id: string; text: string; evidence: string; conf: Confidence };
export const INSIGHTS: Insight[] = [
  { id: "i1", text: "Subjects that name a local event likely lift opens — guests respond to a clear reason to return now.", evidence: "Subjects with the event name: 24% open vs 18%.", conf: "solid" },
  { id: "i2", text: "The Sept–Nov release is possibly lifting clicks for OTA guests.", evidence: "OTA clicks 3.1% vs 2.7% on v1 (3 days).", conf: "early" },
  { id: "i3", text: "Shorter texts with one link likely perform better on mobile.", evidence: "Texts under 140 characters: 3.4% click vs 2.6%.", conf: "emerging" },
];
