import Link from "next/link";
import { Container } from "@/components/ui/container";
import { tools } from "@/lib/config/tools";
import { siteConfig } from "@/lib/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <div className="font-display text-lg font-semibold">
            <span className="text-fg/40">[</span>ArulKit
            <span className="text-fg/40">]</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg/60">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <div className="text-sm font-medium text-fg/80">Tools</div>
          <ul className="mt-3 space-y-2 text-sm text-fg/60">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={tool.href}
                  className="transition-colors hover:text-brass"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-medium text-fg/80">Dibuat oleh</div>
          <p className="mt-3 text-sm text-fg/60">
            {siteConfig.author.name} — dirawat manual, satu orang, satu
            toolbox.
          </p>
          <p className="mt-4 font-mono text-xs text-fg/40">
            arulkit.my.id
          </p>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-fg/40 sm:flex-row">
          <span>© {new Date().getFullYear()} ArulKit. Semua hak dilindungi.</span>
          <span>Dibangun dengan Next.js &amp; Tailwind CSS.</span>
        </Container>
      </div>
    </footer>
  );
}
