import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '@/lib/db_enhanced';
import { authenticateRequest } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

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

        const categories = await db.getCategories();

        return NextResponse.json({
            categories
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
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

        const { name, description, parent_id, color, icon, sort_order } = await request.json();

        if (!name) {
            return NextResponse.json(
                { message: 'Name is required' },
                { status: 400 }
            );
        }

        const slug = generateSlug(name);

        // Check if slug is unique
        const existingCategory = await db.getCategoryBySlug(slug);
        if (existingCategory) {
            return NextResponse.json(
                { message: 'Category name already exists' },
                { status: 400 }
            );
        }

        const categoryData = {
            name,
            slug,
            description: description || '',
            parent_id: parent_id || null,
            color: color || '#6366f1',
            icon: icon || '',
            sort_order: sort_order || 0
        };

        const categoryId = await db.createCategory(categoryData);

        return NextResponse.json({
            id: categoryId,
            ...categoryData
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}