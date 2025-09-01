
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '@/lib/db_enhanced';

export async function GET(request: NextRequest) {
    try {
        // Handle development environment with mock data
        if (process.env.NODE_ENV === 'development') {
            const mockTags = [
                {
                    id: 'tag-1',
                    name: 'JavaScript',
                    slug: 'javascript',
                    description: 'JavaScript programming language',
                    color: '#f7df1e',
                    usage_count: 12,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'tag-2',
                    name: 'React',
                    slug: 'react',
                    description: 'React JavaScript library',
                    color: '#61dafb',
                    usage_count: 8,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'tag-3',
                    name: 'Next.js',
                    slug: 'nextjs',
                    description: 'Next.js React framework',
                    color: '#000000',
                    usage_count: 6,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'tag-4',
                    name: 'Web Development',
                    slug: 'web-development',
                    description: 'General web development topics',
                    color: '#6366f1',
                    usage_count: 15,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'tag-5',
                    name: 'Tutorial',
                    slug: 'tutorial',
                    description: 'Step-by-step tutorials',
                    color: '#10b981',
                    usage_count: 10,
                    created_at: new Date().toISOString()
                }
            ];
            return NextResponse.json(mockTags);
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
        const tags = await db.getTags();

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { message: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Handle development environment
        if (process.env.NODE_ENV === 'development') {
            const mockTag = {
                id: crypto.randomUUID(),
                name: body.name,
                slug: body.slug,
                description: body.description,
                color: body.color || '#6366f1',
                usage_count: 0,
                created_at: new Date().toISOString()
            };
            return NextResponse.json(mockTag);
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
        const tagId = await db.createTag({
            name: body.name,
            slug: body.slug,
            description: body.description,
            color: body.color || '#6366f1'
        });

        return NextResponse.json({ id: tagId });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { message: 'Failed to create tag' },
            { status: 500 }
        );
    }
}
