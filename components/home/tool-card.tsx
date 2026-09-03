import Link from "next/link";
import { UploadCloud, Download, Code2, ArrowRight } from "lucide-react";
import type { ToolMeta } from "@/lib/config/tools";
import { Badge, StatusDot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ICONS = {
  "upload-cloud": UploadCloud,
  download: Download,
  "code-2": Code2,
} as const;

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = ICONS[tool.icon];

  return (
    <Link
      href={tool.href}
      className={cn(
        "group relative flex flex-col justify-between rounded-lg border border-border bg-surface p-5",
        "transition-all duration-150 hover:-translate-y-0.5 hover:border-brass/50"
      )}
    >
      <div>
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg text-brass">
            <Icon className="h-5 w-5" />
          </span>
          <StatusDot status={tool.status} />
        </div>

        <h3 className="mt-4 font-display text-base font-semibold">
          {tool.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-fg/60">
          {tool.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Badge className="font-mono lowercase">/{tool.slug}</Badge>
        <span className="flex items-center gap-1 text-sm text-fg/50 transition-colors group-hover:text-brass">
          Buka <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
