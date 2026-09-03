import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { tools } from "@/lib/config/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteConfig.url}${tool.href}`,
    lastModified: tool.addedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...toolRoutes,
  ];
}
