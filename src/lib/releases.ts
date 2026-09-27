import { useSyncExternalStore } from "react";

/** Mock scenario (today = Sep 27 2026) that drives Content, Releases and Results. */
export const TODAY_LABEL = "Sep 27";
export const TOTAL_PROPERTIES = 31;

export type ReleaseStatus = "Live" | "Scheduled" | "Replaced" | "Removed";
export type Release = {
  id: string;
  name: string;
  year: number;
  from: number; // month index
  to: number;
  source: "Default" | "AI generated" | "Manual";
  created: string;
  publishedAt: string;
  status: ReleaseStatus;
  properties: number;
  replaces?: string;
  editedCampaigns?: number;
  campaignCount: number;
  summary: string;
  changes: string[];
  expectedEffect: string;
  comparison: string;
};

export const RELEASES: Release[] = [
  {
    id: "sep-nov-2026", name: "September–November 2026", year: 2026, from: 8, to: 10,
    source: "AI generated", created: "Sep 27", publishedAt: "Sep 27, 2026 · 2:14 PM", status: "Live",
    properties: 29, editedCampaigns: 1, campaignCount: 16, replaces: "Summer 2026",
    summary: "A seasonal return-to-New-York story is now live across autumn guest messages.",
    changes: ["Added Broadway Week and rooftop reopening", "Shortened mobile text to one clear action", "Used warmer local language for OTA guests"],
    expectedEffect: "Likely to lift opens because event-led subjects outperformed generic subjects last September.",
    comparison: "September–November 2025",
  },
  {
    id: "summer-2026", name: "Summer 2026", year: 2026, from: 5, to: 7,
    source: "Manual", created: "May 28", publishedAt: "May 28, 2026 · 10:32 AM", status: "Replaced",
    properties: 31, editedCampaigns: 4, campaignCount: 16,
    summary: "Summer messages highlighted family stays, late checkout, and the rooftop season.",
    changes: ["Moved family benefits into the opening line", "Added rooftop imagery to email", "Introduced late-checkout reminders"],
    expectedEffect: "Likely improved clicks because the offer appeared earlier and used a single destination link.",
    comparison: "Summer 2025",
  },
  {
    id: "winter-spring-2026", name: "January–May 2026", year: 2026, from: 0, to: 4,
    source: "AI generated", created: "Jan 2", publishedAt: "Jan 2, 2026 · 9:05 AM", status: "Replaced",
    properties: 31, campaignCount: 16,
    summary: "The first seasonal publication introduced local planning tips and clearer arrival messages.",
    changes: ["Added indoor winter recommendations", "Clarified arrival-day timing", "Simplified long-stay return messages"],
    expectedEffect: "Likely reduced guest questions because arrival details were moved into the first message.",
    comparison: "January–May 2025",
  },
  {
    id: "holiday-2025", name: "Holiday 2025", year: 2025, from: 10, to: 11,
    source: "Manual", created: "Nov 4", publishedAt: "Nov 4, 2025 · 11:40 AM", status: "Replaced",
    properties: 30, editedCampaigns: 3, campaignCount: 16,
    summary: "Holiday messaging centered gifting, city lights, and festive weekend stays.",
    changes: ["Added holiday market recommendations", "Introduced gift-stay email layout", "Adjusted send timing for weekend arrivals"],
    expectedEffect: "Likely increased return visits because the publication gave guests a timely reason to book again.",
    comparison: "Holiday 2024",
  },
  {
    id: "sep-nov-2025", name: "September–November 2025", year: 2025, from: 8, to: 10,
    source: "AI generated", created: "Aug 29", publishedAt: "Aug 29, 2025 · 3:18 PM", status: "Replaced",
    properties: 28, campaignCount: 16,
    summary: "Last year's autumn publication focused on city weekends and early holiday planning.",
    changes: ["Added weekend itinerary ideas", "Featured direct-booking flexibility", "Used neighborhood recommendations"],
    expectedEffect: "Performance was strongest when a local event was named directly in the subject.",
    comparison: "September–November 2024",
  },
  {
    id: "default", name: "Year-round foundation", year: 2025, from: 0, to: 11,
    source: "Default", created: "Jan 2", publishedAt: "Jan 2, 2025 · 8:30 AM", status: "Live",
    properties: 31, campaignCount: 16,
    summary: "The fallback publication keeps essential booking and stay messages available all year.",
    changes: ["Standardized guest names and property details", "Added consistent direct-booking links", "Established the default campaign timing"],
    expectedEffect: "Provides a stable baseline whenever no seasonal publication is active.",
    comparison: "Year-round 2024",
  },
];

