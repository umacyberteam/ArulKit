import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_LINKS = [
  { href: "/#tools", label: "Tools" },
  { href: "/#popular", label: "Popular" },
  { href: "/#suggest", label: "Suggest a tool" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <span className="text-fg/40">[</span>
          ArulKit
          <span className="text-fg/40">]</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-fg/70 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
