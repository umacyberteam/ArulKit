import type { Metadata } from "next";
import { Youtube, Instagram, Music2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { DownloaderForm } from "@/components/tools/downloader-form";
import { getToolBySlug } from "@/lib/config/tools";

const tool = getToolBySlug("downloader")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  alternates: { canonical: tool.href },
};

const PLATFORMS = [
  { icon: Youtube, label: "YouTube" },
  { icon: Instagram, label: "Instagram" },
  { icon: Music2, label: "TikTok" },
];

export default function DownloaderPage() {
  return (
    <>
      <ToolPageHeader tool={tool} />
      <Container className="py-14 sm:py-20">
        <div className="mb-8 flex justify-center gap-6">
          {PLATFORMS.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-1.5 text-xs text-fg/50"
            >
              <p.icon className="h-3.5 w-3.5" /> {p.label}
            </div>
          ))}
        </div>

        <DownloaderForm />

        <div className="mx-auto mt-14 max-w-xl border-t border-border pt-8 text-sm leading-relaxed text-fg/50">
          <p>
            TikTok berjalan langsung tanpa konfigurasi tambahan. Untuk YouTube
            dan Instagram, pemilik situs perlu menjalankan instance{" "}
            <a
              href="https://github.com/imputnet/cobalt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass hover:underline"
            >
              cobalt
            </a>{" "}
            sendiri (lihat README project). Gunakan hanya untuk konten yang
            memang kamu punya haknya.
          </p>
        </div>
      </Container>
    </>
  );
}
