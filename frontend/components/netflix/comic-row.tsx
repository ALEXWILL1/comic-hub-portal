"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Comic } from "@/lib/data";
import { ComicCard } from "./comic-card";

interface ComicRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  comics: Comic[];
  showRank?: boolean;
}

export const ComicRow: React.FC<ComicRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  comics,
  showRank = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!comics.length) return null;

  return (
    <section className="relative my-8 px-4 sm:px-8 group/row select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-violet-400" />}
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-none">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Scroll Nav Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll("left")}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
            aria-label="Scroll Kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
            aria-label="Scroll Kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={rowRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {comics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} showRank={showRank} />
        ))}
      </div>
    </section>
  );
};
