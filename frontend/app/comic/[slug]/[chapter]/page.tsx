"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List, Bookmark, ChevronUp, Check } from "lucide-react";
import Image from "next/image";
import { AdBanner } from "@/components/ui/ad-banner";

interface PageData {
  id: string;
  page_number: number;
  image_url: string;
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const currentChapter = parseFloat(params?.chapter as string) || 1;

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [isDockOpen, setIsDockOpen] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [availableChapters] = useState<number[]>([1, 2, 3, 4, 5, 14]);

  useEffect(() => {
    const historyItem = { slug, chapter: currentChapter, timestamp: Date.now() };
    localStorage.setItem(`comic_history_${slug}`, JSON.stringify(historyItem));
    
    // Sample mock pages
    const mockPages: PageData[] = Array.from({ length: 15 }, (_, i) => ({
      id: `p-${i + 1}`,
      page_number: i + 1,
      image_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop`
    }));
    setPages(mockPages);
  }, [slug, currentChapter]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center select-none">
      {/* Top Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 origin-left z-50"
      />

      {/* Main Comic Viewer */}
      <main className="w-full max-w-[800px] flex flex-col items-center bg-zinc-950 min-h-screen shadow-2xl relative pb-28">
        {pages.map((page, idx) => (
          <React.Fragment key={page.id}>
            <div className="w-full relative bg-zinc-900 overflow-hidden">
              <Image
                src={page.image_url}
                alt={`Page ${page.page_number}`}
                width={800}
                height={1200}
                className="w-full h-auto object-cover block"
                loading={idx < 3 ? "eager" : "lazy"}
                priority={idx < 2}
              />
            </div>

            {/* In-feed Ad Banner setiap 6 panel */}
            {(idx + 1) % 6 === 0 && <AdBanner slotId={`ad-feed-${idx}`} />}
          </React.Fragment>
        ))}

        {/* Sticky Mobile Banner */}
        <AdBanner format="sticky-bottom" />
      </main>

      {/* Floating Collapsible Control Dock */}
      <div className="fixed bottom-6 z-50 flex flex-col items-center">
        <AnimatePresence>
          {isDockOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/80 px-4 py-2.5 rounded-full flex items-center gap-3 shadow-2xl shadow-violet-950/30 mb-2"
            >
              <button
                disabled={currentChapter <= 1}
                onClick={() => router.push(`/comic/${slug}/${currentChapter - 1}`)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Chapter Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/90 rounded-full border border-zinc-800 text-xs font-semibold text-zinc-300">
                <List className="w-3.5 h-3.5 text-violet-400" />
                <select
                  value={currentChapter}
                  onChange={(e) => router.push(`/comic/${slug}/${e.target.value}`)}
                  className="bg-transparent border-none text-zinc-200 outline-none cursor-pointer"
                >
                  {availableChapters.map((num) => (
                    <option key={num} value={num} className="bg-zinc-900 text-white">
                      Chapter {num}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => router.push(`/comic/${slug}/${currentChapter + 1}`)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
                title="Chapter Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked ? "text-violet-400 bg-violet-950/40" : "text-zinc-400 hover:bg-zinc-800"
                }`}
                title="Bookmark Chapter Ini"
              >
                {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsDockOpen(!isDockOpen)}
          className="bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 p-1.5 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-90"
        >
          <motion.div animate={{ rotate: isDockOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronUp className="w-4 h-4" />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
