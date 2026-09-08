"use client";

import { useState, type FormEvent } from "react";
import { ExternalLink, Search, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Anime = {
  title: string;
  url: string;
  thumbnail: string;
  genres: string;
  status: string;
  rating: string;
};

export function AnimeSearcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) {
      setError("Masukkan judul anime yang ingin dicari.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/anime/search?${new URLSearchParams({ s: value })}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setResults([]);
        setError(data.error || "Gagal mencari anime.");
        return;
      }
      setResults(data.results || []);
      if (!data.results?.length) setError("Anime tidak ditemukan.");
    } catch {
      setResults([]);
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul anime…"
            className="h-12 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-fg/40 focus:border-brass/60"
          />
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <Spinner /> : <><Search className="h-4 w-4" /> Cari</>}
        </Button>
      </form>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {results.map((anime) => (
            <article key={anime.url} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex gap-4 p-4">
                {anime.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={anime.thumbnail} alt="" className="h-28 w-20 shrink-0 rounded-md border border-border object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-base font-semibold leading-snug">{anime.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-fg/50">
                    {anime.status && <span>{anime.status}</span>}
                    {anime.rating && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {anime.rating}</span>}
                  </div>
                  {anime.genres && <p className="mt-2 text-xs leading-relaxed text-fg/50">{anime.genres}</p>}
                </div>
              </div>
              <div className="border-t border-border p-3">
                <a href={anime.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-brass transition-colors hover:border-brass/60">
                  Lihat Anime <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
