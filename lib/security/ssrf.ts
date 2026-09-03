import dns from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

/**
 * Returns true if the given IP address falls in a private, loopback,
 * link-local, multicast, or otherwise non-public range (IPv4 + IPv6),
 * including the common cloud metadata endpoint 169.254.169.254.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const type = net.isIP(ip);
  if (type === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === undefined || b === undefined || parts.some((n) => Number.isNaN(n))) {
      return true;
    }
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 0) return true; // "this" network
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
    if (a === 192 && b === 0) return true; // IETF protocol assignments
    if (a >= 224) return true; // multicast + reserved (224-255)
    return false;
  }
  if (type === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower === "::") return true; // unspecified
    if (lower.startsWith("fe80:")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    if (lower.startsWith("::ffff:")) {
      // IPv4-mapped IPv6 — validate the embedded IPv4 address too.
      const mapped = lower.split(":").pop() ?? "";
      if (net.isIP(mapped) === 4) return isPrivateOrReservedIp(mapped);
    }
    return false;
  }
  // Not a valid IP at all — treat as unsafe.
  return true;
}

export interface UrlValidationResult {
  ok: boolean;
  reason?: string;
  parsed?: URL;
  resolvedIps?: string[];
}

/**
 * Validates a user-supplied URL before the server fetches it:
 *  - only http/https
 *  - no credentials embedded in the URL
 *  - hostname must not be a blocklisted internal name
 *  - every DNS-resolved IP must be public (blocks DNS-rebinding to internal IPs)
 */
export async function validateExternalUrl(
  input: string
): Promise<UrlValidationResult> {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, reason: "URL tidak valid." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: "Hanya URL http:// atau https:// yang didukung." };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: "URL dengan kredensial tidak diizinkan." };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, reason: "Host ini tidak diizinkan." };
  }

  // If the hostname is already a literal IP, validate it directly.
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return { ok: false, reason: "Alamat IP privat/internal tidak diizinkan." };
    }
    return { ok: true, parsed, resolvedIps: [hostname] };
  }

  let addresses: string[];
  try {
    const results = await dns.lookup(hostname, { all: true, verbatim: false });
    addresses = results.map((r) => r.address);
  } catch {
    return { ok: false, reason: "Gagal me-resolve domain ini." };
  }

  if (addresses.length === 0) {
    return { ok: false, reason: "Domain tidak memiliki alamat IP." };
  }

  const bad = addresses.filter(isPrivateOrReservedIp);
  if (bad.length > 0) {
    return {
      ok: false,
      reason: "Domain ini mengarah ke alamat IP internal/privat.",
    };
  }

  return { ok: true, parsed, resolvedIps: addresses };
}
