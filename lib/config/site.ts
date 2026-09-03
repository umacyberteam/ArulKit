export const siteConfig = {
  name: "ArulKit",
  tagline: "Toolkit harian, dirapikan di satu tempat.",
  description:
    "ArulKit adalah kumpulan tools all-in-one — upload file, download video, dan lihat source code website — dibuat dan dirawat langsung oleh Arul.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://arulkit.my.id",
  author: {
    name: "Arul",
    url: "https://arulkit.my.id",
  },
  ogImage: "/og-image.svg",
  keywords: [
    "arulkit",
    "all in one tools",
    "catbox upload",
    "downloader tiktok",
    "downloader instagram",
    "downloader youtube",
    "view source website",
    "tools online gratis",
  ],
  links: {
    tawkto: "https://www.tawk.to",
  },
} as const;
