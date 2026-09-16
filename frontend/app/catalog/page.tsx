"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ComicCard } from "@/components/netflix/comic-card";
import { Comic } from "@/lib/data";
import { Search, Filter, Compass } from "lucide-react";

const GENRES = ["all", "Action", "Fantasy", "System", "Supernatural", "Isekai", "Martial Arts", "Reincarnation", "Comedy"];
const TYPES = ["all", "manhwa", "manga", "manhua"];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [comics, setComics] = useState<Comic[]>([]);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"latest" | "rating">("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedType !== "all") query.set("type", selectedType);
        if (selectedGenre !== "all") query.set("genre", selectedGenre);
        if (searchQuery) query.set("search", searchQuery);
        query.set("sort", sortBy);

        const res = await fetch(`/api/comics?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setComics(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [selectedType, selectedGenre, searchQuery, sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Title */}
      <div className="flex items-center gap-2.5 mb-6">
        <Compass className="w-6 h-6 text-violet-400" />
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Eksplor Katalog Komik</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-8 space-y-4 shadow-xl">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari judul komik atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto justify-center">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  selectedType === t ? "bg-violet-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5" />
            <span>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "rating")}
              className="bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs outline-none"
            >
              <option value="latest">Terbaru Rilis</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
          <span className="text-xs font-semibold text-zinc-400 mr-2">Genre:</span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedGenre === g
                  ? "bg-violet-600/30 border border-violet-500 text-violet-300 font-semibold"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
              }`}
            >
              {g === "all" ? "Semua Genre" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comics.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 font-mono text-sm">
          Tidak ada komik yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {comics.map((comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-zinc-500 p-24 text-center">Loading...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
