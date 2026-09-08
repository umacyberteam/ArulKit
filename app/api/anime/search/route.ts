import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = "https://api.siputzx.my.id/api/anime/otakudesu/search";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("s")?.trim();
  if (!query) return NextResponse.json({ error: "Query anime wajib diisi." }, { status: 400 });
  if (query.length > 100) return NextResponse.json({ error: "Query terlalu panjang." }, { status: 400 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${API}?${new URLSearchParams({ s: query })}`, {
      headers: { Accept: "application/json", "User-Agent": "ArulKit/1.0" },
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await res.text();
    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: `Provider anime mengembalikan respons tidak valid (HTTP ${res.status}).` }, { status: 502 });
    }

    if (!res.ok || payload?.status === false) {
      return NextResponse.json({ error: String(payload?.message || payload?.error || `Provider anime error HTTP ${res.status}.`) }, { status: 502 });
    }

    const results = Array.isArray(payload?.data)
      ? payload.data
          .map((item: any) => ({
            title: String(item?.title || "Tanpa judul"),
            url: String(item?.link || ""),
            thumbnail: String(item?.imageUrl || ""),
            genres: String(item?.genres || ""),
            status: String(item?.status || ""),
            rating: String(item?.rating || ""),
          }))
          .filter((item: { url: string }) => item.url)
      : [];

    return NextResponse.json({ results });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json({ error: "Provider anime timeout." }, { status: 504 });
    }
    return NextResponse.json({ error: "Tidak bisa menghubungi provider anime saat ini." }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
