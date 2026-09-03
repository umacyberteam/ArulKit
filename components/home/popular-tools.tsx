import { getPopularTools } from "@/lib/config/tools";
import { Container } from "@/components/ui/container";
import { ToolCard } from "@/components/home/tool-card";

export function PopularTools() {
  const popular = getPopularTools();
  if (popular.length === 0) return null;

  return (
    <section id="popular" className="border-b border-border py-20">
      <Container>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Paling sering dipakai
        </h2>
        <p className="mt-2 max-w-md text-sm text-fg/60">
          Tools yang paling banyak dibuka pengunjung ArulKit.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {popular.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}
