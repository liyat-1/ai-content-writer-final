import { createFileRoute } from "@tanstack/react-router";
import { AiContentPage } from "@/components/ai/AiContentPage";

export const Route = createFileRoute("/marketing/ai-content")({
  head: () => ({
    meta: [
      { title: "AI Content — Directful AI" },
      { name: "description", content: "Create, review and improve your hotel marketing with Directful AI." },
      { property: "og:title", content: "AI Content — Directful AI" },
      { property: "og:description", content: "Create, review and improve your hotel marketing with Directful AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiContentPage,
});
