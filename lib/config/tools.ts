export type ToolCategory = "downloader" | "anime" | "developer";

export interface ToolMeta {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  category: ToolCategory;
  icon: "download" | "search" | "code-2";
  popular?: boolean;
  addedAt: string;
  status: "online" | "beta";
}

export const categories: { id: ToolCategory; label: string }[] = [
  { id: "downloader", label: "Downloader" },
  { id: "anime", label: "Anime" },
  { id: "developer", label: "Developer" },
];

export const tools: ToolMeta[] = [
  {
    slug: "downloader",
    name: "Social Media Downloader",
    shortName: "Downloader",
    description:
      "Download media dari Instagram dan TikTok cukup dengan satu link.",
    href: "/tools/downloader",
    category: "downloader",
    icon: "download",
    popular: true,
    addedAt: "2026-08-25",
    status: "online",
  },
  {
    slug: "anime-searcher",
    name: "Anime Searcher",
    shortName: "Anime",
    description:
      "Cari anime dari katalog Otakudesu dan lihat detail hasilnya dengan cepat.",
    href: "/tools/anime-searcher",
    category: "anime",
    icon: "search",
    popular: true,
    addedAt: "2026-09-08",
    status: "online",
  },
  {
    slug: "view-source",
    name: "View Source",
    shortName: "Source",
    description:
      "Lihat HTML mentah sebuah website dari server, lengkap dengan syntax highlighting.",
    href: "/tools/view-source",
    category: "developer",
    icon: "code-2",
    popular: false,
    addedAt: "2026-09-01",
    status: "online",
  },
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getPopularTools(): ToolMeta[] {
  return tools.filter((t) => t.popular);
}

export function getRecentTools(limit = 3): ToolMeta[] {
  return [...tools]
    .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
    .slice(0, limit);
}
