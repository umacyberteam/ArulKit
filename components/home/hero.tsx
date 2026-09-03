"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-blueprint bg-blueprint-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />

      <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="font-mono text-sm text-brass">arulkit.my.id</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Toolkit harian, dirapikan di satu tempat.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-fg/65">
            Upload file, tarik video dari YouTube, Instagram, dan TikTok,
            atau intip source code website — tanpa akun, tanpa iklan.
            Dibangun dan dirawat langsung oleh Arul.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="#tools" size="lg">
              Lihat semua tools
            </LinkButton>
            <LinkButton href="#suggest" variant="outline" size="lg">
              Usulkan tool baru <ArrowUpRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="rounded-lg border border-border bg-surface font-mono text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-brass/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal/70" />
            <span className="ml-3 text-fg/40">downloader — arulkit</span>
          </div>
          <div className="space-y-3 p-5 leading-relaxed">
            <div className="text-fg/40">$ paste link…</div>
            <div className="rounded-sm border border-border bg-bg px-3 py-2 text-fg/80">
              https://tiktok.com/@arul/video/812…
            </div>
            <div className="flex items-center gap-2 text-signal">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
              platform terdeteksi: tiktok
            </div>
            <div className="mt-2 grid gap-2">
              <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                <span className="text-fg/70">video · HD · no watermark</span>
                <span className="text-brass">↓ unduh</span>
              </div>
              <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                <span className="text-fg/70">audio · mp3</span>
                <span className="text-brass">↓ unduh</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
