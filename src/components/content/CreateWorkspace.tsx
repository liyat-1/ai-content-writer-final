import { useState } from "react";
import { Check, Mail, MessageSquare } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Sparkle } from "@/components/ai/Sparkle";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignCard as MkCard } from "@/components/marketing/CampaignCard";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
import { TestCampaignDialog } from "@/components/marketing/MarketingDialogs";
import { defaultVariant, mutate, useMarketing } from "@/lib/marketing";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";
import { AiMark, OriginMarker, StatusBadge, fill } from "./shared";
import { Button } from "@/components/ui/button";
import { publishApproved, useLibrary, type Channel, type LibraryCampaign, type Segment } from "@/lib/contentLibrary";

export function CreateWorkspace() {
  const { campaigns } = useLibrary();
  const [studio, setStudio] = useState(false);
  const [open, setOpen] = useState<{ id: string; ai: boolean } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<number | null>(null);
  const [freshAi, setFreshAi] = useState(false);
  const mk = useMarketing();
  const invites = mk.campaigns.filter((c) => c.group === "invites");
  const [editing, setEditing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const approved = campaigns.filter((c) => c.status === "Approved");
  const needsReview = campaigns.filter((c) => c.status === "Needs review").length;

  return (
    <MarketingShell title="Content Library">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="relative overflow-hidden border-b border-border pb-5 pt-1 sm:pb-6">
          <div className="pointer-events-none absolute inset-0 ai-surface opacity-80" />
          <div className="pointer-events-none absolute inset-0 ai-grid opacity-50 [mask-image:linear-gradient(90deg,transparent,black)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Current guest communications</p>
              <h2 className="font-display mt-1 text-[30px] font-semibold text-card-foreground">Your campaigns</h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">Review what guests receive, edit it yourself, or ask Directful AI to rewrite it in place.</p>
            </div>
            <Button onClick={() => setStudio(true)} variant="brand" className="ai-pulse h-10">
                <Sparkle size={15} className="ai-twinkle" />Create with Directful AI
            </Button>
          </div>
        </div>

        {freshAi && (
          <div className="ai-rise mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-card ai-edge">
            <AiMark size={28} />
            <p className="min-w-0 flex-1 text-[13px] text-card-foreground"><strong>Your new content is in place.</strong> {needsReview} campaigns are ready for review — open one to compare, edit or refine it with AI.</p>
          </div>
        )}

        {/* Library — same cards and editor as Automated Invites */}
        <div className="mt-5 grid gap-4 pb-16 md:grid-cols-2 xl:grid-cols-3">
          {invites.map((campaign) => (
            <MkCard
              key={campaign.id}
              campaign={campaign}
              onToggle={(value) => mutate((d) => { const it = d.campaigns.find((x) => x.id === campaign.id); if (it) it.enabled = value; })}
              onEdit={() => setEditing(campaign.id)}
              onTest={() => setTesting(campaign.id)}
              onRevert={() => mutate((d) => { const it = d.campaigns.find((x) => x.id === campaign.id); if (it) { it.variants.direct = defaultVariant(it.id, "direct"); it.variants.ota = defaultVariant(it.id, "ota"); } })}
            />
          ))}
        </div>
      </div>

      {/* Publish bar */}
      {approved.length > 0 && (
        <div className="ai-rise sticky bottom-0 z-20 border-t border-border bg-card/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <Check size={16} className="text-brand" />
            <p className="flex-1 text-[13px] text-card-foreground"><strong>{approved.length}</strong> approved campaign{approved.length > 1 ? "s" : ""} ready to publish</p>
            <button onClick={() => setPublishing(true)} className="rounded-sm bg-brand px-4 py-2 text-[12.5px] font-semibold text-brand-foreground">Publish content</button>
          </div>
        </div>
      )}
      {published !== null && (
        <div className="ai-rise fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-4 py-2.5 text-[13px] text-background shadow-float">
          Published {published} campaign{published > 1 ? "s" : ""}. You'll find the record under Content Library → Published.
        </div>
      )}

      <AlertDialog open={publishing} onOpenChange={setPublishing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You're publishing</AlertDialogTitle>
            <AlertDialogDescription>
              {approved.length} campaigns · {approved.reduce((n, c) => n + c.channels.length * 2, 0)} content pieces · Email + Text · Direct + OTA. This becomes the current content guests receive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-[12.5px]">{approved.map((c) => <li key={c.id} className="flex items-center gap-2"><Check size={12} className="text-brand" />{c.name}</li>)}</ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { const n = publishApproved(); setPublished(n); window.setTimeout(() => setPublished(null), 4000); }}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {studio && <AiCreateStudio onClose={() => setStudio(false)} onReview={() => { setStudio(false); setFreshAi(true); }} />}
      {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
      <TestCampaignDialog campaign={mk.campaigns.find((c) => c.id === testing) ?? null} open={Boolean(testing)} onClose={() => setTesting(null)} />
      {open && <ReviewWorkspace id={open.id} openAi={open.ai} onClose={() => setOpen(null)} />}
    </MarketingShell>
  );
}

