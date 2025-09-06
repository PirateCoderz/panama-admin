-- Enable UUIDs (Postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS / AUTHORS
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(120) NOT NULL,
  username         VARCHAR(60)  UNIQUE NOT NULL,
  email            VARCHAR(160) UNIQUE NOT NULL,
  avatar_url       TEXT,
  bio              TEXT,
  role             VARCHAR(20) DEFAULT 'author', -- 'author', 'editor', 'admin'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES (supports hierarchy via parent_id)
CREATE TABLE categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(120) NOT NULL,
  slug             VARCHAR(160) NOT NULL UNIQUE,
  description      TEXT,
  parent_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- TAGS
CREATE TABLE tags (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(80)  NOT NULL,
  slug             VARCHAR(160) NOT NULL UNIQUE,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- POSTS
CREATE TABLE posts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              VARCHAR(200) NOT NULL,
  slug               VARCHAR(200) NOT NULL UNIQUE,
  excerpt            TEXT,
  content_html       TEXT,                     -- or content_markdown TEXT
  featured_image_url TEXT,
  status             VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft|scheduled|published|archived
  visibility         VARCHAR(20) NOT NULL DEFAULT 'public', -- public|private|unlisted
  primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  seo_title          VARCHAR(200),
  seo_description    VARCHAR(300),
  canonical_url      TEXT,
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ
);
CREATE INDEX idx_posts_author           ON posts(author_id);
CREATE INDEX idx_posts_status_pub       ON posts(status, published_at);
CREATE INDEX idx_posts_primary_category ON posts(primary_category_id);
CREATE INDEX idx_posts_published_at     ON posts(published_at DESC) WHERE status='published';

-- POST <-> CATEGORY (many-to-many for secondary categories)
CREATE TABLE post_categories (
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE, -- optional: can mirror primary_category_id
  PRIMARY KEY (post_id, category_id)
);
CREATE INDEX idx_post_categories_category ON post_categories(category_id);

-- POST <-> TAG (many-to-many)
CREATE TABLE post_tags (
  post_id  UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- COMMENTS (optional but common)
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(120),       -- for guest comments if you allow
  author_email VARCHAR(160),
  content     TEXT NOT NULL,
  status      VARCHAR(20) DEFAULT 'pending', -- pending|approved|spam|deleted
  parent_id   UUID REFERENCES comments(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comments_post   ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- SIMPLE LIKE COUNTS / STATS (optional)
CREATE TABLE post_stats (
  post_id      UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  views_count  BIGINT NOT NULL DEFAULT 0,
  likes_count  BIGINT NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

-- TRIGGERS (updated_at)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at      BEFORE UPDATE ON users      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_tags_updated_at       BEFORE UPDATE ON tags       FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_posts_updated_at      BEFORE UPDATE ON posts      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
