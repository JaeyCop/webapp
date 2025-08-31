import { D1Database } from '@cloudflare/workers-types';

export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    status: 'draft' | 'published' | 'archived';
    author_id: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export class Database {
    constructor(private db: D1Database) { }

    // User operations
    async getUserByEmail(email: string): Promise<User | null> {
        const result = await this.db.prepare(
            'SELECT id, email, name, role, created_at FROM users WHERE email = ?'
        ).bind(email).first<User>();
        return result || null;
    }

    async getUserById(id: string): Promise<User | null> {
        const result = await this.db.prepare(
            'SELECT id, email, name, role, created_at FROM users WHERE id = ?'
        ).bind(id).first<User>();
        return result || null;
    }

    // Article operations
    async getArticles(status?: string, limit = 10, offset = 0): Promise<Article[]> {
        let query = `
      SELECT a.*, u.name as author_name 
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id
    `;
        const params: (string | number)[] = [];

        if (status) {
            query += ' WHERE a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const result = await this.db.prepare(query).bind(...params).all<Article>();
        return result.results || [];
    }

    async getArticleBySlug(slug: string): Promise<Article | null> {
        const result = await this.db.prepare(`
      SELECT a.*, u.name as author_name 
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      WHERE a.slug = ? AND a.status = 'published'
    `).bind(slug).first<Article>();
        return result || null;
    }

    async getArticleById(id: string): Promise<Article | null> {
        const result = await this.db.prepare(`
      SELECT a.*, u.name as author_name 
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      WHERE a.id = ?
    `).bind(id).first<Article>();
        return result || null;
    }

    async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(`
      INSERT INTO articles (id, title, slug, content, excerpt, featured_image, status, author_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            id,
            article.title,
            article.slug,
            article.content,
            article.excerpt,
            article.featured_image,
            article.status,
            article.author_id,
            article.published_at
        ).run();
        return id;
    }

    async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
        const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => (updates as Record<string, unknown>)[field]);

        await this.db.prepare(`
      UPDATE articles 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...values, id).run();
    }

    async deleteArticle(id: string): Promise<void> {
        await this.db.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
    }

    // Tag operations
    async getTags(): Promise<Tag[]> {
        const result = await this.db.prepare('SELECT * FROM tags ORDER BY name').all<Tag>();
        return result.results || [];
    }

    async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await this.db.prepare(
            'INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)'
        ).bind(id, tag.name, tag.slug).run();
        return id;
    }
}
