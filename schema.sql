-- Database Schema for Automated Comic Platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Status Komik
DO $$ BEGIN
    CREATE TYPE comic_status AS ENUM ('ongoing', 'completed', 'hiatus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. TABEL COMICS
CREATE TABLE IF NOT EXISTS comics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    cover_url TEXT NOT NULL,
    description TEXT,
    status comic_status DEFAULT 'ongoing',
    author VARCHAR(150),
    genres TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL CHAPTERS
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comic_id UUID NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
    chapter_number NUMERIC(6, 2) NOT NULL,
    title VARCHAR(255),
    source_url TEXT,
    release_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_comic_chapter UNIQUE (comic_id, chapter_number)
);

-- 3. TABEL PAGES
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    image_url TEXT NOT NULL,
    width INT,
    height INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_chapter_page UNIQUE (chapter_id, page_number)
);

-- 4. B-TREE INDEXING UNTUK QUERY CEPAT
CREATE INDEX IF NOT EXISTS idx_comics_slug ON comics USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_chapters_comic_chapter ON chapters USING btree (comic_id, chapter_number DESC);
CREATE INDEX IF NOT EXISTS idx_pages_chapter_page ON pages USING btree (chapter_id, page_number ASC);

-- 5. TRIGGER AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comics_updated_at ON comics;
CREATE TRIGGER trg_comics_updated_at
BEFORE UPDATE ON comics
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_chapters_updated_at ON chapters;
CREATE TRIGGER trg_chapters_updated_at
BEFORE UPDATE ON chapters
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
