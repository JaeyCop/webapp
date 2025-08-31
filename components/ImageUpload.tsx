'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onClose: () => void;
}

export default function ImageUpload({ onUpload, onClose }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('admin-token');
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess('Image uploaded successfully!');
                setTimeout(() => {
                    onUpload(result.url);
                    onClose();
                }, 1000);
            } else {
                setError(result.message || 'Upload failed');
            }
        } catch (error) {
            setError('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Image</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-700 text-sm">{success}</span>
                    </div>
                )}

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            ) : (
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            )}
                        </div>

                        <div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                                {uploading ? 'Uploading...' : 'Drop your image here'}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                or click to browse files
                            </p>
                        </div>

                        <button
                            onClick={handleClick}
                            disabled={uploading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Choose File'}
                        </button>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                        <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                        <p>Maximum size: 5MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
