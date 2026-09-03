import {
  DownloaderProvider,
  DownloaderError,
  DownloadResult,
  Platform,
} from "../types";

/**
 * Provider for tikwm.com's public TikTok resolver API
 * (POST https://www.tikwm.com/api/). It's an unofficial, community-run,
 * free/no-key JSON API that only needs a TikTok URL — used here purely as a
 * zero-configuration fallback so TikTok downloads work out of the box, even
 * for YouTube/Instagram. It is rate-limited (~1 request/second) and can change
 * without notice since it's unofficial, so it is intentionally scoped to
 * TikTok only.
 */
export class TikwmProvider implements DownloaderProvider {
  name = "tikwm";
  supports: Platform[] = ["tiktok"];

  isConfigured(): boolean {
    // Always available — no credentials required.
    return true;
  }

  async resolve(url: string, platform: Platform): Promise<DownloadResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    let res: Response;
    try {
      res = await fetch("https://www.tikwm.com/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ArulKit/1.0 (+https://arulkit.my.id)",
        },
        body: new URLSearchParams({ url, hd: "1" }).toString(),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        throw new DownloaderError("Provider TikTok timeout.", "timeout");
      }
      throw new DownloaderError(
        "Tidak bisa menghubungi provider TikTok saat ini.",
        "upstream_error"
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new DownloaderError(
        "Provider TikTok sedang bermasalah, coba lagi sebentar lagi.",
        "upstream_error"
      );
    }

    const data = await res.json();

    if (data.code !== 0 || !data.data) {
      throw new DownloaderError(
        "Video TikTok tidak ditemukan atau bersifat privat.",
        "not_found"
      );
    }

    const d = data.data;
    const formats = [
      d.hdplay && {
        id: "hd",
        label: "Video HD (tanpa watermark)",
        url: d.hdplay as string,
        ext: "mp4",
        isAudio: false,
      },
      d.play && {
        id: "sd",
        label: "Video (tanpa watermark)",
        url: d.play as string,
        ext: "mp4",
        isAudio: false,
      },
      d.music && {
        id: "audio",
        label: "Audio saja (MP3)",
        url: d.music as string,
        ext: "mp3",
        isAudio: true,
      },
    ].filter(Boolean) as DownloadResult["formats"];

    if (formats.length === 0) {
      throw new DownloaderError(
        "Tidak ada file yang bisa diunduh dari link ini.",
        "not_found"
      );
    }

    return {
      platform,
      sourceUrl: url,
      title: d.title,
      thumbnail: d.cover,
      author: d.author?.nickname,
      formats,
      provider: this.name,
    };
  }
}
