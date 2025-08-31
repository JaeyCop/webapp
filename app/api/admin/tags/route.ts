import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '../../../lib/db_enhanced';
import { authenticateRequest } from '../../../lib/auth';
import { generateSlug, generateColorFromString } from '../../../lib/utils';

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

        const { searchParams } = new URL(request.url);
        const popular = searchParams.get('popular') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        const tags = popular 
            ? await db.getPopularTags(limit)
            : await db.getTags();

        return NextResponse.json({
            tags
        });

    } catch (error) {
        console.error('Error fetching tags:', error);
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

        const { name, description, color } = await request.json();

        if (!name) {
            return NextResponse.json(
                { message: 'Name is required' },
                { status: 400 }
            );
        }

        const slug = generateSlug(name);
        const finalColor = color || generateColorFromString(name);

        const tagData = {
            name,
            slug,
            description: description || '',
            color: finalColor
        };

        const tagId = await db.createTag(tagData);

        return NextResponse.json({
            id: tagId,
            ...tagData,
            usage_count: 0
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}