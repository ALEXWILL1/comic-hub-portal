"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List, Bookmark, ChevronUp, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { AdBanner } from "@/components/ui/ad-banner";

interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  releasedAt: string;
  pages: string[];
}

interface ComicData {
  id: string;
  title: string;
  slug: string;
  chapters: ChapterData[];
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
  const [pages, setPages] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<number[]>([]);
  const [comicTitle, setComicTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchChapterData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/comics/${slug}`);
        const json = await res.json();

        if (!json.success || !json.data) {
          setError("Komik tidak ditemukan.");
          setLoading(false);
          return;
        }

        const comic: ComicData = json.data;
        setComicTitle(comic.title);

        // Get all available chapter numbers sorted ascending
        const chapterNums = comic.chapters
          .map((ch) => ch.chapterNumber)
          .sort((a, b) => a - b);
        setAvailableChapters(chapterNums);

        // Find the current chapter data
        const chapter = comic.chapters.find(
          (ch) => ch.chapterNumber === currentChapter
        );

        if (chapter) {
          setChapterTitle(chapter.title);
          setPages(chapter.pages || []);
        } else {
          setError(`Chapter ${currentChapter} tidak ditemukan.`);
          setPages([]);
        }
      } catch (err) {
        console.error("Failed to fetch chapter data:", err);
        setError("Gagal memuat data chapter.");
      } finally {
        setLoading(false);
      }
    }

    fetchChapterData();

    // Save reading history
    const historyItem = { slug, chapter: currentChapter, timestamp: Date.now() };
    localStorage.setItem(`comic_history_${slug}`, JSON.stringify(historyItem));
  }, [slug, currentChapter]);

  // Find prev/next chapter
  const currentIdx = availableChapters.indexOf(currentChapter);
  const prevChapter = currentIdx > 0 ? availableChapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < availableChapters.length - 1 ? availableChapters[currentIdx + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="text-sm font-medium">Memuat Chapter {currentChapter}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="text-4xl mb-2">😵</div>
          <p className="text-lg font-semibold text-rose-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center select-none">
      {/* Top Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 origin-left z-50"
      />

      {/* Chapter Header */}
      <div className="w-full max-w-[800px] bg-zinc-950 border-b border-zinc-800 px-4 py-3 pt-20 sticky top-0 z-40">
        <p className="text-xs text-zinc-500 truncate">{comicTitle}</p>
        <p className="text-sm font-bold text-zinc-200 truncate">
          Chapter {currentChapter} {chapterTitle ? `— ${chapterTitle}` : ""}
        </p>
      </div>

      {/* Main Comic Viewer */}
      <main className="w-full max-w-[800px] flex flex-col items-center bg-zinc-950 min-h-screen shadow-2xl relative pb-28">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-3">
            <div className="text-5xl">📄</div>
            <p className="text-sm font-medium">Belum ada halaman untuk chapter ini.</p>
          </div>
        ) : (
          pages.map((pageUrl, idx) => (
            <React.Fragment key={`page-${idx}`}>
              <div className="w-full relative bg-zinc-900 overflow-hidden">
                <Image
                  src={pageUrl}
                  alt={`Page ${idx + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto object-cover block"
                  loading={idx < 3 ? "eager" : "lazy"}
                  priority={idx < 2}
                  unoptimized
                />
              </div>

              {/* In-feed Ad Banner setiap 6 panel */}
              {(idx + 1) % 6 === 0 && <AdBanner slotId={`ad-feed-${idx}`} />}
            </React.Fragment>
          ))
        )}

        {/* Next Chapter CTA at the bottom */}
        {nextChapter !== null && pages.length > 0 && (
          <div className="w-full px-6 py-8 flex flex-col items-center gap-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">Selesai membaca Chapter {currentChapter}</p>
            <button
              onClick={() => router.push(`/comic/${slug}/${nextChapter}`)}
              className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-violet-600/30"
            >
              <ChevronRight className="w-4 h-4" />
              Lanjut ke Chapter {nextChapter}
            </button>
          </div>
        )}

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
                disabled={prevChapter === null}
                onClick={() => prevChapter !== null && router.push(`/comic/${slug}/${prevChapter}`)}
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
                disabled={nextChapter === null}
                onClick={() => nextChapter !== null && router.push(`/comic/${slug}/${nextChapter}`)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
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
