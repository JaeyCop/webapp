-- Enhanced Blog CMS Database Schema
-- This includes all the new tables and enhancements

-- Users table for admin authentication (enhanced with roles and 2FA)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'author', -- admin, editor, author
  avatar_url TEXT,
  bio TEXT,
  two_factor_secret TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Articles table (enhanced with SEO and scheduling)
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  featured_image_alt TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, scheduled, archived
  author_id TEXT,
  category_id TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  scheduled_at DATETIME,
  published_at DATETIME,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0, -- estimated reading time in minutes
  template TEXT DEFAULT 'default',
  custom_fields TEXT, -- JSON field for flexible metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Categories table (hierarchical categories)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Tags table (enhanced)
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Article tags junction table
CREATE TABLE article_tags (
  article_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Media files table
CREATE TABLE media_files (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES media_folders(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Media folders table
CREATE TABLE media_folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES media_folders(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Article revisions table
CREATE TABLE article_revisions (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  revision_number INTEGER NOT NULL,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Comments table
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  parent_id TEXT, -- for nested comments
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_website TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, spam, trash
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active', -- active, unsubscribed, bounced
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME,
  confirmation_token TEXT,
  confirmed_at DATETIME
);

-- Analytics table for tracking views and engagement
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- page_view, article_view, search, etc.
  article_id TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Settings table for site configuration
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API keys table for external integrations
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT, -- JSON array of permissions
  last_used_at DATETIME,
  expires_at DATETIME,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert default data
INSERT INTO users (id, email, name, password_hash, role) 
VALUES ('admin-1', 'admin@example.com', 'Admin User', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 'admin');

-- Insert default categories
INSERT INTO categories (id, name, slug, description) VALUES 
('cat-1', 'Technology', 'technology', 'Articles about technology and programming'),
('cat-2', 'Lifestyle', 'lifestyle', 'Lifestyle and personal development articles'),
('cat-3', 'Business', 'business', 'Business and entrepreneurship content');

-- Insert default tags
INSERT INTO tags (id, name, slug) VALUES 
('tag-1', 'JavaScript', 'javascript'),
('tag-2', 'React', 'react'),
('tag-3', 'Next.js', 'nextjs'),
('tag-4', 'Web Development', 'web-development'),
('tag-5', 'Tutorial', 'tutorial');

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES 
('site_title', 'My Enhanced Blog', 'The title of the website'),
('site_description', 'A powerful blog built with Next.js', 'Site description for SEO'),
('posts_per_page', '10', 'Number of posts to show per page'),
('allow_comments', 'true', 'Whether to allow comments on articles'),
('comment_moderation', 'true', 'Whether comments require approval'),
('newsletter_enabled', 'true', 'Whether newsletter signup is enabled'),
('analytics_enabled', 'true', 'Whether to track analytics'),
('theme_mode', 'light', 'Default theme mode (light/dark)');

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_analytics_events_article_id ON analytics_events(article_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_media_files_folder_id ON media_files(folder_id);