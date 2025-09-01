import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '@/lib/db_enhanced';

export async function GET(request: NextRequest) {
    try {
        // Handle development environment with mock data
        if (process.env.NODE_ENV === 'development') {
            const mockArticles = [
                {
                    id: '1',
                    title: 'Welcome to Enhanced CMS',
                    slug: 'welcome-to-enhanced-cms',
                    content: '<p>This is a sample article demonstrating the enhanced CMS features.</p>',
                    excerpt: 'A sample article to get you started.',
                    status: 'published' as const,
                    author_id: '1',
                    author_name: 'Admin User',
                    published_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    view_count: 0,
                    reading_time: 2,
                    template: 'default'
                }
            ];
            return NextResponse.json(mockArticles);
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
        const articles = await db.getArticles('published', 20, 0);

        return NextResponse.json(articles);

    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
