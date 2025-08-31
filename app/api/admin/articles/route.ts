import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/db';
import { authenticateRequest } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const db = new Database((request as unknown as { env: { DB: unknown } }).env.DB);

        // Authenticate the request
        const user = await authenticateRequest(request, db);
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all articles
        const articles = await db.getArticles();

        // Calculate stats
        const stats = {
            total: articles.length,
            published: articles.filter(a => a.status === 'published').length,
            drafts: articles.filter(a => a.status === 'draft').length
        };

        return NextResponse.json({
            articles,
            stats
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
        const db = new Database((request as unknown as { env: { DB: unknown } }).env.DB);

        // Authenticate the request
        const user = await authenticateRequest(request, db);
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { title, content, excerpt, featured_image, status } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { message: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const articleData = {
            title,
            slug,
            content,
            excerpt: excerpt || '',
            featured_image: featured_image || '',
            status: status || 'draft',
            author_id: user.id,
            published_at: status === 'published' ? new Date().toISOString() : undefined
        };

        const articleId = await db.createArticle(articleData);

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
