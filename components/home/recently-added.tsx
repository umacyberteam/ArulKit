import { getRecentTools } from "@/lib/config/tools";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentlyAdded() {
  const recent = getRecentTools(3);

  return (
    <section className="border-b border-border py-20">
      <Container>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Baru ditambahkan
        </h2>
        <p className="mt-2 max-w-md text-sm text-fg/60">
          Tool terbaru yang baru saja naik ke ArulKit.
        </p>

        <ol className="mt-8 divide-y divide-border border-y border-border">
          {recent.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={tool.href}
                className="flex flex-col gap-2 py-5 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:px-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-medium">
                      {tool.name}
                    </span>
                    <Badge>
                      {new Date(tool.addedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-fg/60">{tool.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-fg/40" />
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
