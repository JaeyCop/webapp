import { D1Database } from '@cloudflare/workers-types';

// Enhanced interfaces for all new features
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor' | 'author';
    avatar_url?: string;
    bio?: string;
    two_factor_enabled: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    featured_image_alt?: string;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    author_id: string;
    category_id?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    scheduled_at?: string;
    published_at?: string;
    view_count: number;
    reading_time: number;
    template: string;
    custom_fields?: string; // JSON
    created_at: string;
    updated_at: string;
    // Joined fields
    author_name?: string;
    category_name?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    color: string;
    icon?: string;
    sort_order: number;
    created_at: string;
    // Computed fields
    article_count?: number;
    children?: Category[];
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color: string;
    usage_count: number;
    created_at: string;
}

export interface MediaFile {
    id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    alt_text?: string;
    caption?: string;
    folder_id?: string;
    uploaded_by: string;
    width?: number;
    height?: number;
    created_at: string;
    // Joined fields
    folder_name?: string;
    uploader_name?: string;
}

export interface MediaFolder {
    id: string;
    name: string;
    parent_id?: string;
    created_by: string;
    created_at: string;
    // Computed fields
    file_count?: number;
    children?: MediaFolder[];
}

export interface ArticleRevision {
    id: string;
    article_id: string;
    title: string;
    content: string;
    excerpt?: string;
    revision_number: number;
    created_by: string;
    created_at: string;
    // Joined fields
    creator_name?: string;
}

export interface Comment {
    id: string;
    article_id: string;
    parent_id?: string;
    author_name: string;
    author_email: string;
    author_website?: string;
    content: string;
    status: 'pending' | 'approved' | 'spam' | 'trash';
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    // Computed fields
    replies?: Comment[];
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    name?: string;
    status: 'active' | 'unsubscribed' | 'bounced';
    subscribed_at: string;
    unsubscribed_at?: string;
    confirmed_at?: string;
}

export interface AnalyticsEvent {
    id: string;
    event_type: string;
    article_id?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    country?: string;
    city?: string;
    device_type?: string;
    created_at: string;
}

export interface Setting {
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    updated_at: string;
}

export class EnhancedDatabase {
    constructor(private db: D1Database) { }

    // User operations
    async getUserByEmail(email: string): Promise<User | null> {
        const result = await this.db.prepare(`
            SELECT id, email, name, role, avatar_url, bio, two_factor_enabled, 
                   last_login_at, created_at, updated_at 
            FROM users WHERE email = ?
        `).bind(email).first<User>();
        return result || null;
    }

    async getUserById(id: string): Promise<User | null> {
        const result = await this.db.prepare(`
            SELECT id, email, name, role, avatar_url, bio, two_factor_enabled, 
                   last_login_at, created_at, updated_at 
            FROM users WHERE id = ?
        `).bind(id).first<User>();
        return result || null;
    }

    async updateUserLastLogin(id: string): Promise<void> {
        await this.db.prepare(`
            UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?
        `).bind(id).run();
    }

    // Article operations (enhanced)
    async getArticles(
        status?: string, 
        category?: string, 
        limit = 10, 
        offset = 0,
        search?: string
    ): Promise<Article[]> {
        let query = `
            SELECT a.*, u.name as author_name, c.name as category_name 
            FROM articles a 
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
        `;
        const params: (string | number)[] = [];
        const conditions: string[] = [];

        if (status) {
            conditions.push('a.status = ?');
            params.push(status);
        }

        if (category) {
            conditions.push('a.category_id = ?');
            params.push(category);
        }

        if (search) {
            conditions.push('(a.title LIKE ? OR a.content LIKE ? OR a.excerpt LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const result = await this.db.prepare(query).bind(...params).all<Article>();
        return result.results || [];
    }

    async getArticleBySlug(slug: string): Promise<Article | null> {
        const result = await this.db.prepare(`
            SELECT a.*, u.name as author_name, c.name as category_name 
            FROM articles a 
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id 
            WHERE a.slug = ? AND a.status = 'published'
        `).bind(slug).first<Article>();
        return result || null;
    }

    async getArticleById(id: string): Promise<Article | null> {
        const result = await this.db.prepare(`
            SELECT a.*, u.name as author_name, c.name as category_name 
            FROM articles a 
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id 
            WHERE a.id = ?
        `).bind(id).first<Article>();
        return result || null;
    }

    async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO articles (
                id, title, slug, content, excerpt, featured_image, featured_image_alt,
                status, author_id, category_id, meta_title, meta_description, meta_keywords,
                og_title, og_description, og_image, scheduled_at, published_at, 
                reading_time, template, custom_fields
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, article.title, article.slug, article.content, article.excerpt,
            article.featured_image, article.featured_image_alt, article.status,
            article.author_id, article.category_id, article.meta_title,
            article.meta_description, article.meta_keywords, article.og_title,
            article.og_description, article.og_image, article.scheduled_at,
            article.published_at, article.reading_time, article.template,
            article.custom_fields
        ).run();
        return id;
    }

    async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
        const fields = Object.keys(updates).filter(key => 
            key !== 'id' && key !== 'created_at' && key !== 'view_count'
        );
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => (updates as Record<string, unknown>)[field]);

