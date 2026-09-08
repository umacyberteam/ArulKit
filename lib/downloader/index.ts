import { detectPlatform } from "./detect-platform";
import { TikwmProvider } from "./providers/tikwm";
import { SiputzxProvider } from "./providers/siputzx";
import { DownloaderError, DownloadResult, Platform } from "./types";

const tikwm = new TikwmProvider();
const siputzx = new SiputzxProvider();

export { detectPlatform };
export type { Platform, DownloadResult };
export { DownloaderError };

export async function resolveDownload(rawUrl: string): Promise<DownloadResult> {
  let platform: Platform;
  try {
    const parsed = new URL(rawUrl);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("protocol");
    platform = detectPlatform(rawUrl);
  } catch {
    throw new DownloaderError("URL tidak valid.", "invalid_url");
  }

  if (platform === "unknown") {
    throw new DownloaderError(
      "Link tidak dikenali. ArulKit hanya mendukung Instagram dan TikTok.",
      "unsupported"
    );
  }

  if (platform === "tiktok") return tikwm.resolve(rawUrl, platform);
  return siputzx.resolve(rawUrl, platform);
}
