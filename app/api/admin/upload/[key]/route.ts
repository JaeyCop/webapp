import { NextRequest, NextResponse } from 'next/server';
import { R2Service, getR2BucketFromRequest } from '@/lib/r2';
import { authenticateRequest } from '@/lib/auth';
import { Database } from '@/lib/db';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { key: string } }
) {
    try {
        // Authenticate the request
        const db = new Database((request as any).env.DB);
        const user = await authenticateRequest(request, db);
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the R2 bucket
        const bucket = getR2BucketFromRequest(request);
        if (!bucket) {
            return NextResponse.json(
                { message: 'R2 bucket not configured' },
                { status: 500 }
            );
        }

        const r2Service = new R2Service(bucket);
        const key = decodeURIComponent(params.key);

        // Delete the image
        const success = await r2Service.deleteImage(key);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { message: 'Failed to delete image' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
