"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeroSpotlight } from "@/components/netflix/hero-spotlight";
import { ComicRow } from "@/components/netflix/comic-row";
import { LiveUpdateSimulator } from "@/components/netflix/live-update-simulator";
import { Comic } from "@/lib/data";
import { Flame, Zap, Swords, Compass, BookOpen } from "lucide-react";

export default function Home() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComics = useCallback(async () => {
    try {
      const res = await fetch("/api/comics?sort=latest");
      const json = await res.json();
      if (json.success) {
        setComics(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch comics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-polling every 6 seconds for real-time chapter releases
  useEffect(() => {
    fetchComics();
    const interval = setInterval(fetchComics, 6000);
    return () => clearInterval(interval);
  }, [fetchComics]);

  if (loading && !comics.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat Platform NeoComic Netflix-Style...</span>
        </div>
      </div>
    );
  }

  // Filter category lists
  const trendingComics = [...comics].sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const recentlyUpdated = [...comics].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const actionFantasy = comics.filter(
    (c) => c.genres.includes("Action") || c.genres.includes("Fantasy")
  );
  const manhwaOnly = comics.filter((c) => c.type === "Manhwa");
  const manhuaOnly = comics.filter((c) => c.type === "Manhua" || c.type === "Manga");

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-24 overflow-x-hidden">
      {/* 1. Hero Spotlight Slideshow */}
      <HeroSpotlight comics={comics} />

      {/* 2. Netflix Rows Section */}
      <div className="relative z-30 -mt-10 sm:-mt-16 space-y-4">
        {/* Row 1: Top 10 Trending */}
        <ComicRow
          title="Top 10 Komik Paling Hits"
          subtitle="Judul manhwa & manga terpopuler yang paling banyak dibaca"
          icon={Flame}
          comics={trendingComics}
          showRank={true}
        />

        {/* Row 2: Live Auto-Updated Chapters */}
        <ComicRow
          title="Episode & Chapter Baru Diupdate"
          subtitle="Otomatis diperbarui secara real-time setiap ada chapter baru"
          icon={Zap}
          comics={recentlyUpdated}
        />

        {/* Row 3: Action & Fantasy */}
        <ComicRow
          title="Petualangan Action & Fantasy Terbaik"
          subtitle="Pertarungan epik, sistem level up, dan dungeon rilis harian"
          icon={Swords}
          comics={actionFantasy}
        />

        {/* Row 4: Trending Manhwa */}
        <ComicRow
          title="Rekomendasi Manhwa Korea"
          subtitle="Koleksi webtoon Korea kualitas terbaik terjemahan bahasa Indonesia"
          icon={Compass}
          comics={manhwaOnly}
        />

        {/* Row 5: Manhua & Manga */}
        <ComicRow
          title="Manga & Manhua Pilihan"
          subtitle="Manhua Cultivation & Manga populer tanah air"
          icon={BookOpen}
          comics={manhuaOnly}
        />
      </div>

      {/* 3. Live Simulator Floating Widget */}
      <LiveUpdateSimulator comics={comics} onChapterAdded={fetchComics} />
    </div>
  );
}
