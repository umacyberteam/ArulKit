import { detectPlatform } from "./detect-platform";
import { CobaltProvider } from "./providers/cobalt";
import { TikwmProvider } from "./providers/tikwm";
import { DownloaderError, DownloadResult, Platform } from "./types";

const cobalt = new CobaltProvider();
const tikwm = new TikwmProvider();

export { detectPlatform };
export type { Platform, DownloadResult };
export { DownloaderError };

/**
 * Resolves a URL to downloadable media, auto-detecting the platform and
 * routing to the best available provider:
 *  - youtube / instagram  -> cobalt (requires COBALT_API_URL)
 *  - tiktok                -> cobalt if configured, else tikwm (no config needed)
 */
export async function resolveDownload(rawUrl: string): Promise<DownloadResult> {
  let platform: Platform;
  try {
    new URL(rawUrl);
    platform = detectPlatform(rawUrl);
  } catch {
    throw new DownloaderError("URL tidak valid.", "invalid_url");
  }

  if (platform === "unknown") {
    throw new DownloaderError(
      "Link tidak dikenali. ArulKit hanya mendukung YouTube, Instagram, dan TikTok.",
      "unsupported"
    );
  }

  if (platform === "tiktok") {
    if (cobalt.isConfigured()) return cobalt.resolve(rawUrl, platform);
    return tikwm.resolve(rawUrl, platform);
  }

  // youtube / instagram
  return cobalt.resolve(rawUrl, platform);
}
