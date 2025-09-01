import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '@/lib/db_enhanced';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const db = new EnhancedDatabase((request as unknown as { env: { DB: unknown } }).env.DB);

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
        const db = new EnhancedDatabase((request as unknown as { env: { DB: unknown } }).env.DB);

        // Authenticate the request
        const user = await authenticateRequest(request, db);
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            slug,
            content,
            excerpt,
            featured_image,
            featured_image_alt,
            status,
            category_id,
            tags,
            scheduled_at,
            published_at,
            reading_time,
            template,
            meta_title,
            meta_description,
            meta_keywords,
            og_title,
            og_description,
            og_image,
            custom_fields
        } = body;

        if (!title || !content) {
            return NextResponse.json(
                { message: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        const finalSlug = slug || title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug is unique
        const existingArticle = await db.getArticleBySlug(finalSlug);
        if (existingArticle) {
            return NextResponse.json(
                { message: 'Slug already exists' },
                { status: 400 }
            );
        }

        const articleData = {
            title,
            slug: finalSlug,
            content,
            excerpt: excerpt || '',
            featured_image: featured_image || '',
            featured_image_alt: featured_image_alt || '',
            status: status || 'draft',
            author_id: user.id,
            category_id: category_id || null,
            meta_title: meta_title || '',
            meta_description: meta_description || '',
            meta_keywords: meta_keywords || '',
            og_title: og_title || '',
            og_description: og_description || '',
            og_image: og_image || '',
            scheduled_at: scheduled_at || null,
            published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
            reading_time: reading_time || 0,
            template: template || 'default',
            custom_fields: custom_fields || null
        };

        const articleId = await db.createArticle(articleData);

        // Handle tags
        if (tags && Array.isArray(tags)) {
            for (const tagId of tags) {
                await db.incrementTagUsage(tagId);
            }
        }

        // Create initial revision
        await db.createRevision(articleId, title, content, excerpt || '', user.id);

        return NextResponse.json({
            id: articleId,
            ...articleData
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
