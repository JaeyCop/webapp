'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Save,
    Eye,
    ArrowLeft,
    Image as ImageIcon,
    Link as LinkIcon,
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function NewArticle() {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [status, setStatus] = useState('draft');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const router = useRouter();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: '<p>Start writing your article...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
    });

    const addImage = () => {
        setShowImageUpload(true);
    };

    const handleImageUpload = (url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const handleSave = async (publish = false) => {
        if (!title.trim() || !editor) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('admin-token');
            const response = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content: editor.getHTML(),
                    excerpt,
                    status: publish ? 'published' : status
                }),
            });

            if (response.ok) {
                router.push('/admin/dashboard');
            } else {
                console.error('Failed to save article');
            }
        } catch (error) {
            console.error('Error saving article:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">New Article</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {saving ? 'Publishing...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Article Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter article title..."
                        />
                    </div>

                    {/* Excerpt Input */}
                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                            Excerpt (Optional)
                        </label>
                        <textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Brief description of the article..."
                        />
                    </div>

                    {/* Editor Toolbar */}
                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <div className="border-b border-gray-200 p-3 bg-gray-50">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    disabled={!editor.can().chain().focus().toggleBold().run()}
                                    className={`p-2 rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <Bold className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                                    className={`p-2 rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <Italic className="h-4 w-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-300"></div>
                                <button
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                    className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <Heading1 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                    className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <Heading2 className="h-4 w-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-300"></div>
                                <button
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <ListOrdered className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <Quote className="h-4 w-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-300"></div>
                                <button
                                    onClick={addImage}
                                    className="p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={addLink}
                                    className={`p-2 rounded ${editor.isActive('link') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-300"></div>
                                <button
                                    onClick={() => editor.chain().focus().undo().run()}
                                    disabled={!editor.can().chain().focus().undo().run()}
                                    className="p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <Undo className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().redo().run()}
                                    disabled={!editor.can().chain().focus().redo().run()}
                                    className="p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <Redo className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="bg-white">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Upload Modal */}
            {showImageUpload && (
                <ImageUpload
                    onUpload={handleImageUpload}
                    onClose={() => setShowImageUpload(false)}
                />
            )}
        </div>
    );
}
