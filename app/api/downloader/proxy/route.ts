import { NextRequest, NextResponse } from "next/server";
import { SiputzxProvider } from "@/lib/downloader/providers/siputzx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TIKTOK_HOSTS = ["tiktokcdn.com", "tiktokcdn-us.com", "ibytedtos.com", "muscdn.com"];

function isAllowedTikTokHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return TIKTOK_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function safeFilename(value: string | null, fallback = "media") {
  const cleaned = (value || fallback).replace(/[\\/\0<>:"|?*\r\n]+/g, "_").trim();
  return cleaned.slice(0, 120) || fallback;
}

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("url");
  const platform = req.nextUrl.searchParams.get("platform");
  const format = req.nextUrl.searchParams.get("format");
  const filename = safeFilename(req.nextUrl.searchParams.get("filename"), "media.mp4");

  if (!source) return NextResponse.json({ error: "URL media tidak ditemukan." }, { status: 400 });

  if (platform === "instagram") {
    if (!format) return NextResponse.json({ error: "Format media tidak ditemukan." }, { status: 400 });
    try {
      const result = await new SiputzxProvider().resolve(source, "instagram");
      const selected = result.formats.find((item) => item.id === format);
      if (!selected) return NextResponse.json({ error: "Format media sudah tidak tersedia." }, { status: 404 });
      return streamMedia(selected.url, filename, "Media Instagram");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengambil media Instagram.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: "URL media tidak valid." }, { status: 400 });
  }

  if (sourceUrl.protocol !== "https:" || !isAllowedTikTokHost(sourceUrl.hostname)) {
    return NextResponse.json({ error: "Sumber media tidak diizinkan." }, { status: 403 });
  }

  return streamMedia(sourceUrl.toString(), filename, "Media TikTok");
}

async function streamMedia(source: string, filename: string, label: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000);

  try {
    const upstream = await fetch(source, {
      headers: {
        Accept: "video/mp4,audio/mpeg,image/*,video/*,audio/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; ArulKit/1.0)",
      },
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `Gagal mengambil ${label} (HTTP ${upstream.status}).` }, { status: 502 });
    }

    const finalUrl = new URL(upstream.url);
    if (finalUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Redirect media tidak diizinkan." }, { status: 502 });
    }
    if (label.includes("TikTok") && !isAllowedTikTokHost(finalUrl.hostname)) {
      return NextResponse.json({ error: "Redirect media TikTok tidak diizinkan." }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (err) {
    if ((err as Error).name === "AbortError") return NextResponse.json({ error: "Download timeout." }, { status: 504 });
    return NextResponse.json({ error: `Gagal mengambil ${label}.` }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
