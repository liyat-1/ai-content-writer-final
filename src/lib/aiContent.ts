/** Sample data for Directful AI Content. Everything is scoped to the current hotel only. */

export type ContentState = "Draft" | "In review" | "Approved" | "Scheduled" | "Published" | "Archived";

export type AiCampaign = {
  id: string;
  name: string;
  timing: string;
  purpose: string;
  lastUpdated: string;
  email: { subject: string; preheader: string; heading: string; body: string; cta: string };
  text: { message: string; cta: string };
  template: string;
  templateReason: string;
  image: string;
  imageReason: string;
  rationale: string;
  clickRate: number;
  change: number;
};

export const HOTEL = {
  name: "Holiday Inn Times Square",
  location: "New York City",
  voice: "Warm, confident, city-savvy",
};

const mk = (
  id: string,
  name: string,
  timing: string,
  purpose: string,
  clickRate: number,
  change: number,
  angle: string,
): AiCampaign => ({
  id,
  name,
  timing,
  purpose,
  lastUpdated: "Jun 12, 2026",
  clickRate,
  change,
  template: change < 0 ? "Seasonal Feature" : "Classic Welcome",
  templateReason: "Your seasonal emails with one strong image have had higher click rates than multi-image layouts.",
  image: angle.includes("Broadway") ? "Rooftop bar at dusk" : "Fall room with city view",
  imageReason: "Seasonal, bright and used successfully in your Fall 2025 release.",
  rationale: `Uses a ${angle} angle and a clear booking CTA, which performed well in your previous fall content.`,
  email: {
    subject: `{first_name}, ${angle} is calling you back`,
    preheader: "Your room above Times Square is ready when you are.",
    heading: `Fall in New York, the way you remember it`,
    body: `It's been ${timing.toLowerCase()} since your stay, and the city has turned golden. Crisp evenings, ${angle}, and our rooftop is open late. Come back and enjoy the season from the heart of Midtown.`,
    cta: "Book your fall stay",
  },
  text: {
    message: `Hi {first_name}! Fall is here in NYC 🍂 ${angle} and cozy nights await at Holiday Inn Times Square. Book direct for our best rate:`,
    cta: "{booking_link}",
  },
});

export const AI_CAMPAIGNS: AiCampaign[] = [
  mk("alv", "After Last Visit", "Just after checkout", "Reconnect with guests after their stay.", 7.8, 6, "Broadway season"),
  mk("m3", "3 Months", "3 months", "Reconnect with guests three months after their stay.", 8.2, 21, "fall foliage in Central Park"),
  mk("m6", "6 Months", "6 months", "Invite guests back for the upcoming season.", 6.1, 4, "holiday windows on Fifth Avenue"),
  mk("m9", "9 Months", "9 months", "Remind guests of what they loved.", 5.4, -3, "Broadway season"),
  mk("m12", "12 Months", "12 months", "Celebrate the anniversary of their visit.", 4.9, 2, "one year of city memories"),
  mk("m15", "15 Months", "15 months", "Win back guests who haven't returned.", 3.4, -8, "a fresh fall weekend"),
  mk("m15p", "15 Months+", "15+ months", "Re-engage long-lapsed guests.", 2.7, -12, "the city you haven't seen in a while"),
];

export const CONTEXT_ITEMS = [
  "Hotel profile",
  "Brand voice",
  "Current campaigns",
  "Previous campaign content",
  "Campaign performance",
  "Previous seasonal content",
  "Media Library",
  "Upcoming hotel events",
  "Seasonal calendar",
];

export const QUICK_PROMPTS = [
  "Refresh all 7 campaigns",
  "Plan the next 3 months",
  "Create seasonal content",
  "Review my current content",
  "Improve engagement",
  "Show me what worked previously",
];

export const EVENTS = [
  { name: "New York Comic Con", date: "Oct 8–11", note: "Javits Center · high city demand" },
  { name: "NYC Marathon", date: "Nov 1", note: "Weekend stays spike" },
  { name: "Thanksgiving Parade", date: "Nov 26", note: "Hotel is 4 blocks from route" },
];

export const APPROACHES = [
  { key: "A", name: "Seasonal", tone: "Warm, experience-led", desc: "Fall colours, Broadway season and cozy city evenings." },
  { key: "B", name: "Event-led", tone: "Timely, energetic", desc: "Built around Comic Con, the Marathon and the Parade." },
  { key: "C", name: "Offer-led", tone: "Direct, value-focused", desc: "Leads with your Book Direct 10% offer." },
];

export const EDIT_ACTIONS = [
  "Make it shorter",
  "Make it warmer",
  "More premium",
  "Add a seasonal angle",
  "Add an offer",
  "Change the CTA",
  "Create a matching text",
  "Create a matching email",
];

