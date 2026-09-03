import {
  DownloaderProvider,
  DownloaderError,
  DownloadResult,
  Platform,
} from "../types";

/** SocialKit synchronous download provider for YouTube and Instagram. */
export class SocialKitProvider implements DownloaderProvider {
  name = "socialkit";
  supports: Platform[] = ["youtube", "instagram"];

  private get accessKey() {
    return process.env.SOCIALKIT_API_KEY?.trim();
  }

  isConfigured(): boolean {
    return Boolean(this.accessKey);
  }

  async resolve(url: string, platform: Platform): Promise<DownloadResult> {
    const accessKey = this.accessKey;
    if (!accessKey) {
      throw new DownloaderError(
        `Downloader ${platform === "youtube" ? "YouTube" : "Instagram"} belum dikonfigurasi. Set SOCIALKIT_API_KEY di environment variables.`,
        "not_configured"
      );
    }

    if (!this.supports.includes(platform)) {
      throw new DownloaderError("Platform tidak didukung provider ini.", "unsupported");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(`https://api.socialkit.dev/${platform}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-access-key": accessKey,
        },
        body: JSON.stringify({
          url,
          format: "mp4",
          quality: "720p",
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        throw new DownloaderError("Provider SocialKit timeout.", "timeout");
      }
      throw new DownloaderError(
        "Tidak bisa menghubungi provider SocialKit saat ini.",
        "upstream_error"
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await res.json().catch(() => null);

    if (res.status === 401 || res.status === 403) {
      throw new DownloaderError(
        "SocialKit API key tidak valid atau kuota sudah habis.",
        "not_configured"
      );
    }

    if (res.status === 429) {
      throw new DownloaderError(
        "Batas request SocialKit sedang tercapai. Coba lagi nanti.",
        "upstream_error"
      );
    }

    if (!res.ok || !data?.success) {
      const message =
        data?.message ||
        data?.error ||
        `SocialKit mengembalikan error (HTTP ${res.status}).`;

      if (res.status === 404) {
        throw new DownloaderError(message, "not_found");
      }

      throw new DownloaderError(message, "upstream_error");
    }

    const d = data.data;
    if (!d?.downloadUrl) {
      throw new DownloaderError(
        "SocialKit tidak mengembalikan link download.",
        "not_found"
      );
    }

    return {
      platform,
      sourceUrl: url,
      title: d.title,
      thumbnail: d.thumbnail,
      formats: [
        {
          id: "mp4-720p",
          label: `Video MP4${d.quality ? ` (${d.quality})` : ""}`,
          url: d.downloadUrl,
          ext: "mp4",
          isAudio: false,
        },
      ],
      provider: this.name,
    };
  }
}
