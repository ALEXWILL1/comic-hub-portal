"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface AdBannerProps {
  slotId?: string;
  format?: "in-feed" | "sticky-bottom";
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotId = "ad-slot-1", format = "in-feed", className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  if (format === "sticky-bottom") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-2 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800"
        >
          <div className="relative w-full max-w-[728px] h-[90px] bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800/80 shadow-2xl overflow-hidden">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-1 right-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white p-1 rounded-full z-10 transition-colors"
              aria-label="Tutup Iklan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {!isLoaded ? (
              <div className="w-full h-full animate-pulse bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center text-xs text-zinc-500 font-mono">
                SPONSORED ADVERTISEMENT
              </div>
            ) : (
              <div className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Premium Partner Network</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className={`w-full my-8 flex justify-center px-4 ${className}`}>
      <div className="w-full max-w-[650px] aspect-[4/1] bg-zinc-900/60 rounded-xl border border-zinc-800/70 overflow-hidden relative shadow-inner">
        <span className="absolute top-1.5 left-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase z-10">
          Advertisement
        </span>
        {!isLoaded ? (
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-zinc-900 via-zinc-800/40 to-zinc-900 flex items-center justify-center">
            <span className="text-xs text-zinc-600 font-mono">LOADING AD...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-zinc-800/20 transition-colors"
          >
            <p className="text-sm font-semibold text-zinc-300">Temukan Game & Manga Terbaru 2026</p>
            <p className="text-xs text-violet-400 mt-1">Klik untuk klaim bonus pendaftaran gratis</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