/** Simple, deterministic sample rewrite for "Edit with AI". */
export function applyEdit(text: string, action: string): string {
  switch (action) {
    case "Make it shorter":
      return text.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".");
    case "Make it warmer":
      return `We've missed you! ${text}`;
    case "More premium":
      return text.replace("Come back", "Return in style").replace("enjoy", "savour");
    case "Add a seasonal angle":
      return `${text} Golden leaves and crisp evenings make this the perfect time to visit.`;
    case "Add an offer":
      return `${text} Book direct and save 10% on your stay.`;
    default:
      return text;
  }
}

export const RELEASES = [
  { name: "Automated Invites — Fall 2026", published: "Sep 15, 2026", campaigns: 7, clickRate: 6.8, bookings: 42, state: "Published" as ContentState },
  { name: "Automated Invites — Summer 2026", published: "Jun 12, 2026", campaigns: 7, clickRate: 6.1, bookings: 35, state: "Archived" as ContentState },
  { name: "Automated Invites — Spring 2026", published: "Mar 3, 2026", campaigns: 5, clickRate: 5.7, bookings: 28, state: "Archived" as ContentState },
];

export const TREND = [
  { date: "Jun", rate: 5.6, version: "Summer v1" },
  { date: "Jul", rate: 6.0, version: "Summer v1" },
  { date: "Aug", rate: 5.8, version: "Summer v2" },
  { date: "Sep", rate: 6.5, version: "Fall v1" },
  { date: "Oct", rate: 6.9, version: "Fall v1" },
  { date: "Nov", rate: 6.8, version: "Fall v1" },
];

export const SEASON_HISTORY = [
  { season: "Fall 2026", rate: 8.2 },
  { season: "Fall 2025", rate: 6.8 },
  { season: "Fall 2024", rate: 5.4 },
];

export type AbTest = {
  id: string;
  campaign: string;
  name: string;
  element: string;
  metric: string;
  a: { label: string; rate: number; sends: number };
  b: { label: string; rate: number; sends: number };
  status: "Collecting data" | "Early signal" | "Clear leader" | "Test complete" | "No clear difference";
};

export const AB_TESTS: AbTest[] = [
  {
    id: "t1",
    campaign: "3 Months",
    name: "Subject line test",
    element: "Email subject",
    metric: "Click rate",
    a: { label: "Current: Fall in New York is calling", rate: 6.9, sends: 1240 },
    b: { label: "AI: Your room above Times Square awaits", rate: 8.4, sends: 1228 },
    status: "Clear leader",
  },
  {
    id: "t2",
    campaign: "15 Months+",
    name: "Offer test",
    element: "Text message",
    metric: "Click rate",
    a: { label: "No offer", rate: 2.6, sends: 410 },
    b: { label: "Book direct and save 10%", rate: 2.9, sends: 402 },
    status: "Collecting data",
  },
  {
    id: "t3",
    campaign: "After Last Visit",
    name: "Hero image test",
    element: "Hero image",
    metric: "Click-to-book",
    a: { label: "Lobby arrival", rate: 3.1, sends: 980 },
    b: { label: "Rooftop at dusk", rate: 3.2, sends: 975 },
    status: "No clear difference",
  },
];

export const VERSIONS = [
  { v: "v4", label: "AI: Made warmer", by: "Directful AI", when: "Today, 9:14 AM", state: "Draft" as ContentState },
  { v: "v3", label: "Edited subject line", by: "Maria Chen", when: "Sep 14, 2026", state: "Published" as ContentState },
  { v: "v2", label: "AI: Fall seasonal refresh", by: "Directful AI", when: "Sep 10, 2026", state: "Archived" as ContentState },
  { v: "v1", label: "Original summer content", by: "Maria Chen", when: "Jun 12, 2026", state: "Archived" as ContentState },
];

export const LEARNINGS = [
  "Seasonal subject lines lift your click rate by about 18% on average.",
  "Single-image email templates outperform galleries for your guests.",
  "Your team usually shortens AI body copy — Directful AI now writes shorter by default.",
  "Offers help most in 15 Months+ campaigns; earlier campaigns do well without them.",
];

export const SCHEDULE = [
  { month: "Oct 2026", items: ["Fall release live (7 campaigns)", "Comic Con angle — After Last Visit", "A/B: 3 Months subject line"] },
  { month: "Nov 2026", items: ["Marathon + Parade event content", "Review 15 Months+ performance"] },
  { month: "Dec 2026", items: ["Holiday release draft — ready for review Nov 20"] },
];
