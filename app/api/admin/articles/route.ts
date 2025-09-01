import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '@/lib/db_enhanced';
import { authenticateRequest } from '@/lib/auth';
import crypto from 'crypto'; // Import crypto for UUID generation

export async function GET(request: NextRequest) {
    try {
        // Handle development environment
        if (process.env.NODE_ENV === 'development') {
            // Mock data for development
            const mockArticles = [
                {
                    id: 'dev-article-1',
                    title: 'Development Article 1',
                    slug: 'development-article-1',
                    content: 'This is a mock article for development.',
                    excerpt: 'Mock excerpt',
                    status: 'published',
                    author_id: 'dev-user-1',
                    author_name: 'Development Admin',
                    category_name: 'Development',
                    view_count: 42,
                    reading_time: 5,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'dev-article-2',
                    title: 'Development Article 2',
                    slug: 'development-article-2',
                    content: 'This is another mock article for development.',
                    excerpt: 'Another mock excerpt',
                    status: 'draft',
                    author_id: 'dev-user-1',
                    author_name: 'Development Admin',
                    category_name: 'Development',
                    view_count: 15,
                    reading_time: 3,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];

            const mockStats = {
                total: 2,
                published: 1,
                drafts: 1,
                scheduled: 0,
                archived: 0
            };

            return NextResponse.json({
                articles: mockArticles,
                stats: mockStats,
                pagination: {
                    limit: 50,
                    offset: 0,
                    total: 2
                }
            });
        }

        // Production environment - use actual database
        let dbInstance;
        if (process.env.DB) {
            dbInstance = process.env.DB as unknown;
        } else {
            dbInstance = (request as unknown as { env: { DB: unknown } }).env?.DB;
        }

        if (!dbInstance) {
            return NextResponse.json(
                { message: 'Database connection error' },
                { status: 500 }
            );
        }

        const db = new EnhancedDatabase(dbInstance);

        // Authenticate the request
        const user = await authenticateRequest(request, db);
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || undefined;
        const category = searchParams.get('category') || undefined;
        const search = searchParams.get('search') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get all articles with filters
        const articles = await db.getArticles(status, category, limit, offset, search);

        // Calculate stats
        const allArticles = await db.getArticles();
        const stats = {
            total: allArticles.length,
            published: allArticles.filter(a => a.status === 'published').length,
            drafts: allArticles.filter(a => a.status === 'draft').length,
            scheduled: allArticles.filter(a => a.status === 'scheduled').length,
            archived: allArticles.filter(a => a.status === 'archived').length
        };

        return NextResponse.json({
            articles,
            stats,
            pagination: {
                limit,
                offset,
                total: allArticles.length
            }
        });

    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle development environment
        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: enhanced article creation simulation', body);

            // Simulate successful creation with all enhanced fields
            const mockArticle = {
                id: crypto.randomUUID(),
                title: body.title,
                slug: body.slug,
                content: body.content,
                excerpt: body.excerpt,
                featured_image: body.featured_image,
                featured_image_alt: body.featured_image_alt,
                status: body.status || 'draft',
                author_id: body.author_id || 'admin-1',
                category_id: body.category_id,
                meta_title: body.meta_title,
                meta_description: body.meta_description,
                meta_keywords: body.meta_keywords,
                og_title: body.og_title,
                og_description: body.og_description,
                og_image: body.og_image,
                scheduled_at: body.scheduled_at,
                published_at: body.status === 'published' ? new Date().toISOString() : null,
                reading_time: body.reading_time || 0,
                template: body.template || 'default',
                custom_fields: body.custom_fields,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                view_count: 0
            };

            return NextResponse.json(mockArticle);
        }

        // Production environment - use actual database
        let dbInstance;
        if (process.env.DB) {
            dbInstance = process.env.DB as unknown;
        } else {
            dbInstance = (request as unknown as { env: { DB: unknown } }).env?.DB;
        }

        if (!dbInstance) {
            return NextResponse.json(
                { message: 'Database connection error' },
                { status: 500 }
            );
        }

        const db = new EnhancedDatabase(dbInstance as any);

        // Create the article with all enhanced fields
        const articleId = await db.createArticle({
            title: body.title,
            slug: body.slug,
            content: body.content,
            excerpt: body.excerpt,
            featured_image: body.featured_image,
            featured_image_alt: body.featured_image_alt,
            status: body.status || 'draft',
            author_id: body.author_id || 'admin-1',
            category_id: body.category_id,
            meta_title: body.meta_title,
            meta_description: body.meta_description,
            meta_keywords: body.meta_keywords,
            og_title: body.og_title,
            og_description: body.og_description,
            og_image: body.og_image,
            scheduled_at: body.scheduled_at,
            published_at: body.status === 'published' ? new Date().toISOString() : null,
            reading_time: body.reading_time || 0,
            template: body.template || 'default',
            custom_fields: body.custom_fields
        });

        // Handle tags if provided
        if (body.tags && Array.isArray(body.tags)) {
            for (const tagId of body.tags) {
                // Create article-tag relationship (you'll need to add this method to EnhancedDatabase)
                await db.db.prepare(`
                    INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)
                `).bind(articleId, tagId).run();

                // Increment tag usage count
                await db.incrementTagUsage(tagId);
            }
        }

        return NextResponse.json({ id: articleId });
    } catch (error) {
        console.error('Error creating enhanced article:', error);
        return NextResponse.json(
            { message: 'Failed to create article' },
            { status: 500 }
        );
    }
}