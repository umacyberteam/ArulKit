import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Catbox's documented single-file upload limit.
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB
const CATBOX_API_URL = "https://catbox.moe/user/api.php";

export async function POST(req: NextRequest) {
  const incomingForm = await req.formData().catch(() => null);
  const file = incomingForm?.get("file");

  if (!incomingForm || !(file instanceof File)) {
    return NextResponse.json(
      { error: "File tidak ditemukan di request." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File melebihi batas 200MB dari Catbox." },
      { status: 400 }
    );
  }

  const outgoing = new FormData();
  outgoing.set("reqtype", "fileupload");
  if (process.env.CATBOX_USERHASH) {
    outgoing.set("userhash", process.env.CATBOX_USERHASH);
  }
  outgoing.set("fileToUpload", file, file.name);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  let res: Response;
  try {
    res = await fetch(CATBOX_API_URL, {
      method: "POST",
      body: outgoing,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const timedOut = (err as Error).name === "AbortError";
    return NextResponse.json(
      {
        error: timedOut
          ? "Upload timeout, coba lagi dengan file yang lebih kecil."
          : "Gagal menghubungi Catbox.",
      },
      { status: 502 }
    );
  }
  clearTimeout(timer);

  const text = (await res.text()).trim();

  if (!res.ok || !text.startsWith("http")) {
    return NextResponse.json(
      { error: text || "Catbox menolak upload ini." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: text });
}
