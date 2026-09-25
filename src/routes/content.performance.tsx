import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/components/content/LibraryPages";

export const Route = createFileRoute("/content/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Directful Content Library" },
      { name: "description", content: "How your published guest content is performing across campaigns and releases." },
      { property: "og:title", content: "Performance — Directful Content Library" },
      { property: "og:description", content: "How your published guest content is performing across campaigns and releases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformancePage,
});
