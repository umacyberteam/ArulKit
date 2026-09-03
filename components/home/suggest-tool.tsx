"use client";

import { useState, type FormEvent } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { openTawkChat } from "@/lib/tawkto";
import { siteConfig } from "@/lib/config/site";

export function SuggestTool() {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [fallback, setFallback] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = `Usul tool baru: ${name}\n\n${detail}`.trim();
    const opened = openTawkChat(message);
    if (!opened) {
      setFallback(true);
    } else {
      setName("");
      setDetail("");
    }
  }

  return (
    <section id="suggest" className="border-b border-border py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-brass">
            <MessageSquarePlus className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
            Usulkan tool
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg/60">
            Punya ide tool yang harusnya ada di ArulKit? Atau nemu bug? Kirim
            langsung lewat live chat — masuk ke inbox Arul.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border bg-surface p-6"
        >
          <div>
            <label htmlFor="tool-name" className="text-sm text-fg/70">
              Nama tool / topik
            </label>
            <input
              id="tool-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Spotify downloader"
              className="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm outline-none placeholder:text-fg/40 focus:border-brass/60"
            />
          </div>
          <div>
            <label htmlFor="tool-detail" className="text-sm text-fg/70">
              Detail / kenapa perlu
            </label>
            <textarea
              id="tool-detail"
              required
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={4}
              placeholder="Ceritakan kebutuhannya…"
              className="mt-1.5 w-full resize-none rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg/40 focus:border-brass/60"
            />
          </div>

          {fallback && (
            <p className="rounded-md border border-brass/30 bg-brass/10 px-3 py-2 text-xs text-brass">
              Live chat belum siap di browser ini. Kirim manual lewat email:{" "}
              <a
                className="underline"
                href={`mailto:hello@arulkit.my.id?subject=${encodeURIComponent(
                  `Usul tool: ${name || "(tanpa judul)"}`
                )}&body=${encodeURIComponent(detail)}`}
              >
                hello@{new URL(siteConfig.url).hostname}
              </a>
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto">
            Kirim usulan
          </Button>
        </form>
      </Container>
    </section>
  );
}
