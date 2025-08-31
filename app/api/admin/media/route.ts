import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '../../../lib/db_enhanced';
import { authenticateRequest } from '../../../lib/auth';

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
        const folderId = searchParams.get('folder') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const files = await db.getMediaFiles(folderId, limit, offset);

        return NextResponse.json({
            files
        });

    } catch (error) {
        console.error('Error fetching media files:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}