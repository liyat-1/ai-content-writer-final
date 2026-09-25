/**
 * Content Library — sample data + a tiny in-memory store.
 * Everything is scoped to Holiday Inn Times Square. No real AI model: the
 * "generation" below is a deterministic writer that uses the chosen
 * timeframe, ideas and direction.
 */
import { useSyncExternalStore } from "react";

export type Segment = "direct" | "ota";
export type Channel = "email" | "text";
export type Origin = "manual" | "ai" | "ai-edited";
export type Status = "Current" | "Needs review" | "Approved" | "Published";

export type EmailBody = { subject: string; preheader: string; heading: string; body: string; cta: string };
export type SegmentContent = { email: EmailBody; text: string; reviewed: { email: boolean; text: boolean } };

export type LibraryCampaign = {
  id: string;
  name: string;
  kind: "Automated Invite" | "Automated Transactional" | "Property Transactional";
  goal: string;
  channels: Channel[];
  content: Record<Segment, SegmentContent>;
  origin: Origin;
  status: Status;
  updated: string;
  version: number;
  image: string;
  template: string;
  why?: { template: string; subject: string; image: string; text: string; context: string[] };
};

export type Version = { campaignId: string; v: number; label: string; by: string; when: string };
export type Publication = { id: string; name: string; when: string; campaigns: string[]; pieces: number; channels: string; segments: string; version: string };

export const SEGMENT_LABEL: Record<Segment, string> = { direct: "Direct guests", ota: "OTA guests" };
export const HOTEL_NAME = "Holiday Inn Times Square";

const seg = (email: EmailBody, text: string): SegmentContent => ({ email, text, reviewed: { email: false, text: false } });

const invite = (id: string, name: string, goal: string, since: string, image: string): LibraryCampaign => ({
  id,
  name,
  kind: "Automated Invite",
  goal,
  channels: ["email", "text"],
  origin: "manual",
  status: "Current",
  updated: "Sep 12",
  version: 1,
  image,
  template: "Classic Welcome",
  content: {
    direct: seg(
      {
        subject: `{first_name}, we'd love to see you again`,
        preheader: "Your room above Times Square is ready when you are.",
        heading: "Ready for another New York getaway?",
        body: `It's been ${since} since your stay. We hope you enjoyed your time with us — Broadway, the lights and the energy of Midtown are waiting whenever you're ready to come back.`,
        cta: "Book your next stay",
      },
      `Hi {first_name}, it's been ${since} since your stay at Holiday Inn Times Square. Ready for another NYC getaway? Book direct for our best rate: {booking_link}`,
    ),
    ota: seg(
      {
        subject: `Thanks for staying with us, {first_name}`,
        preheader: "Next time, book with us directly and get more.",
        heading: "We hope you enjoyed Times Square",
        body: `Thank you for choosing us ${since} ago. Next time, book directly with the hotel for our best available rate, flexible changes and a warmer welcome at check-in.`,
        cta: "See direct rates",
      },
      `Hi {first_name}, thanks for staying at Holiday Inn Times Square! Next time book with us directly for our best rate and flexible changes: {booking_link}`,
    ),
  },
});

const transactional = (
  id: string,
  name: string,
  kind: LibraryCampaign["kind"],
  goal: string,
  channels: Channel[],
  heading: string,
  body: string,
  text: string,
  image: string,
): LibraryCampaign => {
  const email: EmailBody = { subject: heading, preheader: goal, heading, body, cta: "View reservation" };
  return {
    id, name, kind, goal, channels, origin: "manual", status: "Current", updated: "Aug 30", version: 1, image, template: "Clean Notice",
    content: { direct: seg(email, text), ota: seg({ ...email, body: body + " Booking through a travel site? We still have you covered." }, text) },
  };
};

