
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
  FileText,
  Search,
  Plus,
  X,
  Upload
} from 'lucide-react';
import EnhancedEditor from '../../../../components/EnhancedEditor';
import { generateSlug, calculateReadingTime, generateExcerpt } from '../../../../lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
}

export default function EnhancedNewArticle() {
  const router = useRouter();
  
  // Article content
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('<p>Start writing your article...</p>');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [template, setTemplate] = useState('default');
  
  // Featured image
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  
  // Categories and tags
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  
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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'featured' | 'og'>('featured');
  const [readingTime, setReadingTime] = useState(0);

  // Load categories and tags
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  // Auto-populate SEO fields
  useEffect(() => {
    if (title && !metaTitle) setMetaTitle(title);
    if (excerpt && !metaDescription) setMetaDescription(excerpt);
    if (title && !ogTitle) setOgTitle(title);
    if (excerpt && !ogDescription) setOgDescription(excerpt);
  }, [title, excerpt, metaTitle, metaDescription, ogTitle, ogDescription]);

  // Calculate reading time
  useEffect(() => {
    setReadingTime(calculateReadingTime(content));
  }, [content]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (!excerpt) {
      setExcerpt(generateExcerpt(newContent));
    }
  };

  const addTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName,
          slug: generateSlug(newTagName),
          color: '#6366f1'
        })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        setSelectedTags([...selectedTags, newTag.id]);
        setNewTagName('');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const { url } = await response.json();
        if (imageUploadMode === 'featured') {
          setFeaturedImage(url);
        } else {
          setOgImage(url);
        }
        setShowImageUpload(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSave = async (publishStatus = status) => {
    setSaving(true);
    try {
      const articleData = {
        title,
        slug,
        content,
        excerpt: excerpt || generateExcerpt(content),
        featured_image: featuredImage,
        featured_image_alt: featuredImageAlt,
        status: publishStatus,
        author_id: 'admin-1', // In real app, get from auth
        category_id: selectedCategory || null,
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        og_title: ogTitle,
        og_description: ogDescription,
        og_image: ogImage,
        scheduled_at: scheduledAt || null,
        published_at: publishStatus === 'published' ? new Date().toISOString() : null,
        reading_time: readingTime,
        template,
        custom_fields: JSON.stringify(customFields),
        tags: selectedTags
      };

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'seo', label: 'SEO & Social', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const templates = [
    { value: 'default', label: 'Default Article' },
    { value: 'featured', label: 'Featured Article' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'review', label: 'Product Review' },
    { value: 'news', label: 'News Article' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Article
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {readingTime} min read
              </span>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                className="w-full text-2xl font-bold border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none"
              />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-url-slug"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Article Content
                      </label>
                      <EnhancedEditor
                        content={content}
                        onChange={handleContentChange}
                        placeholder="Start writing your article..."
                        autoSave={true}
                        showWordCount={true}
                        showReadingTime={true}
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Article Excerpt
                      </label>
                      <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief description of your article..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {excerpt.length}/160 characters recommended for SEO
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    {/* Meta SEO */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Search className="h-5 w-5 mr-2" />
                        Search Engine Optimization
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          placeholder="SEO optimized title..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metaTitle.length}/60 characters recommended
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          placeholder="Brief description for search engines..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metaDescription.length}/160 characters recommended
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
                          placeholder="keyword1, keyword2, keyword3..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Open Graph */}
                    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Globe className="h-5 w-5 mr-2" />
                        Social Media (Open Graph)
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Social Title
                        </label>
                        <input
                          type="text"
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          placeholder="Title for social media sharing..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Social Description
                        </label>
                        <textarea
                          value={ogDescription}
                          onChange={(e) => setOgDescription(e.target.value)}
                          placeholder="Description for social media sharing..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Social Image
                        </label>
                        <div className="flex items-center space-x-4">
                          {ogImage ? (
                            <div className="relative">
                              <img
                                src={ogImage}
                                alt="Social media preview"
                                className="w-32 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                              />
                              <button
                                onClick={() => setOgImage('')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-32 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setImageUploadMode('og');
                              setShowImageUpload(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Template */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Article Template
                      </label>
                      <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {templates.map((tmpl) => (
                          <option key={tmpl.value} value={tmpl.value}>
                            {tmpl.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Publishing Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Publication Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>

                    {status === 'scheduled' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Schedule For
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Custom Fields */}
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
                            // Invalid JSON, don't update
                          }
                        }}
                        placeholder='{"customField": "value"}'
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Featured Image
              </h3>
              
              {featuredImage ? (
                <div className="relative">
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || 'Featured image'}
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => setFeaturedImage('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No image selected</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => {
                    setImageUploadMode('featured');
                    setShowImageUpload(true);
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Featured Image
                </button>
                
                {featuredImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={featuredImageAlt}
                      onChange={(e) => setFeaturedImageAlt(e.target.value)}
                      placeholder="Describe the image for accessibility..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Folder className="h-5 w-5 mr-2" />
                Category
              </h3>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              {selectedCategory && (
                <div className="mt-2 flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color || '#6366f1' }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button
                          onClick={() => removeTag(tagId)}
                          className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Available Tags */}
              <div className="space-y-3">
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {tags.filter(tag => !selectedTags.includes(tag.id)).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTags([...selectedTags, tag.id])}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tag.usage_count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Add New Tag */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag name..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    onClick={addTag}
                    disabled={!newTagName.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Article Preview
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reading Time:</span>
                  <span className="text-gray-900 dark:text-white">{readingTime} min</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'None'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                  <span className="text-gray-900 dark:text-white">{selectedTags.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Upload {imageUploadMode === 'featured' ? 'Featured' : 'Social'} Image
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-block"
                >
                  Select Image
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
