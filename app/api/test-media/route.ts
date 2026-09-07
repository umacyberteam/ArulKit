import { NextResponse } from "next/server";

export async function GET() {
  const url = "PASTE_URL_MEDIA_SSSINSTAGRAM_DI_SINI";

  try {
    const start = Date.now();

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
      },
    });

    const contentType = res.headers.get("content-type");

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType,
      finalUrl: res.url,
      elapsedMs: Date.now() - start,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}