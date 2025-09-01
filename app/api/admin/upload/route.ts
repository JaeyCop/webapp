import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Handle development environment with mock upload
        if (process.env.NODE_ENV === 'development') {
            const formData = await request.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return NextResponse.json(
                    { message: 'No file provided' },
                    { status: 400 }
                );
            }

            // In development, return a placeholder image URL
            const mockImageUrl = `https://picsum.photos/800/400?random=${Date.now()}`;

            return NextResponse.json({
                url: mockImageUrl,
                filename: file.name,
                size: file.size,
                type: file.type
            });
        }

        // Production environment would handle actual file upload to R2/S3
        return NextResponse.json(
            { message: 'Upload functionality not implemented for production' },
            { status: 501 }
        );
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { message: 'Failed to upload file' },
            { status: 500 }
        );
    }
}