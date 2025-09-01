'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { createLowlight } from 'lowlight';
import {
  Save,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Table as TableIcon,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Underline,
  Highlighter,
  Clock,
  Hash
} from 'lucide-react';
import { debounce, calculateReadingTime } from '../lib/utils';
import ImageUpload from './ImageUpload';

// Create lowlight instance
const lowlight = createLowlight();

interface EnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: (content: string) => void;
  placeholder?: string;
  autoSave?: boolean;
  showWordCount?: boolean;
  showReadingTime?: boolean;
}

export default function EnhancedEditor({
  content,
  onChange,
  onSave,
  placeholder = 'Start writing your article...',
  autoSave = true,
  showWordCount = true,
  showReadingTime = true
}: EnhancedEditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      updateStats(html);

      if (autoSave) {
        debouncedAutoSave(html);
      }
    },
  });

  const updateStats = useCallback((html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(calculateReadingTime(html));
  }, []);

  const debouncedAutoSave = useCallback(
    debounce((content: string) => {
      if (onSave) {
        onSave(content);
        setLastSaved(new Date());
      }
    }, 2000),
    [onSave]
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      updateStats(content);
    }
  }, [content, editor, updateStats]);

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

  const addTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  const addCodeBlock = () => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock().run();
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-500 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('strike') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-500 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-500 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>

          {/* Block Elements */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-500 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('blockquote') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              onClick={addCodeBlock}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('codeBlock') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>

          {/* Media & Links */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-500 pr-2 mr-2">
            <button
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              onClick={addLink}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                editor.isActive('link') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
              }`}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              onClick={addTable}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
      </div>

      {/* Stats Bar */}
      {(showWordCount || showReadingTime) && (
        <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-4">
            {showWordCount && (
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>{wordCount} words</span>
              </div>
            )}
            {showReadingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{readingTime} min read</span>
              </div>
            )}
          </div>
          {autoSave && lastSaved && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

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