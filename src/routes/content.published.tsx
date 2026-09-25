import { createFileRoute } from "@tanstack/react-router";
import { PublishedPage } from "@/components/content/LibraryPages";

export const Route = createFileRoute("/content/published")({
  head: () => ({
    meta: [
      { title: "Published — Directful Content Library" },
      { name: "description", content: "Every content release your hotel has published, with campaigns, versions, segments and channels." },
      { property: "og:title", content: "Published — Directful Content Library" },
      { property: "og:description", content: "Every content release your hotel has published, with campaigns, versions, segments and channels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublishedPage,
});
