"use client";

import React, { useState, useEffect } from "react";
import { Link2, PlusCircle, Trash2, CheckCircle2, AlertCircle, Sparkles, Layers, RefreshCw, ShieldCheck, LogOut } from "lucide-react";
import { Comic } from "@/lib/data";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"url_scrape" | "manual_comic" | "manual_chapter" | "manage">("url_scrape");
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states for URL Scrape
  const [scrapeUrl, setScrapeUrl] = useState("");

  // Form states for Manual Comic
  const [comicTitle, setComicTitle] = useState("");
  const [comicCover, setComicCover] = useState("");
  const [comicBackdrop, setComicBackdrop] = useState("");
  const [comicDesc, setComicDesc] = useState("");
  const [comicType, setComicType] = useState<"Manhwa" | "Manga" | "Manhua">("Manhwa");
  const [comicGenres, setComicGenres] = useState("Action, Fantasy, System");

  // Form states for Manual Chapter
  const [selectedSlug, setSelectedSlug] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [pagesInput, setPagesInput] = useState("");

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/";
  };

  const fetchComics = async () => {
    try {
      const res = await fetch("/api/comics?sort=latest");
      const json = await res.json();
      if (json.success) {
        setComics(json.data);
        if (!selectedSlug && json.data.length > 0) {
          setSelectedSlug(json.data[0].slug);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const handleAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // 1. Submit Auto Import from URL
  const handleScrapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        handleAlert("success", data.message);
        setScrapeUrl("");
        fetchComics();
      } else {
        handleAlert("error", data.message || "Gagal mengimport URL.");
      }
    } catch (err) {
      handleAlert("error", "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Manual Comic
  const handleComicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comicTitle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: comicTitle,
          cover: comicCover,
          backdrop: comicBackdrop,
          description: comicDesc,
          type: comicType,
          genres: comicGenres.split(",").map((g) => g.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleAlert("success", data.message);
        setComicTitle("");
        setComicCover("");
        setComicBackdrop("");
        setComicDesc("");
        fetchComics();
      } else {
        handleAlert("error", data.message);
      }
    } catch (err) {
      handleAlert("error", "Terjadi kesalahan saat menyimpan komik.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Manual Chapter
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comics/add-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedSlug,
          title: chapterTitle || (chapterNumber ? `Chapter ${chapterNumber}` : undefined),
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleAlert("success", `Episode Baru (${data.data.title}) berhasil diterbitkan ke view user!`);
        setChapterTitle("");
        setChapterNumber("");
        fetchComics();
      } else {
        handleAlert("error", data.message);
      }
    } catch (err) {
      handleAlert("error", "Gagal merilis chapter.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Comic
  const handleDeleteComic = async (slug: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komik "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/comics?slug=${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        handleAlert("success", `Komik "${title}" berhasil dihapus.`);
        fetchComics();
      }
    } catch (err) {
      handleAlert("error", "Gagal menghapus komik.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto select-none">
      {/* Header Admin Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> DASHBOARD STAFF ADMIN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manajemen Komik & Release Engine
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Input komik baru atau rilis episode terbaru langsung dari web. Semua input akan muncul otomatis di tampilan user!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchComics}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data ({comics.length})
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 mb-6 rounded-2xl border flex items-center gap-3 text-sm font-semibold ${
            alert.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/50 text-rose-200"
          }`}
        >
          {alert.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab("url_scrape")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "url_scrape"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Link2 className="w-4 h-4" /> Import dari Link URL
        </button>
        <button
          onClick={() => setActiveTab("manual_comic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "manual_comic"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <PlusCircle className="w-4 h-4" /> Input Komik Manual
        </button>
        <button
          onClick={() => setActiveTab("manual_chapter")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "manual_chapter"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Rilis Episode / Chapter
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "manage"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Layers className="w-4 h-4" /> Kelola Semua Komik ({comics.length})
        </button>
      </div>

      {/* Tab 1: Auto Import by URL */}
      {activeTab === "url_scrape" && (
        <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xl max-w-2xl">
          <div className="flex items-center gap-3 text-violet-400 font-bold text-lg mb-2">
            <Link2 className="w-5 h-5" /> Import Komik / Chapter dari Link Web Target
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Cukup tempelkan link URL dari situs manhwa (misal <code>https://www.topmanhua.fan/manhua/solo-leveling/</code> atau <code>https://mymanhwalist.com/manhwa/magic-emperor</code>). Sistem akan otomatis membaca judul, cover, dan menerbitkan komik atau episode baru langsung ke tampilan web!
          </p>

          <form onSubmit={handleScrapeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">URL Target Webtoon / Manhwa</label>
              <input
                type="url"
                required
                placeholder="https://www.topmanhua.fan/manhua/magic-emperor/"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-600/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Meng-import & Menganalisis Link...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Import Sekarang ke View User</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Manual Comic Input */}
      {activeTab === "manual_comic" && (
        <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xl max-w-3xl">
          <h2 className="text-lg font-bold text-white mb-4">Input Informasi Komik Baru</h2>
          <form onSubmit={handleComicSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Judul Komik *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: The Legend of Northern Blade"
                  value={comicTitle}
                  onChange={(e) => setComicTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tipe Komik</label>
                <select
                  value={comicType}
                  onChange={(e) => setComicType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                >
                  <option value="Manhwa">Manhwa (Korea)</option>
                  <option value="Manga">Manga (Jepang)</option>
                  <option value="Manhua">Manhua (China)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">URL Gambar Poster (Cover)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={comicCover}
                  onChange={(e) => setComicCover(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">URL Gambar Backdrop Hero</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={comicBackdrop}
                  onChange={(e) => setComicBackdrop(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Genre (Pisahkan dengan koma)</label>
              <input
                type="text"
                placeholder="Action, Fantasy, System, Martial Arts"
                value={comicGenres}
                onChange={(e) => setComicGenres(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Sinopsis / Deskripsi</label>
              <textarea
                rows={3}
                placeholder="Tulis ringkasan cerita komik..."
                value={comicDesc}
                onChange={(e) => setComicDesc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-xl shadow-violet-600/30 disabled:opacity-50"
            >
              {loading ? "Menyimpan Komik..." : "Simpan & Rilis Komik Baru"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Manual Chapter Release */}
      {activeTab === "manual_chapter" && (
        <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xl max-w-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Rilis Episode / Chapter Baru</h2>
          <form onSubmit={handleChapterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Pilih Komik Target *</label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              >
                {comics.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title} (Ch. Terakhir: {c.chapters[0]?.chapterNumber || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nomor Chapter</label>
                <input
                  type="number"
                  placeholder="Contoh: 15"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Judul Chapter (Opsional)</label>
                <input
                  type="text"
                  placeholder="Kebangkitan Sang Raja"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-xl shadow-violet-600/30 disabled:opacity-50"
            >
              {loading ? "Memproses Rilis..." : "Rilis Episode ke View User"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Manage Comics */}
      {activeTab === "manage" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Daftar Komik Aktif ({comics.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Poster</th>
                  <th className="py-3 px-4">Judul Komik</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Total Chapter</th>
                  <th className="py-3 px-4">Terakhir Update</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs font-medium">
                {comics.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/50">
                    <td className="py-2.5 px-4">
                      <img src={c.cover} alt={c.title} className="w-10 h-14 object-cover rounded-md border border-zinc-800" />
                    </td>
                    <td className="py-2.5 px-4 text-white font-bold">{c.title}</td>
                    <td className="py-2.5 px-4 text-violet-400">{c.type}</td>
                    <td className="py-2.5 px-4 font-mono">{c.chapters.length} Episode</td>
                    <td className="py-2.5 px-4 text-zinc-400">{new Date(c.updatedAt).toLocaleDateString("id-ID")}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteComic(c.slug, c.title)}
                        className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:bg-rose-900/80 transition-colors"
                        title="Hapus Komik"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
