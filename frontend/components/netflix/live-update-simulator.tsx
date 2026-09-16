"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { Comic } from "@/lib/data";

interface LiveUpdateSimulatorProps {
  comics: Comic[];
  onChapterAdded: () => void;
}

export const LiveUpdateSimulator: React.FC<LiveUpdateSimulatorProps> = ({ comics, onChapterAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(comics[0]?.slug || "solo-leveling-ragnarok");
  const [customTitle, setCustomTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/comics/add-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedSlug, title: customTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`⚡ Episode Baru Terbi! (${data.data.title})`);
        onChapterAdded();
        setCustomTitle("");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toast Notification when a new chapter is released live */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-violet-600/40 border border-violet-400/30 flex items-center gap-3 font-semibold text-sm"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-2xl shadow-violet-600/40 border border-violet-400/30 transition-transform active:scale-95"
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>SIMULATOR EPISODE BARU</span>
        </button>
      </div>

      {/* Simulator Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900 border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 text-violet-400 font-bold text-lg mb-1">
                <Zap className="w-5 h-5 fill-violet-400" />
                <span>Rilis Episode Baru (Live)</span>
              </div>
              <p className="text-zinc-400 text-xs mb-5">
                Simulasikan rilis chapter baru. Komik akan otomatis berpindah ke urutan paling atas di feed secara real-time!
              </p>

              <form onSubmit={handleSimulate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Pilih Komik Target</label>
                  <select
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                  >
                    {comics.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.title} (Ch. {c.chapters[0]?.chapterNumber || 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Judul Chapter (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kebangkitan Sang Raja Bayangan [BARU RILIS]"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memproses Rilis...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Rilis Sekarang & Update Feed</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