const SEED: LibraryCampaign[] = [
  invite("alv", "After Last Visit", "Reconnect right after checkout", "a few days", "lobby"),
  invite("m3", "3 Months", "Invite guests back three months on", "three months", "rooftop"),
  invite("m6", "6 Months", "Inspire a seasonal return", "six months", "room"),
  invite("m9", "9 Months", "Remind guests what they loved", "nine months", "suite"),
  invite("m12", "12 Months", "Celebrate the anniversary of their visit", "a year", "rooftop"),
  invite("m15", "15 Months", "Win back guests who haven't returned", "over a year", "courtyard"),
  invite("m15p", "15 Months+", "Re-engage long-lapsed guests", "a long while", "lobby"),
  transactional("conf", "Booking Confirmation", "Automated Transactional", "Everything for your upcoming stay", ["email", "text"], "Your stay is confirmed", "We're looking forward to welcoming you to Holiday Inn Times Square. Your reservation details are below.", "Your stay at Holiday Inn Times Square is confirmed for {arrival_date}. Details: {reservation_link}", "lobby"),
  transactional("pre", "Pre-Arrival", "Automated Transactional", "Help guests prepare for arrival", ["email", "text"], "Your NYC stay is almost here", "Check in from 3 PM. Tell us your arrival time and any requests, and we'll have everything ready.", "Hi {first_name}! Your stay starts {arrival_date}. Reply with your arrival time or requests.", "room"),
  transactional("welcome", "Welcome Message", "Property Transactional", "Greet guests on check-in day", ["text"], "Welcome to Holiday Inn Times Square", "Welcome! Wi-Fi is HolidayInn_Guest. The rooftop opens at 5 PM.", "Welcome to Holiday Inn Times Square, {first_name}! Wi-Fi: HolidayInn_Guest. Rooftop opens at 5 PM.", "rooftop"),
  transactional("mid", "Mid-Stay Check-in", "Property Transactional", "Make sure the stay is going well", ["text"], "How is your stay?", "Anything we can do to make your stay better?", "Hi {first_name}, how's your stay going? Reply here if there's anything we can do.", "courtyard"),
  transactional("post", "Post-Stay Thank You", "Automated Transactional", "Thank guests and ask for a review", ["email", "text"], "Thank you for staying with us", "It was a pleasure hosting you. We'd love to hear how your stay was.", "Thanks for staying with us, {first_name}! Tell us how it went: {review_link}", "lobby"),
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

type State = { campaigns: LibraryCampaign[]; versions: Version[]; publications: Publication[] };
let state: State = {
  campaigns: clone(SEED),
  versions: SEED.map((c) => ({ campaignId: c.id, v: 1, label: "Original content", by: "Maria Chen", when: "Jun 12" })),
  publications: [
    { id: "p1", name: "Summer 2026 content", when: "Jun 12, 2026", campaigns: SEED.map((c) => c.id), pieces: 20, channels: "Email + Text", segments: "Direct + OTA", version: "v1" },
  ],
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (fn: (s: State) => State) => { state = fn(state); emit(); };

export function useLibrary() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);
}

const today = () => "Today";

export function saveCampaign(next: LibraryCampaign, label: string) {
  set((s) => {
    const prev = s.campaigns.find((c) => c.id === next.id);
    const origin: Origin = prev?.origin === "manual" ? "manual" : "ai-edited";
    const v = (prev?.version ?? 0) + 1;
    const updated: LibraryCampaign = { ...clone(next), origin: next.origin === "ai" && label === "AI refinement" ? "ai-edited" : origin, version: v, updated: today(), status: next.status === "Approved" ? "Approved" : "Needs review" };
    return {
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === next.id ? updated : c)),
      versions: [{ campaignId: next.id, v, label, by: "Sevket Yilmaz", when: "Today" }, ...s.versions],
    };
  });
}

export function approveCampaign(id: string) {
  set((s) => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status: "Approved" } : c)) }));
}

export function publishApproved() {
  const approved = state.campaigns.filter((c) => c.status === "Approved");
  if (!approved.length) return 0;
  set((s) => ({
    ...s,
    campaigns: s.campaigns.map((c) => (c.status === "Approved" ? { ...c, status: "Published" } : c)),
    publications: [
      {
        id: `p${s.publications.length + 1}`,
        name: `Fall 2026 content · release ${s.publications.length}`,
        when: "Today",
        campaigns: approved.map((c) => c.id),
        pieces: approved.reduce((n, c) => n + c.channels.length * 2, 0),
        channels: "Email + Text",
        segments: "Direct + OTA",
        version: approved.map((c) => `v${c.version}`).join(", "),
      },
      ...s.publications,
    ],
  }));
  return approved.length;
}

