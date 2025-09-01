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

        const folders = await db.getMediaFolders();

        return NextResponse.json({
            folders
        });

    } catch (error) {
        console.error('Error fetching media folders:', error);
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

        const { name, parent_id } = await request.json();

        if (!name) {
            return NextResponse.json(
                { message: 'Folder name is required' },
                { status: 400 }
            );
        }

        const folderId = crypto.randomUUID();
        
        // In a real implementation, you'd create the folder in the database
        // For now, we'll just return a success response
        const folderData = {
            id: folderId,
            name,
            parent_id: parent_id || null,
            created_by: user.id,
            created_at: new Date().toISOString(),
            file_count: 0
        };

        return NextResponse.json(folderData, { status: 201 });

    } catch (error) {
        console.error('Error creating folder:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}