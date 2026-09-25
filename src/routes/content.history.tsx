import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/components/content/LibraryPages";

export const Route = createFileRoute("/content/history")({
  head: () => ({
    meta: [
      { title: "History — Directful Content Library" },
      { name: "description", content: "Every version of every campaign — AI generated, refined and manually edited." },
      { property: "og:title", content: "History — Directful Content Library" },
      { property: "og:description", content: "Every version of every campaign — AI generated, refined and manually edited." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});
