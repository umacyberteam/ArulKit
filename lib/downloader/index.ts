import { detectPlatform } from "./detect-platform";
import { SocialKitProvider } from "./providers/socialkit";
import { TikwmProvider } from "./providers/tikwm";
import { DownloaderError, DownloadResult, Platform } from "./types";

const socialKit = new SocialKitProvider();
const tikwm = new TikwmProvider();

export { detectPlatform };
export type { Platform, DownloadResult };
export { DownloaderError };

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

  if (platform === "tiktok") return tikwm.resolve(rawUrl, platform);

  return socialKit.resolve(rawUrl, platform);
}