        await this.db.prepare(`
            UPDATE articles 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).bind(...values, id).run();
    }

    async incrementViewCount(id: string): Promise<void> {
        await this.db.prepare(`
            UPDATE articles SET view_count = view_count + 1 WHERE id = ?
        `).bind(id).run();
    }

    async getScheduledArticles(): Promise<Article[]> {
        const result = await this.db.prepare(`
            SELECT * FROM articles 
            WHERE status = 'scheduled' AND scheduled_at <= CURRENT_TIMESTAMP
        `).all<Article>();
        return result.results || [];
    }

    // Category operations
    async getCategories(): Promise<Category[]> {
        const result = await this.db.prepare(`
            SELECT c.*, COUNT(a.id) as article_count
            FROM categories c
            LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
            GROUP BY c.id
            ORDER BY c.sort_order, c.name
        `).all<Category>();
        return result.results || [];
    }

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        const result = await this.db.prepare(`
            SELECT * FROM categories WHERE slug = ?
        `).bind(slug).first<Category>();
        return result || null;
    }

    async createCategory(category: Omit<Category, 'id' | 'created_at' | 'article_count'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO categories (id, name, slug, description, parent_id, color, icon, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, category.name, category.slug, category.description,
            category.parent_id, category.color, category.icon, category.sort_order
        ).run();
        return id;
    }

    // Tag operations (enhanced)
    async getTags(): Promise<Tag[]> {
        const result = await this.db.prepare(`
            SELECT * FROM tags ORDER BY usage_count DESC, name
        `).all<Tag>();
        return result.results || [];
    }

    async getPopularTags(limit = 10): Promise<Tag[]> {
        const result = await this.db.prepare(`
            SELECT * FROM tags WHERE usage_count > 0 
            ORDER BY usage_count DESC LIMIT ?
        `).bind(limit).all<Tag>();
        return result.results || [];
    }

    async createTag(tag: Omit<Tag, 'id' | 'created_at' | 'usage_count'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO tags (id, name, slug, description, color)
            VALUES (?, ?, ?, ?, ?)
        `).bind(id, tag.name, tag.slug, tag.description, tag.color).run();
        return id;
    }

    async incrementTagUsage(tagId: string): Promise<void> {
        await this.db.prepare(`
            UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?
        `).bind(tagId).run();
    }

    // Media operations
    async getMediaFiles(folderId?: string, limit = 50, offset = 0): Promise<MediaFile[]> {
        let query = `
            SELECT m.*, f.name as folder_name, u.name as uploader_name
            FROM media_files m
            LEFT JOIN media_folders f ON m.folder_id = f.id
            LEFT JOIN users u ON m.uploaded_by = u.id
        `;
        const params: (string | number)[] = [];

        if (folderId) {
            query += ' WHERE m.folder_id = ?';
            params.push(folderId);
        } else if (folderId === null) {
            query += ' WHERE m.folder_id IS NULL';
        }

        query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const result = await this.db.prepare(query).bind(...params).all<MediaFile>();
        return result.results || [];
    }

    async createMediaFile(file: Omit<MediaFile, 'id' | 'created_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO media_files (
                id, filename, original_filename, file_path, file_size, mime_type,
                alt_text, caption, folder_id, uploaded_by, width, height
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, file.filename, file.original_filename, file.file_path, file.file_size,
            file.mime_type, file.alt_text, file.caption, file.folder_id,
            file.uploaded_by, file.width, file.height
        ).run();
        return id;
    }

    async getMediaFolders(): Promise<MediaFolder[]> {
        const result = await this.db.prepare(`
            SELECT f.*, COUNT(m.id) as file_count
            FROM media_folders f
            LEFT JOIN media_files m ON f.id = m.folder_id
            GROUP BY f.id
            ORDER BY f.name
        `).all<MediaFolder>();
        return result.results || [];
    }

    // Comment operations
    async getComments(articleId: string, status = 'approved'): Promise<Comment[]> {
        const result = await this.db.prepare(`
            SELECT * FROM comments 
            WHERE article_id = ? AND status = ? AND parent_id IS NULL
            ORDER BY created_at DESC
        `).bind(articleId, status).all<Comment>();
        return result.results || [];
    }

    async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO comments (
                id, article_id, parent_id, author_name, author_email, author_website,
                content, status, ip_address, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, comment.article_id, comment.parent_id, comment.author_name,
            comment.author_email, comment.author_website, comment.content,
            comment.status, comment.ip_address, comment.user_agent
        ).run();
        return id;
    }

    // Analytics operations
    async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO analytics_events (
                id, event_type, article_id, session_id, ip_address, user_agent,
                referrer, country, city, device_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, event.event_type, event.article_id, event.session_id,
            event.ip_address, event.user_agent, event.referrer,
            event.country, event.city, event.device_type
        ).run();
    }

    async getAnalytics(startDate: string, endDate: string): Promise<any> {
        const pageViews = await this.db.prepare(`
            SELECT COUNT(*) as count FROM analytics_events 
            WHERE event_type = 'page_view' AND created_at BETWEEN ? AND ?
        `).bind(startDate, endDate).first();

        const topArticles = await this.db.prepare(`
            SELECT a.title, a.slug, COUNT(e.id) as views
            FROM analytics_events e
            JOIN articles a ON e.article_id = a.id
            WHERE e.event_type = 'article_view' AND e.created_at BETWEEN ? AND ?
            GROUP BY a.id
            ORDER BY views DESC
            LIMIT 10
        `).bind(startDate, endDate).all();

        return {
            pageViews: pageViews?.count || 0,
            topArticles: topArticles.results || []
        };
    }

    // Settings operations
    async getSetting(key: string): Promise<Setting | null> {
        const result = await this.db.prepare(`
            SELECT * FROM settings WHERE key = ?
        `).bind(key).first<Setting>();
        return result || null;
    }

    async getSettings(): Promise<Setting[]> {
        const result = await this.db.prepare(`
            SELECT * FROM settings ORDER BY key
        `).all<Setting>();
        return result.results || [];
    }

    async updateSetting(key: string, value: string, type = 'string'): Promise<void> {
        await this.db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, type, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(key, value, type).run();
    }

    // Newsletter operations
    async subscribeToNewsletter(email: string, name?: string): Promise<string> {
        const id = crypto.randomUUID();
        const token = crypto.randomUUID();
        await this.db.prepare(`
            INSERT INTO newsletter_subscribers (id, email, name, confirmation_token)
            VALUES (?, ?, ?, ?)
        `).bind(id, email, name, token).run();
        return token;
    }

    async confirmSubscription(token: string): Promise<boolean> {
        const result = await this.db.prepare(`
            UPDATE newsletter_subscribers 
            SET confirmed_at = CURRENT_TIMESTAMP, confirmation_token = NULL
            WHERE confirmation_token = ?
        `).bind(token).run();
        return result.changes > 0;
    }

    // Revision operations
    async createRevision(articleId: string, title: string, content: string, excerpt: string, createdBy: string): Promise<void> {
        // Get the next revision number
        const lastRevision = await this.db.prepare(`
            SELECT MAX(revision_number) as max_revision FROM article_revisions WHERE article_id = ?
        `).bind(articleId).first<{ max_revision: number }>();

        const revisionNumber = (lastRevision?.max_revision || 0) + 1;
        const id = crypto.randomUUID();

        await this.db.prepare(`
            INSERT INTO article_revisions (id, article_id, title, content, excerpt, revision_number, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(id, articleId, title, content, excerpt, revisionNumber, createdBy).run();
    }

    async getRevisions(articleId: string): Promise<ArticleRevision[]> {
        const result = await this.db.prepare(`
            SELECT r.*, u.name as creator_name
            FROM article_revisions r
            LEFT JOIN users u ON r.created_by = u.id
            WHERE r.article_id = ?
            ORDER BY r.revision_number DESC
        `).bind(articleId).all<ArticleRevision>();
        return result.results || [];
    }
}