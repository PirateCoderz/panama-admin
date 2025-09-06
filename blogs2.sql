-- Recommended defaults
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AUTHORS (optional but useful)
CREATE TABLE authors (
  id           CHAR(36)      NOT NULL PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  email        VARCHAR(160)  UNIQUE,
  avatar_url   TEXT,
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CATEGORIES (flat: no parent_id)
CREATE TABLE categories (
  id           CHAR(36)      NOT NULL PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  slug         VARCHAR(160)  NOT NULL UNIQUE,
  description  TEXT,
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- BLOGS
CREATE TABLE blogs (
  id                   CHAR(36)     NOT NULL PRIMARY KEY,
  author_id            CHAR(36)     NULL,
  title                VARCHAR(200) NOT NULL,
  slug                 VARCHAR(200) NOT NULL UNIQUE,
  excerpt              TEXT,
  content_html         LONGTEXT,
  featured_image_url   TEXT,                  -- e.g. /blogs/featured/cover-123.jpg
  tags                 JSON          NOT NULL DEFAULT (JSON_ARRAY()), -- ["tech","nextjs"]
  status               ENUM('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
  seo_title            VARCHAR(200),
  seo_description      VARCHAR(300),
  canonical_url        TEXT,
  published_at         DATETIME(3)  NULL,
  created_at           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at           DATETIME(3)  NULL,
  CONSTRAINT fk_blogs_author
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Many-to-many: BLOGS ↔ CATEGORIES
CREATE TABLE blog_categories (
  blog_id      CHAR(36) NOT NULL,
  category_id  CHAR(36) NOT NULL,
  PRIMARY KEY (blog_id, category_id),
  KEY idx_bc_category (category_id),
  CONSTRAINT fk_bc_blog     FOREIGN KEY (blog_id)     REFERENCES blogs(id)      ON DELETE CASCADE,
  CONSTRAINT fk_bc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- COMMENTS (1:M from blog)
CREATE TABLE comments (
  id           CHAR(36)    NOT NULL PRIMARY KEY,
  blog_id      CHAR(36)    NOT NULL,
  author_name  VARCHAR(120),
  author_email VARCHAR(160),
  content      TEXT        NOT NULL,
  status       ENUM('pending','approved','spam','deleted') DEFAULT 'pending',
  created_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_comments_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Useful indexes
CREATE INDEX idx_blogs_status_pub   ON blogs (status, published_at);
CREATE FULLTEXT INDEX ftx_blogs_text ON blogs (title, excerpt, content_html);

-- OPTIONAL (MySQL 8.0.17+): Multi-Valued Index on JSON tags for fast tag lookups
-- If your host supports it, uncomment:
-- CREATE INDEX idx_blogs_tags ON blogs ((CAST(JSON_EXTRACT(tags, '$') AS CHAR(64) ARRAY)));
