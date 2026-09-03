import { NextRequest, NextResponse } from "next/server";
import { resolveDownload, DownloaderError } from "@/lib/downloader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "URL wajib diisi." }, { status: 400 });
  }

  try {
    const result = await resolveDownload(url);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof DownloaderError) {
      const status =
        err.code === "not_configured"
          ? 501
          : err.code === "not_found"
            ? 404
            : err.code === "invalid_url" || err.code === "unsupported"
              ? 400
              : 502;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan tak terduga." },
      { status: 500 }
    );
  }
}
