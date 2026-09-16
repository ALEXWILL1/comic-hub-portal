"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, Plus, Check, Star, Sparkles, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Comic } from "@/lib/data";

interface HeroSpotlightProps {
  comics: Comic[];
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ comics }) => {
  const featured = comics.slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return null;

  const current = featured[currentIndex];
  const latestChapter = current.chapters[0];

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[750px] bg-zinc-950 overflow-hidden select-none">
      {/* Background Slideshow Image with Vignette & Gradient Overlays */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${current.backdrop})` }}
        >
          {/* Netflix Gradients: Dark Bottom & Left Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4 h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            {/* Type & Rating Badges */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-violet-600/30">
                {current.type}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-amber-400 text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                {current.rating}
              </span>
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-400" /> Ch. {latestChapter?.chapterNumber || 1} Terbaru
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              {current.title}
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 my-3">
              {current.genres.map((g) => (
                <span key={g} className="text-xs text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                  {g}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-xs sm:text-sm line-clamp-3 leading-relaxed max-w-xl text-shadow">
              {current.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <Link
                href={`/comic/${current.slug}/${latestChapter?.chapterNumber || 1}`}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-violet-600/30 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Baca Ch. {latestChapter?.chapterNumber}</span>
              </Link>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 transition-all active:scale-95"
                title="Simpan ke Daftar"
              >
                {isBookmarked ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              </button>

              <Link
                href={`/comic/${current.slug}/1`}
                className="px-4 py-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Info className="w-4 h-4" /> Info Detail
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slideshow Controllers / Indicators */}
        <div className="absolute right-4 sm:right-8 bottom-12 flex items-center gap-2 z-30">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1))}
            className="p-2 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            {featured.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-violet-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featured.length)}
            className="p-2 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
