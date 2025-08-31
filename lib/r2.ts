import { R2Bucket } from '@cloudflare/workers-types';

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

            // Upload the file to R2
            await this.bucket.put(key, file, {
                httpMetadata: {
                    contentType: file.type,
                },
            });

            // Generate the public URL
            const url = `https://${this.bucket.name}.r2.cloudflarestorage.com/${key}`;

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
            return objects.objects.map(obj => obj.key);
        } catch (error) {
            console.error('Error listing R2 objects:', error);
            return [];
        }
    }

    generatePresignedUrl(key: string, expiresIn: number = 3600): string {
        // For now, we'll return the public URL
        // In a production environment, you might want to generate actual presigned URLs
        return `https://${this.bucket.name}.r2.cloudflarestorage.com/${key}`;
    }
}

export function getR2BucketFromRequest(request: Request): R2Bucket | null {
    return (request as any).env?.MEDIA_BUCKET || null;
}
