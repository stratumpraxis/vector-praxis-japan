import type { MetadataRoute } from "next";
import { canonicalUrl, siteOrigin } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: canonicalUrl,
      lastModified: new Date("2026-09-04"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteOrigin}/ai-agent-bottleneck`,
      lastModified: new Date("2026-09-04"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
