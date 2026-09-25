import { createFileRoute } from "@tanstack/react-router";
import { AbTestsPage } from "@/components/content/LibraryPages";

export const Route = createFileRoute("/content/ab-tests")({
  head: () => ({
    meta: [
      { title: "A/B Tests — Directful Content Library" },
      { name: "description", content: "Content tests and results for your guest messaging campaigns." },
      { property: "og:title", content: "A/B Tests — Directful Content Library" },
      { property: "og:description", content: "Content tests and results for your guest messaging campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AbTestsPage,
});
