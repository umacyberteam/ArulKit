import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { CatboxUploader } from "@/components/tools/catbox-uploader";
import { getToolBySlug } from "@/lib/config/tools";

const tool = getToolBySlug("catbox-upload")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  alternates: { canonical: tool.href },
};

export default function CatboxUploadPage() {
  return (
    <>
      <ToolPageHeader tool={tool} />
      <Container className="py-14 sm:py-20">
        <CatboxUploader />

        <div className="mx-auto mt-14 max-w-xl border-t border-border pt-8 text-sm text-fg/50">
          <p>
            File diunggah langsung ke{" "}
            <a
              href="https://catbox.moe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass hover:underline"
            >
              Catbox.moe
            </a>{" "}
            lewat API resmi mereka. Link yang dihasilkan bersifat permanen dan
            publik — jangan upload file sensitif.
          </p>
        </div>
      </Container>
    </>
  );
}
