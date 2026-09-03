"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileIcon, ExternalLink, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/spinner";
import { formatBytes, cn } from "@/lib/utils";

type State =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "success"; url: string; fileName: string; size: number }
  | { status: "error"; message: string };

export function CatboxUploader() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setState({ status: "loading", fileName: file.name });

    const formData = new FormData();
    formData.set("file", file);

    try {
      const res = await fetch("/api/catbox", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error || "Upload gagal, coba lagi.",
        });
        return;
      }

      setState({
        status: "success",
        url: data.url,
        fileName: file.name,
        size: file.size,
      });
    } catch {
      setState({
        status: "error",
        message: "Tidak bisa terhubung ke server. Cek koneksi internet kamu.",
      });
    }
  }, []);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="mx-auto max-w-xl">
      {state.status !== "success" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => state.status !== "loading" && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
            state.status === "loading"
              ? "cursor-wait border-border bg-surface"
              : "cursor-pointer border-border bg-surface hover:border-brass/50",
            dragActive && "border-brass bg-brass/5"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={state.status === "loading"}
          />

          {state.status === "loading" ? (
            <>
              <Spinner className="h-7 w-7 text-brass" />
              <p className="text-sm text-fg/70">
                Mengupload <span className="font-mono">{state.fileName}</span>…
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-brass" />
              <p className="text-sm text-fg/70">
                <span className="text-brass">Klik untuk pilih file</span> atau
                seret & lepas di sini
              </p>
              <p className="text-xs text-fg/40">Maks. 200MB — sesuai batas Catbox</p>
            </>
          )}
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === "success" && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-bg text-signal">
              <FileIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{state.fileName}</p>
              <p className="text-xs text-fg/50">{formatBytes(state.size)}</p>
            </div>
            <button
              onClick={() => setState({ status: "idle" })}
              className="text-fg/40 hover:text-fg"
              aria-label="Upload file lain"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 truncate rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-sm text-fg/80">
            {state.url}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value={state.url} label="Copy URL" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(state.url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" /> Open URL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState({ status: "idle" })}
            >
              Upload file lain
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
