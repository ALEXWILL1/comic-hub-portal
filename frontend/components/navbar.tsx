"use client";

import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { BookOpen, Compass, Search, Bookmark, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

export const SmartNavbar = () => {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3 sm:p-4 pointer-events-none"
    >
      <nav className="pointer-events-auto bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/80 px-4 sm:px-6 py-2.5 rounded-full flex items-center justify-between gap-4 sm:gap-8 shadow-2xl shadow-violet-950/20 max-w-5xl w-full">
        <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg">
            NEO<span className="text-violet-400 font-black">FLIX</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
          <Link href="/" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-violet-400" /> Beranda
          </Link>
          <Link href="/catalog?type=manhwa" className="hover:text-violet-400 transition-colors">
            Manhwa
          </Link>
          <Link href="/catalog?type=manga" className="hover:text-violet-400 transition-colors">
            Manga
          </Link>
          <Link href="/catalog?type=manhua" className="hover:text-violet-400 transition-colors">
            Manhua
          </Link>
          <Link href="/catalog" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Genre Catalog
          </Link>
        </div>

        {/* Search Bar & Bookmarks & Admin */}
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Cari komik / manhwa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-zinc-900 text-xs text-white px-3 py-1.5 rounded-full border border-zinc-700 outline-none w-36 sm:w-48 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="ml-1 text-zinc-400 hover:text-white text-xs px-1.5"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="Cari Komik"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/catalog"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Daftar Komk"
          >
            <Bookmark className="w-4 h-4" />
          </Link>


        </div>
      </nav>
    </motion.header>
  );
};
