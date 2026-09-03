import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { StatusDot } from "@/components/ui/badge";
import type { ToolMeta } from "@/lib/config/tools";

export function ToolPageHeader({ tool }: { tool: ToolMeta }) {
  return (
    <div className="border-b border-border bg-blueprint bg-blueprint-grid">
      <Container className="py-14 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-fg/50 transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Semua tools
        </Link>

        <div className="mt-5 flex items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {tool.name}
          </h1>
          <StatusDot status={tool.status} />
        </div>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-fg/60 sm:text-base">
          {tool.description}
        </p>
      </Container>
    </div>
  );
}
