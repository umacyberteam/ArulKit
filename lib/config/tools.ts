export type ToolCategory = "upload" | "downloader" | "developer";

export interface ToolMeta {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  category: ToolCategory;
  icon: "upload-cloud" | "download" | "code-2";
  popular?: boolean;
  addedAt: string; // ISO date, used for "Recently Added"
  status: "online" | "beta";
}

export const categories: { id: ToolCategory; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "downloader", label: "Downloader" },
  { id: "developer", label: "Developer" },
];

export const tools: ToolMeta[] = [
  {
    slug: "catbox-upload",
    name: "Catbox Upload",
    shortName: "Upload",
    description:
      "Upload file ke Catbox lewat drag & drop atau file picker, langsung dapat link permanen.",
    href: "/tools/catbox-upload",
    category: "upload",
    icon: "upload-cloud",
    popular: true,
    addedAt: "2026-08-20",
    status: "online",
  },
  {
    slug: "downloader",
    name: "All-in-One Downloader",
    shortName: "Downloader",
    description:
      "Download video/audio dari YouTube, Instagram, dan TikTok cukup dengan satu link.",
    href: "/tools/downloader",
    category: "downloader",
    icon: "download",
    popular: true,
    addedAt: "2026-08-25",
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
