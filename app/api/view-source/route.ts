import { NextRequest, NextResponse } from "next/server";
import { validateExternalUrl } from "@/lib/security/ssrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = Number(process.env.VIEW_SOURCE_TIMEOUT_MS ?? 8000);
const MAX_BYTES = Number(process.env.VIEW_SOURCE_MAX_BYTES ?? 2_000_000); // ~2MB
const MAX_REDIRECTS = 3;

async function fetchWithGuards(startUrl: string) {
  let currentUrl = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const validation = await validateExternalUrl(currentUrl);
    if (!validation.ok) {
      throw new Error(validation.reason ?? "URL tidak valid.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "ArulKit-ViewSource/1.0 (+https://arulkit.my.id)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    // Manually follow redirects so every hop is re-validated against SSRF rules.
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect tanpa tujuan yang jelas.");
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!res.ok) {
      throw new Error(`Website merespons dengan status ${res.status}.`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("xml") &&
      !contentType.includes("text/plain")
    ) {
      throw new Error(
        `Konten bukan HTML (content-type: ${contentType.split(";")[0]}).`
      );
    }

    // Stream the body ourselves so we can enforce a hard byte cap instead of
    // trusting Content-Length (which can be absent or lie).
    if (!res.body) return { html: await res.text(), finalUrl: currentUrl };

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        reader.cancel();
        throw new Error(
          `Response terlalu besar (batas ${(MAX_BYTES / 1_000_000).toFixed(1)}MB).`
        );
      }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString(
      "utf-8"
    );
    return { html, finalUrl: currentUrl };
  }

  throw new Error("Terlalu banyak redirect.");
}

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
    const { html, finalUrl } = await fetchWithGuards(url);
    return NextResponse.json({ html, finalUrl });
  } catch (err) {
    const message =
      err instanceof Error && (err as any).name === "AbortError"
        ? "Request timeout — website terlalu lama merespons."
        : err instanceof Error
          ? err.message
          : "Gagal mengambil source website.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