export const ACTIVE_RELEASE_ID = "sep-nov-2026";

let selectedReleaseId = ACTIVE_RELEASE_ID;
const selectionSubs = new Set<() => void>();
export function useSelectedRelease() {
  const selected = useSyncExternalStore((notify) => (selectionSubs.add(notify), () => selectionSubs.delete(notify)), () => selectedReleaseId, () => ACTIVE_RELEASE_ID);
  const select = (id: string) => {
    selectedReleaseId = id;
    selectionSubs.forEach((notify) => notify());
  };
  return [selected, select] as const;
}

export type ReleaseMetric = { label: string; value: string; delta: string };
export type ReleaseMonthResult = { month: number; clicks: number; engagement: number; calls: number };
export type ReleaseCampaignResult = { campaignId: string; clicks: number; engagement: number; lift: number; confidence: Confidence };
export type ReleaseResult = {
  releaseId: string;
  measuredThrough: string;
  sampleNote: string;
  metrics: ReleaseMetric[];
  months: ReleaseMonthResult[];
  campaigns: ReleaseCampaignResult[];
  insights: Insight[];
};

const campaignResults = (scale: number, confidence: Confidence): ReleaseCampaignResult[] => [
  { campaignId: "after-last-visit", clicks: Math.round(734 * scale), engagement: 8.7, lift: 1.4, confidence },
  { campaignId: "lost-3", clicks: Math.round(612 * scale), engagement: 8.1, lift: 0.9, confidence },
  { campaignId: "just-booked", clicks: Math.round(498 * scale), engagement: 7.8, lift: 0.6, confidence },
  { campaignId: "before-arrival", clicks: Math.round(421 * scale), engagement: 7.2, lift: 0.4, confidence },
  { campaignId: "post-checkout", clicks: Math.round(387 * scale), engagement: 6.9, lift: 0.2, confidence },
];

