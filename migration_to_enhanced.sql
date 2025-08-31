-- Migration script to upgrade existing blog CMS to enhanced version
-- Run this instead of the full schema_enhanced.sql

-- First, let's add new columns to existing tables

-- Enhance users table
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_login_at DATETIME;
ALTER TABLE users ADD COLUMN updated_at DATETIME;
UPDATE users SET role = 'admin' WHERE role IS NULL;
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Enhance articles table
ALTER TABLE articles ADD COLUMN featured_image_alt TEXT;
ALTER TABLE articles ADD COLUMN category_id TEXT;
ALTER TABLE articles ADD COLUMN meta_title TEXT;
ALTER TABLE articles ADD COLUMN meta_description TEXT;
ALTER TABLE articles ADD COLUMN meta_keywords TEXT;
ALTER TABLE articles ADD COLUMN og_title TEXT;
ALTER TABLE articles ADD COLUMN og_description TEXT;
ALTER TABLE articles ADD COLUMN og_image TEXT;
ALTER TABLE articles ADD COLUMN scheduled_at DATETIME;
ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN reading_time INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN template TEXT DEFAULT 'default';
ALTER TABLE articles ADD COLUMN custom_fields TEXT;

-- Enhance tags table
ALTER TABLE tags ADD COLUMN description TEXT;
ALTER TABLE tags ADD COLUMN color TEXT DEFAULT '#6366f1';
ALTER TABLE tags ADD COLUMN usage_count INTEGER DEFAULT 0;

-- Create new tables

-- Categories table (hierarchical categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Media files table
CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  folder_id TEXT,
  uploaded_by TEXT,
  width INTEGER,
  height INTEGER,
  created_at DATETIME,
  FOREIGN KEY (folder_id) REFERENCES media_folders(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Media folders table
CREATE TABLE IF NOT EXISTS media_folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_by TEXT,
  created_at DATETIME,
  FOREIGN KEY (parent_id) REFERENCES media_folders(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Article revisions table
CREATE TABLE IF NOT EXISTS article_revisions (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  revision_number INTEGER NOT NULL,
  created_by TEXT,
  created_at DATETIME,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  parent_id TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_website TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active',
  subscribed_at DATETIME,
  unsubscribed_at DATETIME,
  confirmation_token TEXT,
  confirmed_at DATETIME
);

-- Analytics table for tracking views and engagement
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  article_id TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  created_at DATETIME,
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Settings table for site configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string',
  description TEXT,
  updated_at DATETIME
);

-- API keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT,
  last_used_at DATETIME,
  expires_at DATETIME,
  created_by TEXT,
  created_at DATETIME,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert default categories with timestamps
INSERT OR IGNORE INTO categories (id, name, slug, description, created_at) VALUES 
('cat-1', 'Technology', 'technology', 'Articles about technology and programming', CURRENT_TIMESTAMP),
('cat-2', 'Lifestyle', 'lifestyle', 'Lifestyle and personal development articles', CURRENT_TIMESTAMP),
('cat-3', 'Business', 'business', 'Business and entrepreneurship content', CURRENT_TIMESTAMP);

-- Insert default tags (update existing ones)
INSERT OR IGNORE INTO tags (id, name, slug) VALUES 
('tag-1', 'JavaScript', 'javascript'),
('tag-2', 'React', 'react'),
('tag-3', 'Next.js', 'nextjs'),
('tag-4', 'Web Development', 'web-development'),
('tag-5', 'Tutorial', 'tutorial');

-- Insert default settings with timestamps
INSERT OR IGNORE INTO settings (key, value, description, updated_at) VALUES 
('site_title', 'My Enhanced Blog', 'The title of the website', CURRENT_TIMESTAMP),
('site_description', 'A powerful blog built with Next.js', 'Site description for SEO', CURRENT_TIMESTAMP),
('posts_per_page', '10', 'Number of posts to show per page', CURRENT_TIMESTAMP),
('allow_comments', 'true', 'Whether to allow comments on articles', CURRENT_TIMESTAMP),
('comment_moderation', 'true', 'Whether comments require approval', CURRENT_TIMESTAMP),
('newsletter_enabled', 'true', 'Whether newsletter signup is enabled', CURRENT_TIMESTAMP),
('analytics_enabled', 'true', 'Whether to track analytics', CURRENT_TIMESTAMP),
('theme_mode', 'light', 'Default theme mode (light/dark)', CURRENT_TIMESTAMP);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_article_id ON analytics_events(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_folder_id ON media_files(folder_id);

-- Add foreign key constraint for articles -> categories (if not exists)
-- Note: SQLite doesn't support adding foreign keys to existing tables, 
-- so we'll handle this in the application logic