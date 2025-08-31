'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Upload,
    Trash2,
    Copy,
    CheckCircle,
    Image as ImageIcon,
    Download
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface MediaItem {
    key: string;
    url: string;
}

export default function MediaLibrary() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const response = await fetch('/api/admin/upload', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMedia(data.images || []);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (url: string) => {
        // Refresh the media list after upload
        fetchMedia();
    };

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    };

    const deleteImage = async (key: string) => {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const token = localStorage.getItem('admin-token');
            const response = await fetch(`/api/admin/upload/${encodeURIComponent(key)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMedia(media.filter(item => item.key !== key));
            } else {
                alert('Failed to delete image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error deleting image');
        }
    };

    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Dashboard
                            </Link>
                            <ImageIcon className="h-8 w-8 text-indigo-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                        </div>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <ImageIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Images</p>
                                <p className="text-2xl font-bold text-gray-900">{media.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Grid */}
                {media.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {media.map((item) => (
                            <div key={item.key} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-square bg-gray-100 relative group">
                                    <img
                                        src={item.url}
                                        alt={item.key}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => copyToClipboard(item.url)}
                                                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                                title="Copy URL"
                                            >
                                                {copiedUrl === item.url ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-600" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => downloadImage(item.url, item.key.split('/').pop() || 'image')}
                                                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => deleteImage(item.key)}
                                                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <p className="text-sm text-gray-600 truncate" title={item.key}>
                                        {item.key.split('/').pop()}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate" title={item.url}>
                                        {item.url}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-4">No images uploaded yet</h3>
                        <p className="text-gray-600 mb-8">Start by uploading your first image to the media library.</p>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Your First Image
                        </button>
                    </div>
                )}
            </div>

            {/* Image Upload Modal */}
            {showUpload && (
                <ImageUpload
                    onUpload={handleImageUpload}
                    onClose={() => setShowUpload(false)}
                />
            )}
        </div>
    );
}