export const RELEASE_RESULTS: Record<string, ReleaseResult> = {
  "sep-nov-2026": {
    releaseId: "sep-nov-2026", measuredThrough: "Sep 27, 2026", sampleNote: "3 days of the live publication · compared with Sep–Nov 2025",
    metrics: [{ label: "Clicks", value: "1,126", delta: "+14% vs the same first 3 days" }, { label: "Engagement rate", value: "7.9%", delta: "+0.8 pts vs Sep–Nov 2025" }, { label: "Calls received", value: "74", delta: "+9% vs the same first 3 days" }],
    months: [{ month: 8, clicks: 1126, engagement: 7.9, calls: 74 }, { month: 9, clicks: 0, engagement: 0, calls: 0 }, { month: 10, clicks: 0, engagement: 0, calls: 0 }],
    campaigns: campaignResults(0.42, "early"),
    insights: [
      { id: "26a", text: "Event-led subjects are opening more often for Direct guests.", evidence: "Broadway Week subjects opened at 24% versus 18% for the comparable 2025 publication.", conf: "early" },
      { id: "26b", text: "Shorter text messages are producing more clicks on mobile.", evidence: "Messages under 140 characters reached 3.4% click-through versus 2.6% in the comparison publication.", conf: "early" },
    ],
  },
  "summer-2026": {
    releaseId: "summer-2026", measuredThrough: "Aug 31, 2026", sampleNote: "Full 3-month publication · compared with Summer 2025",
    metrics: [{ label: "Clicks", value: "12,940", delta: "+11% vs Summer 2025" }, { label: "Engagement rate", value: "7.6%", delta: "+0.7 pts vs Summer 2025" }, { label: "Calls received", value: "842", delta: "+5% vs Summer 2025" }],
    months: [{ month: 5, clicks: 3980, engagement: 7.1, calls: 251 }, { month: 6, clicks: 4512, engagement: 7.7, calls: 286 }, { month: 7, clicks: 4448, engagement: 8.0, calls: 305 }],
    campaigns: campaignResults(1.15, "solid"),
    insights: [{ id: "sum1", text: "Family-focused messages produced the strongest sustained lift.", evidence: "Family benefit messages reached 9.1% engagement, up 1.6 points from Summer 2025.", conf: "solid" }],
  },
  "winter-spring-2026": {
    releaseId: "winter-spring-2026", measuredThrough: "May 31, 2026", sampleNote: "Full 5-month publication · compared with January–May 2025",
    metrics: [{ label: "Clicks", value: "18,604", delta: "+8% vs Jan–May 2025" }, { label: "Engagement rate", value: "7.1%", delta: "+0.4 pts vs Jan–May 2025" }, { label: "Calls received", value: "1,210", delta: "−3% vs Jan–May 2025" }],
    months: [0, 1, 2, 3, 4].map((month, i) => ({ month, clicks: 3280 + i * 217, engagement: 6.7 + i * 0.2, calls: 226 + i * 8 })),
    campaigns: campaignResults(1.4, "solid"),
    insights: [{ id: "ws1", text: "Clearer pre-arrival details coincided with fewer guest calls.", evidence: "Calls fell 3% while before-arrival engagement increased 0.9 points.", conf: "solid" }],
  },
  "holiday-2025": {
    releaseId: "holiday-2025", measuredThrough: "Dec 31, 2025", sampleNote: "Full 2-month publication · compared with Holiday 2024",
    metrics: [{ label: "Clicks", value: "8,902", delta: "+16% vs Holiday 2024" }, { label: "Engagement rate", value: "8.2%", delta: "+1.1 pts vs Holiday 2024" }, { label: "Calls received", value: "516", delta: "+4% vs Holiday 2024" }],
    months: [{ month: 10, clicks: 4210, engagement: 7.8, calls: 244 }, { month: 11, clicks: 4692, engagement: 8.6, calls: 272 }],
    campaigns: campaignResults(0.92, "solid"),
    insights: [{ id: "hol1", text: "Holiday market recommendations gave guests a clear reason to return.", evidence: "Messages naming a market or event reached 9.3% engagement versus 7.0% for generic holiday messages.", conf: "solid" }],
  },
  "sep-nov-2025": {
    releaseId: "sep-nov-2025", measuredThrough: "Nov 30, 2025", sampleNote: "Full 3-month publication · compared with Sep–Nov 2024",
    metrics: [{ label: "Clicks", value: "11,284", delta: "+7% vs Sep–Nov 2024" }, { label: "Engagement rate", value: "7.1%", delta: "+0.5 pts vs Sep–Nov 2024" }, { label: "Calls received", value: "694", delta: "+2% vs Sep–Nov 2024" }],
    months: [{ month: 8, clicks: 3528, engagement: 6.8, calls: 218 }, { month: 9, clicks: 3712, engagement: 7.1, calls: 229 }, { month: 10, clicks: 4044, engagement: 7.4, calls: 247 }],
    campaigns: campaignResults(1, "solid"),
    insights: [{ id: "fall25", text: "Local weekend ideas performed better than generic return messaging.", evidence: "Campaigns naming a neighborhood or event earned 13% more clicks.", conf: "solid" }],
  },
  default: {
    releaseId: "default", measuredThrough: "Dec 31, 2025", sampleNote: "Year-round baseline · compared with the 2024 foundation",
    metrics: [{ label: "Clicks", value: "41,720", delta: "+5% vs 2024" }, { label: "Engagement rate", value: "6.5%", delta: "+0.3 pts vs 2024" }, { label: "Calls received", value: "3,148", delta: "−2% vs 2024" }],
    months: Array.from({ length: 12 }, (_, month) => ({ month, clicks: 3200 + month * 51, engagement: 6.1 + (month % 4) * 0.2, calls: 248 + (month % 3) * 9 })),
    campaigns: campaignResults(2.9, "solid"),
    insights: [{ id: "base1", text: "The year-round foundation remained a steady fallback across all properties.", evidence: "Engagement varied by less than 0.6 points across the year.", conf: "solid" }],
  },
};

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
  const foundation = layers.find((r) => r.id === "default");
  const seasonal = layers.find((r) => r.year === 2026 && r.id !== "default" && r.status === "Live");
  if (reverted || !seasonal) return foundation ?? layers[0];
  return seasonal;
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
