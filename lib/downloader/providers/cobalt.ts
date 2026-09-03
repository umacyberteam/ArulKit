import {
  DownloaderProvider,
  DownloaderError,
  DownloadResult,
  Platform,
} from "../types";

/**
 * Provider for https://github.com/imputnet/cobalt — an open-source,
 * self-hostable media resolver that supports YouTube, Instagram, TikTok and
 * 20+ other platforms behind one consistent API.
 *
 * There is no usable public instance for third-party apps: the maintainers'
 * own hosted instance (api.cobalt.tools) enforces bot-protection and asks
 * integrators to self-host instead (see docs/api.md in the repo). ArulKit
 * therefore expects COBALT_API_URL to point at an instance you deployed
 * yourself (Railway one-click template, Docker, Fly.io, etc — see README).
 *
 * Until COBALT_API_URL is set, this provider reports itself as not
 * configured, and the downloader route falls back to the tikwm provider for
 * TikTok only (see ./tikwm.ts). YouTube and Instagram require this provider.
 */
export class CobaltProvider implements DownloaderProvider {
  name = "cobalt";
  supports: Platform[] = ["youtube", "instagram", "tiktok"];

  private get baseUrl() {
    return process.env.COBALT_API_URL?.replace(/\/+$/, "");
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl);
  }

  async resolve(url: string, platform: Platform): Promise<DownloadResult> {
    if (!this.baseUrl) {
      throw new DownloaderError(
        `Downloader untuk ${platform} butuh instance cobalt sendiri. Set COBALT_API_URL di environment variables (lihat README).`,
        "not_configured"
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let res: Response;
    try {
      res = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(process.env.COBALT_API_KEY
            ? { Authorization: `Api-Key ${process.env.COBALT_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          url,
          filenameStyle: "pretty",
          downloadMode: "auto",
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        throw new DownloaderError(
          "Instance cobalt tidak merespons (timeout).",
          "timeout"
        );
      }
      throw new DownloaderError(
        "Tidak bisa menghubungi instance cobalt. Pastikan COBALT_API_URL benar dan instance aktif.",
        "upstream_error"
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new DownloaderError(
        `Instance cobalt mengembalikan error (HTTP ${res.status}).`,
        "upstream_error"
      );
    }

    const data = await res.json();

    if (data.status === "error") {
      const msg: string =
        data?.error?.code === "error.api.link.unsupported"
          ? "Link tidak dikenali atau platform belum didukung instance cobalt kamu."
          : data?.error?.code || "Gagal memproses link ini.";
      throw new DownloaderError(msg, "upstream_error");
    }

    if (data.status === "redirect" || data.status === "tunnel") {
      return {
        platform,
        sourceUrl: url,
        title: data.filename,
        formats: [
          {
            id: "direct",
            label: platform === "youtube" ? "Video" : "Media",
            url: data.url,
            ext: (data.filename?.split(".").pop() as string) || "mp4",
            isAudio: Boolean(data.audio),
          },
        ],
        provider: this.name,
      };
    }

    if (data.status === "picker" && Array.isArray(data.picker)) {
      const formats = data.picker.map((item: any, idx: number) => ({
        id: `picker-${idx}`,
        label:
          item.type === "video"
            ? `Media ${idx + 1}`
            : item.type === "photo"
              ? `Foto ${idx + 1}`
              : `Item ${idx + 1}`,
        url: item.url,
        ext: item.type === "photo" ? "jpg" : "mp4",
        isAudio: false,
      }));

      if (data.audio) {
        formats.push({
          id: "picker-audio",
          label: "Audio",
          url: data.audio,
          ext: "mp3",
          isAudio: true,
        });
      }

      return {
        platform,
        sourceUrl: url,
        formats,
        provider: this.name,
      };
    }

    throw new DownloaderError(
      "Format respons dari cobalt tidak dikenali.",
      "upstream_error"
    );
  }
}
