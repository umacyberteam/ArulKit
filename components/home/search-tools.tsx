"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { tools, categories, type ToolCategory } from "@/lib/config/tools";
import { Container } from "@/components/ui/container";
import { ToolCard } from "@/components/home/tool-card";
import { cn } from "@/lib/utils";

export function SearchTools() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">(
    "all"
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === "all" || tool.category === activeCategory;
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <section id="tools" className="border-b border-border py-20">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Semua tools
            </h2>
            <p className="mt-2 text-sm text-fg/60">
              Cari atau saring berdasarkan kategori.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari tool…"
              className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-fg/40 focus:border-brass/60"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <CategoryChip
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            label="Semua"
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
              label={c.label}
            />
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-fg/50">
            Tidak ada tool yang cocok dengan pencarian ini.
          </div>
        )}
      </Container>
    </section>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-brass bg-brass/10 text-brass"
          : "border-border text-fg/60 hover:border-brass/40 hover:text-fg"
      )}
    >
      {label}
    </button>
  );
}
