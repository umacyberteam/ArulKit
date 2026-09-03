import {
  DownloaderProvider,
  DownloaderError,
  DownloadResult,
  Platform,
} from "../types";

const API = "https://api.socialkit.dev";
const POLL_INTERVAL_MS = 1000;
const MAX_POLL_MS = 25_000;

/** SocialKit downloader for YouTube and Instagram.
 * Uses v2 async jobs so the server does not sit on one long request while
 * SocialKit prepares the media. The API supports YouTube, TikTok and
 * Instagram; TikTok is intentionally handled by TikWM in this project.
 */
export class SocialKitProvider implements DownloaderProvider {
  name = "socialkit";
  supports: Platform[] = ["youtube", "instagram"];

  private get key() {
    return process.env.SOCIALKIT_API_KEY?.trim();
  }

  isConfigured(): boolean {
    return Boolean(this.key);
  }

  async resolve(url: string, platform: Platform): Promise<DownloadResult> {
    if (!this.key) {
      throw new DownloaderError(
        "SocialKit belum dikonfigurasi. Set SOCIALKIT_API_KEY di Vercel.",
        "not_configured"
      );
    }

    const endpoint = `${API}/v2/${platform}/download?${new URLSearchParams({
      access_key: this.key,
      url,
      format: "mp4",
      quality: "720p",
    })}`;

    const start = await this.fetchJson(endpoint, "POST");
    if (!start.success || !start.data?.jobId) {
      throw this.mapError(start, "SocialKit gagal membuat download job.");
    }

    const jobId = String(start.data.jobId);
    const statusUrl = `${API}/v2/downloads/${encodeURIComponent(jobId)}?${new URLSearchParams({
      access_key: this.key,
    })}`;

    const deadline = Date.now() + MAX_POLL_MS;
    let last: any = null;

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      last = await this.fetchJson(statusUrl, "GET");

      if (!last.success) throw this.mapError(last, "SocialKit gagal memproses video.");

      const data = last.data;
      if (data?.status === "ready" && data.downloadUrl) {
        return {
          platform,
          sourceUrl: url,
          title: data.title,
          thumbnail: data.thumbnail,
          formats: [
            {
              id: "video",
              label: `Video ${data.quality || "720p"} MP4`,
              url: data.downloadUrl,
              ext: "mp4",
              isAudio: false,
            },
          ],
          provider: this.name,
        };
      }

      if (["failed", "error", "cancelled", "canceled"].includes(data?.status)) {
        throw this.mapError(last, "SocialKit gagal mengunduh video.");
      }
    }

    throw new DownloaderError(
      "SocialKit masih memproses video. Coba lagi beberapa detik kemudian.",
      "timeout"
    );
  }

  private async fetchJson(url: string, method: "GET" | "POST") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "x-access-key": this.key!,
          ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        signal: controller.signal,
        cache: "no-store",
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new DownloaderError(
          `SocialKit mengembalikan respons yang tidak valid (HTTP ${res.status}).`,
          "upstream_error"
        );
      }

      if (!res.ok) {
        throw this.mapError(data, `SocialKit error HTTP ${res.status}.`);
      }
      return data;
    } catch (err) {
      if (err instanceof DownloaderError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new DownloaderError("Koneksi ke SocialKit timeout.", "timeout");
      }
      throw new DownloaderError(
        "Tidak bisa menghubungi SocialKit saat ini.",
        "upstream_error"
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private mapError(payload: any, fallback: string): DownloaderError {
    const message =
      payload?.error?.message ||
      payload?.message ||
      payload?.error ||
      fallback;
    const lower = String(message).toLowerCase();
    if (lower.includes("not found") || lower.includes("private") || lower.includes("deleted")) {
      return new DownloaderError("Video tidak ditemukan, privat, atau sudah dihapus.", "not_found");
    }
    if (lower.includes("access key") || lower.includes("unauthorized") || lower.includes("quota")) {
      return new DownloaderError("SOCIALKIT_API_KEY tidak valid atau kuota habis.", "not_configured");
    }
    return new DownloaderError(String(message), "upstream_error");
  }
}