/* ---------------------------- AI creation ---------------------------- */

export type Idea = { id: string; group: "Seasonal moments" | "Holidays" | "Hotel events" | "Local events"; emoji: string; name: string; date?: string; month: number; fit: string };

const IDEAS: Idea[] = [
  { id: "summer-end", group: "Seasonal moments", emoji: "☀️", name: "End of summer", month: 8, fit: "Late-summer weekends" },
  { id: "autumn", group: "Seasonal moments", emoji: "🍂", name: "Autumn in New York", month: 9, fit: "Works across every return invite" },
  { id: "winter", group: "Seasonal moments", emoji: "❄️", name: "Winter in the city", month: 11, fit: "Cozy, festive tone" },
  { id: "halloween", group: "Holidays", emoji: "🎃", name: "Halloween", date: "Oct 31", month: 9, fit: "Light touch in 3 & 6 Months" },
  { id: "thanksgiving", group: "Holidays", emoji: "🦃", name: "Thanksgiving Parade", date: "Nov 26", month: 10, fit: "We're 4 blocks from the route" },
  { id: "holidays", group: "Holidays", emoji: "🎄", name: "Holiday windows & Rockefeller tree", date: "Dec", month: 11, fit: "Strong for 6 & 9 Months" },
  { id: "conference", group: "Hotel events", emoji: "🏨", name: "Annual Conference", date: "Oct 18", month: 9, fit: "Only After Last Visit & 3 Months" },
  { id: "rooftop", group: "Hotel events", emoji: "🍸", name: "Rooftop fall season opening", date: "Sep 20", month: 8, fit: "Great visual for emails" },
  { id: "marathon", group: "Local events", emoji: "🏃", name: "NYC Marathon", date: "Nov 1", month: 10, fit: "Weekend demand spike" },
  { id: "festival", group: "Local events", emoji: "📍", name: "Midtown Fall Festival", date: "Oct 25", month: 9, fit: "Nice for lapsed guests" },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ideasFor(start: number, end: number) {
  return IDEAS.filter((i) => i.month >= start && i.month <= end);
}

export const CONTEXT_SOURCES = [
  "Hotel brand", "Brand voice", "Existing campaign content", "Guest segments", "Email templates", "Existing offers",
  "Hotel amenities", "Media Library", "Hotel events", "Seasonal moments", "Your timeframe", "Your instructions",
];

export type Direction = { tone: string[]; avoid: string[]; notes: string[] };

/** Read plain-language instructions into lightweight rules the writer follows. */
export function readDirection(input: string, prev: Direction): Direction {
  const r = input.toLowerCase();
  const d: Direction = { tone: [...prev.tone], avoid: [...prev.avoid], notes: [...prev.notes, input.trim()].filter(Boolean) };
  const add = (arr: string[], v: string) => !arr.includes(v) && arr.push(v);
  if (/premium|luxur|elegant/.test(r)) add(d.tone, "premium");
  if (/warm|personal|invit/.test(r)) add(d.tone, "warm");
  if (/subtle/.test(r)) add(d.tone, "subtle");
  if (/direct book/.test(r)) add(d.tone, "direct-booking");
  const m = r.match(/(?:don'?t|do not|no|avoid|skip)\s+(?:mention\s+|focus\s+(?:too\s+much\s+)?on\s+)?([a-z]+)/);
  if (m) add(d.avoid, m[1]);
  return d;
}

const IMAGE_FOR: Record<string, string> = { autumn: "room", holidays: "suite", rooftop: "rooftop", conference: "lobby", winter: "suite" };

export function generateAll(ideas: Idea[], direction: Direction, range: string) {
  const usable = ideas.filter((i) => !direction.avoid.some((a) => i.name.toLowerCase().includes(a)));
  const season = usable.find((i) => i.group === "Seasonal moments");
  const premium = direction.tone.includes("premium");
  const warmOpen = premium ? "It would be our pleasure to welcome you back" : "We'd love to welcome you back";
  const seasonLine = season ? (direction.tone.includes("subtle") ? `as the city settles into ${season.name.replace(" in New York", "").toLowerCase()}` : `this ${season.name.replace(" in New York", "").toLowerCase()}`) : "soon";

  set((s) => ({
    ...s,
    campaigns: s.campaigns.map((c, idx) => {
      if (c.kind !== "Automated Invite") {
        const touch = season ? ` Enjoy New York ${seasonLine}.` : "";
        const upd = (x: SegmentContent): SegmentContent => ({ reviewed: { email: false, text: false }, email: { ...x.email, body: x.email.body.replace(/ Enjoy New York.*$/, "") + touch }, text: x.text });
        return { ...c, origin: "ai" as Origin, status: "Needs review" as Status, updated: "Today", version: c.version + 1, content: { direct: upd(c.content.direct), ota: upd(c.content.ota) }, why: { template: "Kept your clean notice layout — guests need the facts first.", subject: "Left clear and factual; transactional messages shouldn't sell.", image: "Kept your current image.", text: "Unchanged except for tone — this message is operational.", context: [range, "light seasonal touch"] } };
      }
      // Relevant personalization, not personalization everywhere.
      const event = usable.filter((i) => i.group !== "Seasonal moments")[idx % Math.max(1, usable.length - 1)];
      const useEvent = event && (event.id !== "conference" || ["alv", "m3"].includes(c.id)) && c.id !== "m12";
      const eventLine = useEvent && event ? ` ${event.name}${event.date ? ` (${event.date})` : ""} is a lovely reason to plan the trip.` : "";
      const hero = IMAGE_FOR[season?.id ?? ""] ?? c.image;
      const mkSeg = (sg: Segment): SegmentContent => {
        const directTail = sg === "direct" ? "Book direct for our best rate and a warm welcome at check-in." : "Book with us directly next time — best rate, flexible changes and perks you won't find on travel sites.";
        return {
          reviewed: { email: false, text: false },
          email: {
            subject: season ? `Come back ${seasonLine}, {first_name}` : `{first_name}, your room is waiting`,
            preheader: premium ? "A quieter, more refined side of Times Square." : "Midtown is at its best right now.",
            heading: `${warmOpen} ${seasonLine}`,
            body: `${c.goal}. Crisp evenings, the rooftop lit up over the city and a room right in the heart of Times Square.${eventLine} ${directTail}`,
            cta: sg === "direct" ? "Plan my return" : "See direct rates",
          },
          text: `Hi {first_name}! ${warmOpen.replace("It would be our pleasure to welcome you back", "We'd be delighted to host you again")} ${seasonLine} at Holiday Inn Times Square.${useEvent && event ? ` ${event.emoji} ${event.name}${event.date ? " " + event.date : ""}.` : ""} ${sg === "direct" ? "Best rate direct:" : "Book direct next time:"} {booking_link}`,
        };
      };
      return {
        ...c,
        origin: "ai" as Origin,
        status: "Needs review" as Status,
        updated: "Today",
        version: c.version + 1,
        image: hero,
        template: "Warm Image + CTA",
        content: { direct: mkSeg("direct"), ota: mkSeg("ota") },
        why: {
          template: "Gives the seasonal message a strong visual focus while keeping the button prominent.",
          subject: "Kept it short and seasonal, and spoke to guests who already know the hotel.",
          image: "Reinforces the season without changing the hotel's visual identity.",
          text: "Kept the text concise — one invitation, one link — so it reads in a glance.",
          context: [range, season?.name, useEvent ? event?.name : undefined, direction.tone.length ? direction.tone.join(" + ") : "warm"].filter(Boolean) as string[],
        },
      };
    }),
    versions: [
      ...s.campaigns.map((c) => ({ campaignId: c.id, v: c.version + 1, label: "Created with Directful AI", by: "Directful AI", when: "Today" })),
      ...s.versions,
    ],
  }));
}

export const IMAGE_LABEL: Record<string, string> = { lobby: "Lobby arrival", rooftop: "Rooftop at dusk", room: "Fall room with city view", suite: "Suite detail", courtyard: "Courtyard" };
