-- ============================================
-- 灵境 MVP 数据库建表语句 (Supabase PostgreSQL)
-- 在 Supabase SQL Editor 中执行全部语句
-- ============================================

-- 1. 开启 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 用户扩展资料表
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 灵感表
CREATE TABLE inspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'voice', 'image')),
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspirations_user_id ON inspirations(user_id);
CREATE INDEX idx_inspirations_tags ON inspirations USING GIN(tags);
CREATE INDEX idx_inspirations_public ON inspirations(is_public, created_at DESC);
CREATE INDEX idx_inspirations_created ON inspirations(user_id, created_at DESC);

-- 4. 灵感嵌入向量表 (语义搜索)
CREATE TABLE inspiration_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspiration_id UUID NOT NULL REFERENCES inspirations(id) ON DELETE CASCADE UNIQUE,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_vector ON inspiration_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. 遗忘唤醒提醒表
CREATE TABLE wakeup_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inspiration_id UUID NOT NULL REFERENCES inspirations(id) ON DELETE CASCADE,
    remind_at TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON wakeup_reminders(user_id, is_sent, remind_at);

-- 6. 用户匹配表 (P1)
CREATE TABLE user_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_score FLOAT DEFAULT 0,
    common_tags TEXT[] DEFAULT '{}',
    is_viewed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX idx_matches_user1 ON user_matches(user_id_1, is_viewed);

-- 7. 点赞表
CREATE TABLE inspiration_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inspiration_id UUID NOT NULL REFERENCES inspirations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, inspiration_id)
);

CREATE INDEX idx_likes_inspiration ON inspiration_likes(inspiration_id);

-- 8. 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inspiration_id UUID NOT NULL REFERENCES inspirations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_inspiration ON comments(inspiration_id, created_at);

-- ============================================
-- 函数: 语义搜索相似灵感
-- ============================================
CREATE OR REPLACE FUNCTION search_similar_inspirations(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE(
    inspiration_id UUID,
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT inspiration_id, 1 - (embedding <=> query_embedding) AS similarity
    FROM inspiration_embeddings
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- ============================================
-- 自动更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_inspirations_updated
    BEFORE UPDATE ON inspirations
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
