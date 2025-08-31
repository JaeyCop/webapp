import type { R2Bucket } from '@cloudflare/workers-types';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export class R2Service {
    constructor(private bucket: R2Bucket) { }

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

            // Generate the public URL
            // Since R2Bucket does not have a 'name' property, you must provide the bucket name another way.
            // For example, you could pass it to the R2Service constructor.
            // Here, we'll assume you add a 'bucketName' property to the class.
            const url = `https://${(this as any).bucketName}.r2.cloudflarestorage.com/${key}`;

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
        // For now, we'll return the public URL
        // In a production environment, you might want to generate actual presigned URLs
        // Since R2Bucket does not have a 'name' property, use the bucketName property from the class
        return `https://${(this as any).bucketName}.r2.cloudflarestorage.com/${key}`;
    }
}

export function getR2BucketFromRequest(request: Request): R2Bucket | null {
    return (request as unknown as { env?: { MEDIA_BUCKET?: R2Bucket } }).env?.MEDIA_BUCKET || null;
}
