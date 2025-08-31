'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Folder,
  Image as ImageIcon,
  Settings,
  Globe,
  FileText
} from 'lucide-react';
import EnhancedEditor from '../../../../components/EnhancedEditor';
import CategoryManager from '../../../../components/CategoryManager';
import MediaLibrary from '../../../../components/MediaLibrary';
import { generateSlug, calculateReadingTime, generateExcerpt } from '../../../../lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function EnhancedNewArticle() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('<p>Start writing your article...</p>');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [template, setTemplate] = useState('default');
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  
  // Custom fields
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryMode, setMediaLibraryMode] = useState<'featured' | 'og'>('featured');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [autoGenerateExcerpt, setAutoGenerateExcerpt] = useState(true);
  
  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (autoGenerateSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoGenerateSlug]);

  useEffect(() => {
    if (autoGenerateExcerpt && content) {
      const generatedExcerpt = generateExcerpt(content);
      setExcerpt(generatedExcerpt);
    }
  }, [content, autoGenerateExcerpt]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/tags', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSave = async (publishStatus?: 'draft' | 'published' | 'scheduled') => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    
    const finalStatus = publishStatus || status;
    const readingTime = calculateReadingTime(content);
    
    const articleData = {
      title,
      slug: slug || generateSlug(title),
      content,
      excerpt: excerpt || generateExcerpt(content),
      featured_image: featuredImage,
      featured_image_alt: featuredImageAlt,
      status: finalStatus,
      category_id: selectedCategory || null,
      tags: selectedTags,
      scheduled_at: finalStatus === 'scheduled' ? scheduledAt : null,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      reading_time: readingTime,
      template,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: metaKeywords,
      og_title: ogTitle,
      og_description: ogDescription,
      og_image: ogImage,
      custom_fields: JSON.stringify(customFields)
    };

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        const error = await response.json();
        alert(`Failed to save article: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (file: any) => {
    if (mediaLibraryMode === 'featured') {
      setFeaturedImage(file.file_path);
      setFeaturedImageAlt(file.alt_text || '');
    } else {
      setOgImage(file.file_path);
    }
    setShowMediaLibrary(false);
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Article
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              
              {status === 'scheduled' && (
                <button
                  onClick={() => handleSave('scheduled')}
                  disabled={saving || !scheduledAt}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </button>
              )}
              
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full text-3xl font-bold border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Enter your article title..."
              />
            </div>

            {/* Slug */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">URL:</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoGenerateSlug(false);
                }}
                className="flex-1 text-sm border-none bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-0"
                placeholder="article-slug"
              />
              <button
                onClick={() => {
                  setSlug(generateSlug(title));
                  setAutoGenerateSlug(true);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Auto-generate
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'content', label: 'Content', icon: FileText },
                  { id: 'seo', label: 'SEO', icon: Globe },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Editor */}
                <EnhancedEditor
                  content={content}
                  onChange={setContent}
                  autoSave={false}
                  showWordCount={true}
                  showReadingTime={true}
                />

                {/* Excerpt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Excerpt
                    </label>
                    <button
                      onClick={() => {
                        setExcerpt(generateExcerpt(content));
                        setAutoGenerateExcerpt(true);
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <textarea
                    value={excerpt}
                    onChange={(e) => {
                      setExcerpt(e.target.value);
                      setAutoGenerateExcerpt(false);
                    }}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of the article..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {excerpt.length}/160 characters
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="SEO title (leave empty to use article title)"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="SEO description (leave empty to use excerpt)"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {metaDescription.length}/160 characters
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Open Graph (Social Media)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Social media title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Image
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ogImage}
                          onChange={(e) => setOgImage(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Social media image URL"
                        />
                        <button
                          onClick={() => {
                            setMediaLibraryMode('og');
                            setShowMediaLibrary(true);
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      OG Description
                    </label>
                    <textarea
                      value={ogDescription}
                      onChange={(e) => setOgDescription(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Social media description"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="default">Default</option>
                      <option value="minimal">Minimal</option>
                      <option value="featured">Featured</option>
                      <option value="tutorial">Tutorial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publication Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                {status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Fields (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(customFields, null, 2)}
                    onChange={(e) => {
                      try {
                        setCustomFields(JSON.parse(e.target.value));
                      } catch {
                        // Invalid JSON, keep the text as is
                      }
                    }}
                    rows={6}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder='{"custom_field": "value"}'
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Add custom metadata as JSON
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Featured Image
              </h3>
              {featuredImage ? (
                <div className="space-y-3">
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Alt text for accessibility"
                  />
                  <button
                    onClick={() => {
                      setFeaturedImage('');
                      setFeaturedImageAlt('');
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMediaLibraryMode('featured');
                    setShowMediaLibrary(true);
                  }}
                  className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Choose featured image
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Category
                </h3>
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Manage
                </button>
              </div>
              
              {selectedCategoryData ? (
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: selectedCategoryData.color }}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedCategoryData.name}
                  </span>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="space-y-3">
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                          <button
                            onClick={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}
                            className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !selectedTags.includes(e.target.value)) {
                      setSelectedTags(prev => [...prev, e.target.value]);
                    }
                  }}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Add a tag</option>
                  {tags
                    .filter(tag => !selectedTags.includes(tag.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manage Categories
                </h2>
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <CategoryManager
                onSelect={(category) => {
                  setSelectedCategory(category.id);
                  setShowCategoryManager(false);
                }}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      )}

      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Media Library
                </h2>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <MediaLibrary
                onSelect={handleMediaSelect}
                allowedTypes={['image/*']}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}