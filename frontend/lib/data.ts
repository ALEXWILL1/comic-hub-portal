import fs from "fs";
import path from "path";

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  releasedAt: string;
  pages: string[];
}

export interface Comic {
  id: string;
  title: string;
  slug: string;
  cover: string;
  backdrop: string;
  description: string;
  rating: number;
  genres: string[];
  status: "ongoing" | "completed";
  type: "Manhwa" | "Manga" | "Manhua";
  updatedAt: string;
  isTrending?: boolean;
  rank?: number;
  chapters: Chapter[];
}

export const INITIAL_COMICS: Comic[] = [
  {
    id: "solo-leveling-ragnarok",
    title: "Solo Leveling: Ragnarok",
    slug: "solo-leveling-ragnarok",
    cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
    description: "Bumi kembali terancam setelah gerbang dimensi baru terbuka. Sung Su-ho, putra tunggal Sung Jin-woo, membangkitkan kekuatan Monarch of Shadows!",
    rating: 4.9,
    genres: ["Action", "Fantasy", "System", "Supernatural"],
    status: "ongoing",
    type: "Manhwa",
    updatedAt: new Date().toISOString(),
    isTrending: true,
    rank: 1,
    chapters: [
      { id: "ch-14", chapterNumber: 14, title: "Pertarungan di Dungeon Bayangan", releasedAt: new Date().toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] },
      { id: "ch-13", chapterNumber: 13, title: "Kebangkitan Pasukan Bayangan", releasedAt: new Date(Date.now() - 86400000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] },
      { id: "ch-12", chapterNumber: 12, title: "Raid Rank S", releasedAt: new Date(Date.now() - 172800000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] },
    ]
  },
  {
    id: "orv",
    title: "Omniscient Reader's Viewpoint",
    slug: "orv",
    cover: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    description: "Kim Dokja adalah satu-satunya pembaca web novel yang bertahan sampai akhir. Tiba-tiba, dunia novel yang dia baca menjadi kenyataan!",
    rating: 4.9,
    genres: ["Action", "Apocalypse", "System", "Fantasy"],
    status: "ongoing",
    type: "Manhwa",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    isTrending: true,
    rank: 2,
    chapters: [
      { id: "ch-210", chapterNumber: 210, title: "Skenario Ke-73", releasedAt: new Date(Date.now() - 3600000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] },
      { id: "ch-209", chapterNumber: 209, title: "Raja Tanpa Tahta", releasedAt: new Date(Date.now() - 90000000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] }
    ]
  },
  {
    id: "tbate",
    title: "The Beginning After The End",
    slug: "tbate",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop",
    description: "Raja Grey terlahir kembali di dunia sihir sebagai Arthur Leywin. Bertekad melindung keluarga barunya dari ancaman kegelapan.",
    rating: 4.8,
    genres: ["Isekai", "Magic", "Adventure", "Action"],
    status: "ongoing",
    type: "Manhwa",
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    isTrending: true,
    rank: 3,
    chapters: [
      { id: "ch-185", chapterNumber: 185, title: "Pertempuran Xyrus Academy", releasedAt: new Date(Date.now() - 7200000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] },
      { id: "ch-184", chapterNumber: 184, title: "Kekuatan Mana Core Kuning", releasedAt: new Date(Date.now() - 95000000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] }
    ]
  },
  {
    id: "mount-hua",
    title: "Return of the Mount Hua Sect",
    slug: "mount-hua",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1600&auto=format&fit=crop",
    description: "Chung Myung, Pedang Suci Plum Blossom, terbangun 100 tahun di masa depan dan menemukan sekte Gunung Hua miliknya telah hancur!",
    rating: 4.9,
    genres: ["Martial Arts", "Comedy", "Reincarnation", "Action"],
    status: "ongoing",
    type: "Manhwa",
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    isTrending: true,
    rank: 4,
    chapters: [
      { id: "ch-130", chapterNumber: 130, title: "Pedang Suci Kembali", releasedAt: new Date(Date.now() - 14400000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] }
    ]
  },
  {
    id: "nano-machine",
    title: "Nano Machine",
    slug: "nano-machine",
    cover: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
    description: "Pangeran Sekte Iblis yang terbuang disuntik dengan Nano Machine ciptaan masa depan. Perjalanannya menjadi Dewa Iblis pun dimulai!",
    rating: 4.8,
    genres: ["Martial Arts", "Sci-Fi", "Action", "Cultivation"],
    status: "ongoing",
    type: "Manhwa",
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    isTrending: true,
    rank: 5,
    chapters: [
      { id: "ch-215", chapterNumber: 215, title: "Operasi Otomatis Nano", releasedAt: new Date(Date.now() - 28800000).toISOString(), pages: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"] }
    ]
  }
];

const FILE_PATH = path.join(process.cwd(), "data-store.json");

function loadStore(): Comic[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const db = fs.readFileSync(FILE_PATH, "utf-8");
      return JSON.parse(db);
    }
  } catch (e) {
    console.error("Gagal load db", e);
  }
  return INITIAL_COMICS;
}

function saveStore(data: Comic[]) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Gagal save db", e);
  }
}

export function getComicsStore(): Comic[] {
  return loadStore();
}

export function createComic(newComicData: Omit<Comic, "id" | "updatedAt" | "chapters"> & { initialChapterTitle?: string; initialPages?: string[] }): Comic {
  const slug = newComicData.slug || newComicData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const id = slug;

  const initialChapter: Chapter = {
    id: "ch-1",
    chapterNumber: 1,
    title: newComicData.initialChapterTitle || "Chapter 1 [RILIS PERTAMA]",
    releasedAt: new Date().toISOString(),
    pages: newComicData.initialPages && newComicData.initialPages.length > 0 ? newComicData.initialPages : [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const store = loadStore();
  const created: Comic = {
    id,
    title: newComicData.title,
    slug,
    cover: newComicData.cover || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop",
    backdrop: newComicData.backdrop || newComicData.cover || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
    description: newComicData.description || "Komik komplit terjemahan bahasa Indonesia terbaru.",
    rating: newComicData.rating || 4.8,
    genres: newComicData.genres || ["Action", "Fantasy"],
    status: newComicData.status || "ongoing",
    type: newComicData.type || "Manhwa",
    updatedAt: new Date().toISOString(),
    chapters: [initialChapter]
  };

  saveStore([created, ...store.filter(c => c.slug !== slug)]);
  return created;
}

export function addChapterToComic(comicSlug: string, chapterTitle?: string, customNumber?: number, customPages?: string[]): Comic | null {
  const store = loadStore();
  const index = store.findIndex((c) => c.slug === comicSlug);
  if (index === -1) return null;

  const comic = store[index];
  const nextChapterNumber = customNumber || ((comic.chapters[0]?.chapterNumber || 0) + 1);
  const newChapter: Chapter = {
    id: `ch-${nextChapterNumber}`,
    chapterNumber: nextChapterNumber,
    title: chapterTitle || `Chapter ${nextChapterNumber} [BARU RILIS]`,
    releasedAt: new Date().toISOString(),
    pages: customPages && customPages.length > 0 ? customPages : [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const updatedComic: Comic = {
    ...comic,
    updatedAt: new Date().toISOString(),
    chapters: [newChapter, ...comic.chapters]
  };

  saveStore([updatedComic, ...store.filter((c) => c.slug !== comicSlug)]);
  return updatedComic;
}

export function deleteComic(comicSlug: string): boolean {
  const store = loadStore();
  const len = store.length;
  const filtered = store.filter((c) => c.slug !== comicSlug);
  saveStore(filtered);
  return filtered.length < len;
}
