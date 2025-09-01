import type { R2Bucket } from '@cloudflare/workers-types';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export class R2Service {
    private bucketName: string;

    constructor(private bucket: R2Bucket, bucketName?: string) {
        // Use environment variable or fallback to provided name
        this.bucketName = bucketName || process.env.R2_BUCKET_NAME || 'blog-cms-media';
    }

    async uploadImage(file: File, filename?: string): Promise<UploadResult> {
        try {
            // Generate a unique filename if not provided
            const uniqueFilename = filename || `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;

            // Create the key with a folder structure
            const key = `images/${uniqueFilename}`;

            // Convert File to ArrayBuffer for R2 compatibility
            const arrayBuffer = await file.arrayBuffer();
            await this.bucket.put(key, arrayBuffer, {
                httpMetadata: {
                    contentType: file.type,
                },
            });

            // Generate the public URL using environment variable or default
            const publicUrl = process.env.R2_PUBLIC_URL || `https://${this.bucketName}.r2.dev`;
            const url = `${publicUrl}/${key}`;

            return {
                success: true,
                url
            };
        } catch (error) {
            console.error('Error uploading to R2:', error);
            return {
                success: false,
                error: 'Failed to upload image'
            };
        }
    }

    async deleteImage(key: string): Promise<boolean> {
        try {
            await this.bucket.delete(key);
            return true;
        } catch (error) {
            console.error('Error deleting from R2:', error);
            return false;
        }
    }

    async listImages(prefix: string = 'images/'): Promise<string[]> {
        try {
            const objects = await this.bucket.list({ prefix });
            return objects.objects.map((obj: { key: string }) => obj.key);
        } catch (error) {
            console.error('Error listing R2 objects:', error);
            return [];
        }
    }

    generatePresignedUrl(key: string): string {
        // Generate the public URL using environment variable or default
        const publicUrl = process.env.R2_PUBLIC_URL || `https://${this.bucketName}.r2.dev`;
        return `${publicUrl}/${key}`;
    }
}

export function getR2BucketFromRequest(request: Request): R2Bucket | null {
    return (request as unknown as { env?: { MEDIA_BUCKET?: R2Bucket } }).env?.MEDIA_BUCKET || null;
}
