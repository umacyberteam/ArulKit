"use client";

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { Globe, Download, AlertCircle, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/spinner";
import { isValidHttpUrl, formatBytes } from "@/lib/utils";

// react-syntax-highlighter pulls in a large highlighting engine — load it
// only on the client, only once a result actually needs rendering.
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((m) => m.Prism),
  { ssr: false, loading: () => <SourceSkeleton /> }
);

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; html: string; finalUrl: string }
  | { status: "error"; message: string };

export function ViewSourceViewer() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const [style, setStyle] = useState<any>(null);

  useEffect(() => {
    import("react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus").then(
      (m) => setStyle(m.default)
    );
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidHttpUrl(url)) {
      setState({ status: "error", message: "Masukkan URL yang valid (http/https)." });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/view-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: data.error || "Gagal mengambil source." });
        return;
      }

      setState({ status: "success", html: data.html, finalUrl: data.finalUrl });
    } catch {
      setState({
        status: "error",
        message: "Tidak bisa terhubung ke server. Cek koneksi internet kamu.",
      });
    }
  }

  function handleDownload() {
    if (state.status !== "success") return;
    const blob = new Blob([state.html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const hostname = safeHostname(state.finalUrl);
    link.download = `${hostname || "source"}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/40" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://contoh.com"
            className="h-12 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-fg/40 focus:border-brass/60"
          />
        </div>
        <Button type="submit" size="lg" disabled={state.status === "loading"}>
          {state.status === "loading" ? <Spinner /> : <><Code2 className="h-4 w-4" /> Lihat source</>}
        </Button>
      </form>

      {state.status === "error" && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === "loading" && <SourceSkeleton />}

      {state.status === "success" && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <span className="truncate font-mono text-xs text-fg/50">
              {state.finalUrl} · {formatBytes(new Blob([state.html]).size)}
            </span>
            <div className="flex gap-2">
              <CopyButton value={state.html} label="Copy Source" />
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download HTML
              </Button>
            </div>
          </div>
          <div className="code-scroll max-h-[65vh] overflow-auto">
            {style && (
              <SyntaxHighlighter
                language="markup"
                style={style}
                customStyle={{
                  margin: 0,
                  padding: "1.25rem",
                  background: "transparent",
                  fontSize: "0.8125rem",
                }}
                wrapLongLines
              >
                {state.html}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceSkeleton() {
  return (
    <div className="mt-6 space-y-2 rounded-lg border border-border bg-surface p-5">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-border"
          style={{ width: `${40 + ((i * 13) % 50)}%` }}
        />
      ))}
    </div>
  );
}

function safeHostname(u: string) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}
