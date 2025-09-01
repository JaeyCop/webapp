import { NextRequest, NextResponse } from 'next/server';
import { R2Service, getR2BucketFromRequest } from '@/lib/r2';
import { authenticateRequest } from '@/lib/auth';
import { Database } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Authenticate the request
        const db = new Database((request as unknown as { env: { DB: unknown } }).env.DB);
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

        // Parse the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { message: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { message: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Upload the file
        const result = await r2Service.uploadImage(file);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error || 'Upload failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: result.url,
            filename: file.name
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate the request
        const db = new Database((request as unknown as { env: { DB: unknown } }).env.DB);
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
        const images = await r2Service.listImages();

        return NextResponse.json({
            images: images.map(key => ({
                key,
                url: r2Service.generatePresignedUrl(key)
            }))
        });

    } catch (error) {
        console.error('Error listing images:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
