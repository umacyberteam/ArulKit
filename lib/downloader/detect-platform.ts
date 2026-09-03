import { Platform } from "./types";

const PATTERNS: { platform: Platform; test: RegExp }[] = [
  {
    platform: "youtube",
    test: /(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)music\.youtube\.com$/i,
  },
  { platform: "instagram", test: /(^|\.)instagram\.com$/i },
  {
    platform: "tiktok",
    test: /(^|\.)tiktok\.com$|(^|\.)vm\.tiktok\.com$|(^|\.)vt\.tiktok\.com$/i,
  },
];

export function detectPlatform(rawUrl: string): Platform {
  let hostname: string;
  try {
    hostname = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return "unknown";
  }

  for (const { platform, test } of PATTERNS) {
    if (test.test(hostname)) return platform;
  }
  return "unknown";
}
