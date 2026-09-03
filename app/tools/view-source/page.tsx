import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { ViewSourceViewer } from "@/components/tools/view-source-viewer";
import { getToolBySlug } from "@/lib/config/tools";

const tool = getToolBySlug("view-source")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  alternates: { canonical: tool.href },
};

export default function ViewSourcePage() {
  return (
    <>
      <ToolPageHeader tool={tool} />
      <Container className="py-14 sm:py-20">
        <ViewSourceViewer />

        <div className="mx-auto mt-14 max-w-3xl border-t border-border pt-8 text-sm leading-relaxed text-fg/50">
          <p>
            Diambil langsung dari server (bukan browser kamu), jadi tidak
            kena batasan CORS. HTML ditampilkan sebagai teks biasa dan{" "}
            <strong className="text-fg/70">tidak pernah dieksekusi</strong> —
            aman dari script berbahaya di halaman yang kamu cek.
          </p>
        </div>
      </Container>
    </>
  );
}
