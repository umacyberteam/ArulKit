import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED_HOSTS = [
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "ibytedtos.com",
  "muscdn.com",
];

function isAllowedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function safeFilename(value: string | null) {
  const fallback = "tiktok-video.mp4";
  if (!value) return fallback;
  const cleaned = value.replace(/[\\/\0<>:"|?*\r\n]+/g, "_").trim();
  return cleaned.slice(0, 120) || fallback;
}

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("url");
  const filename = safeFilename(req.nextUrl.searchParams.get("filename"));

  if (!source) {
    return NextResponse.json({ error: "URL media tidak ditemukan." }, { status: 400 });
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: "URL media tidak valid." }, { status: 400 });
  }

  if (sourceUrl.protocol !== "https:" || !isAllowedHost(sourceUrl.hostname)) {
    return NextResponse.json({ error: "Sumber media tidak diizinkan." }, { status: 403 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000);

  try {
    const upstream = await fetch(sourceUrl, {
      headers: {
        Accept: "video/mp4,audio/mpeg,video/*,audio/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; ArulKit/1.0)",
      },
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Gagal mengambil media dari TikTok CDN (HTTP ${upstream.status}).` },
        { status: 502 }
      );
    }

    let finalUrl: URL;
    try {
      finalUrl = new URL(upstream.url);
    } catch {
      return NextResponse.json({ error: "URL media hasil redirect tidak valid." }, { status: 502 });
    }

    if (finalUrl.protocol !== "https:" || !isAllowedHost(finalUrl.hostname)) {
      return NextResponse.json({ error: "Redirect media tidak diizinkan." }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json({ error: "Download TikTok timeout." }, { status: 504 });
    }
    return NextResponse.json({ error: "Gagal mengambil media TikTok." }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
