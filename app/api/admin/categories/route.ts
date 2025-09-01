
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '@/lib/db_enhanced';

export async function GET(request: NextRequest) {
    try {
        // Handle development environment with mock data
        if (process.env.NODE_ENV === 'development') {
            const mockCategories = [
                {
                    id: 'cat-1',
                    name: 'Technology',
                    slug: 'technology',
                    description: 'Articles about technology and programming',
                    color: '#6366f1',
                    sort_order: 0,
                    created_at: new Date().toISOString(),
                    article_count: 5
                },
                {
                    id: 'cat-2',
                    name: 'Lifestyle',
                    slug: 'lifestyle',
                    description: 'Lifestyle and personal development articles',
                    color: '#10b981',
                    sort_order: 1,
                    created_at: new Date().toISOString(),
                    article_count: 3
                },
                {
                    id: 'cat-3',
                    name: 'Business',
                    slug: 'business',
                    description: 'Business and entrepreneurship content',
                    color: '#f59e0b',
                    sort_order: 2,
                    created_at: new Date().toISOString(),
                    article_count: 2
                }
            ];
            return NextResponse.json(mockCategories);
        }

        // Production environment
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
        const categories = await db.getCategories();

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Handle development environment
        if (process.env.NODE_ENV === 'development') {
            const mockCategory = {
                id: crypto.randomUUID(),
                name: body.name,
                slug: body.slug,
                description: body.description,
                color: body.color || '#6366f1',
                sort_order: body.sort_order || 0,
                created_at: new Date().toISOString(),
                article_count: 0
            };
            return NextResponse.json(mockCategory);
        }

        // Production environment
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
        const categoryId = await db.createCategory({
            name: body.name,
            slug: body.slug,
            description: body.description,
            parent_id: body.parent_id,
            color: body.color || '#6366f1',
            icon: body.icon,
            sort_order: body.sort_order || 0
        });

        return NextResponse.json({ id: categoryId });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { message: 'Failed to create category' },
            { status: 500 }
        );
    }
}
