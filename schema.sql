-- 1229Novel Database Schema for Supabase
-- 在 Supabase 控制台 → SQL Editor → New Query → 粘贴运行

-- 1. Novels
CREATE TABLE novels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT DEFAULT '',
  description TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  word_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  volumes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Volumes
CREATE TABLE volumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INTEGER DEFAULT 0,
  chapter_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chapters
CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  volume_id TEXT DEFAULT '',
  volume_name TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  "order" INTEGER DEFAULT 0,
  outline_id TEXT DEFAULT '',
  generation_prompt TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Characters
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT DEFAULT '',
  age TEXT DEFAULT '',
  appearance TEXT DEFAULT '',
  personality TEXT DEFAULT '',
  background TEXT DEFAULT '',
  role TEXT DEFAULT 'other',
  traits TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'alive',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outlines
CREATE TABLE outlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  key_points TEXT[] DEFAULT ARRAY[]::TEXT[],
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (disabled for MVP - anon can access all)
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;

-- Allow anon full access (MVP only, add auth rules later)
CREATE POLICY "anon_all_novels" ON novels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_volumes" ON volumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_chapters" ON chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_characters" ON characters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_outlines" ON outlines FOR ALL USING (true) WITH CHECK (true);
