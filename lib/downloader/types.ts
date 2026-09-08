export type Platform = "instagram" | "tiktok" | "unknown";

export interface DownloadFormatOption {
  id: string;
  label: string;
  url: string;
  ext: string;
  isAudio: boolean;
}

export interface DownloadResult {
  platform: Platform;
  sourceUrl: string;
  title?: string;
  thumbnail?: string;
  author?: string;
  formats: DownloadFormatOption[];
  provider: string;
}

export class DownloaderError extends Error {
  code:
    | "unsupported"
    | "not_configured"
    | "invalid_url"
    | "upstream_error"
    | "not_found"
    | "timeout";
  constructor(message: string, code: DownloaderError["code"]) {
    super(message);
    this.code = code;
    this.name = "DownloaderError";
  }
}

export interface DownloaderProvider {
  name: string;
  supports: Platform[];
  isConfigured(): boolean;
  resolve(url: string, platform: Platform): Promise<DownloadResult>;
}
