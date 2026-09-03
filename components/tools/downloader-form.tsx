"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Youtube,
  Instagram,
  Music2,
  Link2,
  Download,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { detectPlatform } from "@/lib/downloader/detect-platform";
import type { DownloadResult, Platform } from "@/lib/downloader/types";
import { isValidHttpUrl, cn } from "@/lib/utils";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DownloadResult }
  | { status: "error"; message: string; code?: string };

const PLATFORM_META: Record<
  Exclude<Platform, "unknown">,
  { label: string; icon: typeof Youtube }
> = {
  youtube: { label: "YouTube", icon: Youtube },
  instagram: { label: "Instagram", icon: Instagram },
  tiktok: { label: "TikTok", icon: Music2 },
};

export function DownloaderForm() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const platform = useMemo(
    () => (isValidHttpUrl(url) ? detectPlatform(url) : "unknown"),
    [url]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidHttpUrl(url)) {
      setState({ status: "error", message: "Masukkan URL yang valid." });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/downloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error || "Gagal memproses link ini.",
          code: data.code,
        });
        return;
      }

      setState({ status: "success", result: data });
    } catch {
      setState({
        status: "error",
        message: "Tidak bisa terhubung ke server. Cek koneksi internet kamu.",
      });
    }
  }

  const detected = platform !== "unknown" ? PLATFORM_META[platform] : null;

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/40" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Tempel link YouTube, Instagram, atau TikTok…"
            className="h-12 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-fg/40 focus:border-brass/60"
          />
        </div>
        <Button type="submit" size="lg" disabled={state.status === "loading"}>
          {state.status === "loading" ? (
            <Spinner />
          ) : (
            <>
              <Download className="h-4 w-4" /> Proses
            </>
          )}
        </Button>
      </form>

      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-fg/50">
        {detected ? (
          <>
            <detected.icon className="h-3.5 w-3.5 text-brass" />
            Platform terdeteksi: {detected.label}
          </>
        ) : (
          url.length > 0 && "Platform belum terdeteksi — YouTube, Instagram, atau TikTok saja."
        )}
      </div>

      {state.status === "error" && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{state.message}</p>
            {state.code === "not_configured" && (
              <p className="mt-1 text-xs text-danger/80">
                Pemilik situs perlu mengatur <code className="font-mono">COBALT_API_URL</code> di
                environment variables. Lihat README.
              </p>
            )}
          </div>
        </div>
      )}

      {state.status === "success" && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-start gap-3">
            {state.result.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.result.thumbnail}
                alt=""
                className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-bg text-fg/30">
                <ImageIcon className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {state.result.title || "Media siap diunduh"}
              </p>
              {state.result.author && (
                <p className="mt-0.5 text-xs text-fg/50">
                  oleh {state.result.author}
                </p>
              )}
              <p className="mt-0.5 font-mono text-xs text-fg/40">
                via {state.result.provider}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {state.result.formats.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={cn(
                  "flex items-center justify-between rounded-md border border-border bg-bg px-4 py-3 text-sm transition-colors hover:border-brass/60"
                )}
              >
                <span className="text-fg/80">{f.label}</span>
                <span className="flex items-center gap-1.5 text-brass">
                  <Download className="h-3.5 w-3.5" /> .{f.ext}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
