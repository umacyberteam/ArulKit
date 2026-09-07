import {
  DownloaderProvider,
  DownloaderError,
  DownloadResult,
  Platform,
} from "../types";

const API = "https://api.siputzx.my.id/api/d/sssinstagram";

/** Instagram provider using SiputZX's public FastDL endpoint. */
export class SiputzxProvider implements DownloaderProvider {
  name = "siputzx";
  supports: Platform[] = ["instagram"];

  isConfigured(): boolean {
    return true;
  }

  async resolve(url: string, platform: Platform): Promise<DownloadResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let res: Response;
    try {
      const endpoint = `${API}?${new URLSearchParams({ url }).toString()}`;
      res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "ArulKit/1.0",
        },
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        throw new DownloaderError("Provider Instagram timeout.", "timeout");
      }
      throw new DownloaderError(
        "Tidak bisa menghubungi provider Instagram saat ini.",
        "upstream_error"
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = await res.text();
    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new DownloaderError(
        `SiputZX mengembalikan respons yang tidak valid (HTTP ${res.status}).`,
        "upstream_error"
      );
    }

    if (!res.ok) {
      const message =
        payload?.message ||
        payload?.error ||
        `SiputZX error HTTP ${res.status}.`;
      throw new DownloaderError(String(message), "upstream_error");
    }

    const rawItems = this.collectMediaItems(payload);
    const formats = rawItems
      .map((item, index) => {
        const mediaUrl = this.pickUrl(item);
        if (!mediaUrl) return null;

        const type = String(
          item?.type || item?.media_type || item?.mime || item?.format || ""
        ).toLowerCase();
        const isAudio = type.includes("audio") || type.includes("mp3");
        const isVideo =
          !isAudio &&
          (type.includes("video") ||
            type.includes("mp4") ||
            /\.(mp4|mov|webm)(?:$|\?)/i.test(mediaUrl));
        const ext = isAudio ? "mp3" : isVideo ? "mp4" : "jpg";

        return {
          id: `${isAudio ? "audio" : isVideo ? "video" : "image"}-${index + 1}`,
          label: isAudio
            ? "Audio MP3"
            : isVideo
              ? rawItems.length > 1
                ? `Video ${index + 1}`
                : "Video Instagram"
              : rawItems.length > 1
                ? `Foto ${index + 1}`
                : "Foto Instagram",
          url: mediaUrl,
          ext,
          isAudio,
        };
      })
      .filter(Boolean) as DownloadResult["formats"];

    if (formats.length === 0) {
      throw new DownloaderError(
        payload?.message ||
          "Instagram tidak menghasilkan file yang bisa diunduh.",
        "not_found"
      );
    }

    return {
      platform,
      sourceUrl: url,
      title: payload?.data?.title || payload?.title,
      thumbnail: payload?.data?.thumbnail || payload?.thumbnail,
      author:
        payload?.data?.author?.username ||
        payload?.data?.username ||
        payload?.author?.username,
      formats,
      provider: this.name,
    };
  }

  private collectMediaItems(payload: any): any[] {
    const candidates = [
      payload?.data,
      payload?.result,
      payload?.results,
      payload?.data?.result,
      payload?.data?.results,
      payload?.data?.medias,
      payload?.data?.media,
      payload?.medias,
      payload?.media,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
      if (candidate && typeof candidate === "object") {
        if (this.pickUrl(candidate)) return [candidate];
      }
    }

    if (this.pickUrl(payload)) return [payload];
    return [];
  }

  private pickUrl(item: any): string | undefined {
    if (typeof item === "string" && /^https?:\/\//i.test(item)) return item;
    if (!item || typeof item !== "object") return undefined;

    const candidates = [
      item.url,
      item.downloadUrl,
      item.download_url,
      item.videoUrl,
      item.video_url,
      item.imageUrl,
      item.image_url,
      item.src,
    ];

    return candidates.find(
      (value): value is string =>
        typeof value === "string" && /^https?:\/\//i.test(value)
    );
  }
}
