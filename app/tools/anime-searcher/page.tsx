import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { AnimeSearcher } from "@/components/tools/anime-searcher";
import { getToolBySlug } from "@/lib/config/tools";

const tool = getToolBySlug("anime-searcher")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  alternates: { canonical: tool.href },
};

export default function AnimeSearcherPage() {
  return (
    <>
      <ToolPageHeader tool={tool} />
      <Container className="py-14 sm:py-20">
        <AnimeSearcher />
        <div className="mx-auto mt-14 max-w-3xl border-t border-border pt-8 text-sm leading-relaxed text-fg/50">
          <p>Data pencarian diambil dari katalog Otakudesu melalui provider ArulKit. Link hasil akan di arahkan ke halaman anime sumber.</p>
        </div>
      </Container>
    </>
  );
}
