import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase as Database } from '../../lib/db_enhanced';

export async function GET(request: NextRequest) {
    try {
        const db = new Database((request as unknown as { env: { DB: unknown } }).env.DB);

        // Get only published articles
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
