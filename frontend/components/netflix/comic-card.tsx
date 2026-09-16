"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Star, Sparkles } from "lucide-react";
import { Comic } from "@/lib/data";

interface ComicCardProps {
  comic: Comic;
  showRank?: boolean;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, showRank = false }) => {
  const latestChapter = comic.chapters[0];
  const isRecentlyUpdated =
    new Date().getTime() - new Date(comic.updatedAt).getTime() < 86400000; // Updated in last 24 hours

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex-none w-[150px] sm:w-[180px] md:w-[210px] select-none"
    >
      <Link href={`/comic/${comic.slug}/1`} className="block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-md group-hover:border-violet-500/50 group-hover:shadow-2xl group-hover:shadow-violet-950/40 transition-all">
          {/* Cover Image */}
          <img
            src={comic.cover}
            alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            {isRecentlyUpdated ? (
              <span className="px-2 py-0.5 rounded bg-violet-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-violet-600/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> BARU
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-zinc-300 text-[10px] font-semibold">
                {comic.type}
              </span>
            )}

            <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              {comic.rating}
            </span>
          </div>

          {/* Rank Badge for Netflix Top 10 */}
          {showRank && comic.rank && (
            <div className="absolute top-0 left-0 bg-gradient-to-br from-violet-600 to-indigo-700 text-white text-lg font-black px-2.5 py-1 rounded-br-xl shadow-lg border-r border-b border-violet-400/30">
              #{comic.rank}
            </div>
          )}

          {/* Bottom Card Overlay Info */}
          <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end">
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
              {comic.title}
            </h3>

            <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-800/60 text-[11px] text-zinc-400">
              <span className="font-mono text-violet-400">
                Ch. {latestChapter?.chapterNumber || 1}
              </span>
              <span className="text-[10px] text-zinc-500 capitalize">{comic.status}</span>
            </div>
          </div>

          {/* Quick Play Hover Button */}
          <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/50 transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
