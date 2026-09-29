"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Star, Sparkles, BookOpen, Clock, Layers } from "lucide-react";
import { Comic } from "@/lib/data";

export default function ComicDetailPage() {
  const params = useParams ? useParams() : null;
  const router = useRouter ? useRouter() : null;
  const slug = params?.slug as string;

  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    async function fetchComic() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/comics/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setComic(json.data);
        } else {
          setError("Komik tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat detail komik.");
      } finally {
        setLoading(false);
      }
    }
    fetchComic();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 px-4">
        <p className="text-xl font-bold text-rose-400 mb-4">{error || "Komik tidak ditemukan."}</p>
        <Link href="/" className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const latestChapter = comic.chapters[0];
  const firstChapter = comic.chapters[comic.chapters.length - 1] || latestChapter;

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20 select-none">
      {/* Backdrop Header */}
      <div className="relative w-full h-[50vh] min-h-[360px] bg-zinc-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: `url(${comic.backdrop || comic.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-20 left-4 sm:left-8 z-30">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-semibold backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </div>

      {/* Main Info Box */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Cover */}
          <div className="w-44 sm:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-800 shadow-2xl shadow-violet-950/40">
            <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-xs font-bold uppercase tracking-wider">
                {comic.type}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {comic.rating}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold capitalize">
                {comic.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {comic.title}
            </h1>

            <div className="flex flex-wrap gap-2">
              {comic.genres.map((g) => (
                <span key={g} className="text-xs text-zinc-300 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                  {g}
                </span>
              ))}
            </div>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
              {comic.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {firstChapter && (
                <Link
                  href={`/comic/${comic.slug}/${firstChapter.chapterNumber}`}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold flex items-center gap-2 shadow-xl shadow-violet-600/30 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Mulai Baca Ch. {firstChapter.chapterNumber}
                </Link>
              )}
              {latestChapter && latestChapter.chapterNumber !== firstChapter?.chapterNumber && (
                <Link
                  href={`/comic/${comic.slug}/${latestChapter.chapterNumber}`}
                  className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Chapter Terbaru (Ch. {latestChapter.chapterNumber})
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="mt-12 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5 text-lg font-bold text-white">
              <Layers className="w-5 h-5 text-violet-400" />
              <span>Daftar Chapter ({comic.chapters.length})</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Update Terakhir: {new Date(comic.updatedAt).toLocaleDateString("id-ID")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {comic.chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/comic/${comic.slug}/${ch.chapterNumber}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-violet-500/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs font-bold">
                    {ch.chapterNumber}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-violet-300 transition-colors">
                      {ch.title || `Chapter ${ch.chapterNumber}`}
                    </p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(ch.releasedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-violet-600/10 group-hover:bg-violet-600 text-violet-400 group-hover:text-white text-xs font-bold transition-all flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Baca
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
