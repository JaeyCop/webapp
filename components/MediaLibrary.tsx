'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  Search,
  Grid,
  List,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  File,
  Trash2,
  Edit,
  Download,
  Eye,
  X,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { formatFileSize, formatDate, isImageFile } from '../lib/utils';

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  caption?: string;
  folder_id?: string;
  width?: number;
  height?: number;
  created_at: string;
  folder_name?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parent_id?: string;
  file_count?: number;
  created_at: string;
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void;
  multiple?: boolean;
  allowedTypes?: string[];
  maxFileSize?: number;
}

export default function MediaLibrary({
  onSelect,
  multiple = false,
  allowedTypes = ['image/*'],
  maxFileSize = 5 * 1024 * 1024 // 5MB
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, [currentFolder]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const url = currentFolder 
        ? `/api/admin/media?folder=${currentFolder}`
        : '/api/admin/media';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/media/folders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileUpload = async (uploadedFiles: FileList) => {
    setUploading(true);
    
    for (const file of Array.from(uploadedFiles)) {
      // Validate file type
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      
      if (!isAllowed) {
        alert(`File type ${file.type} is not allowed`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
        continue;
      }
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
          formData.append('folder_id', currentFolder);
        }
        
        const token = localStorage.getItem('admin-token');
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
    fetchFiles();
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/media/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFolderName,
          parent_id: currentFolder
        }),
      });
      
      if (response.ok) {
        setNewFolderName('');
        setShowNewFolder(false);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/media/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const filteredFiles = files
    .filter(file => 
      file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.alt_text && file.alt_text.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.original_filename.localeCompare(b.original_filename);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const currentFolderData = folders.find(f => f.id === currentFolder);
  const subFolders = folders.filter(f => f.parent_id === currentFolder);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Library</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowNewFolder(true)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="New Folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <button
            onClick={() => setCurrentFolder(null)}
            className="hover:text-gray-900 dark:hover:text-white"
          >
            Media Library
          </button>
          {currentFolderData && (
            <>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{currentFolderData.name}</span>
            </>
          )}
        </div>

        {/* Search and Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-b border-gray-200 dark:border-gray-600 p-4">
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <input
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Folders */}
            {subFolders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Folders</h3>
                <div className={viewMode === 'grid' ? 'grid grid-cols-6 gap-4' : 'space-y-2'}>
                  {subFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolder(folder.id)}
                      className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Folder className="h-5 w-5 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {folder.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {folder.file_count || 0} files
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {filteredFiles.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Files</h3>
                <div className={viewMode === 'grid' ? 'grid grid-cols-6 gap-4' : 'space-y-2'}>
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                        selectedFiles.has(file.id) ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative group">
                          {isImageFile(file.mime_type) ? (
                            <img
                              src={file.file_path}
                              alt={file.alt_text || file.original_filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <File className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {onSelect && (
                                <button
                                  onClick={() => onSelect(file)}
                                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteFile(file.id)}
                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            {isImageFile(file.mime_type) ? (
                              <img
                                src={file.file_path}
                                alt={file.alt_text || file.original_filename}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <File className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.original_filename}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {onSelect && (
                              <button
                                onClick={() => onSelect(file)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {viewMode === 'grid' && (
                        <div className="p-2">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {file.original_filename}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload some files to get started.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolder(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold">{previewFile.original_filename}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {isImageFile(previewFile.mime_type) ? (
                <img
                  src={previewFile.file_path}
                  alt={previewFile.alt_text || previewFile.original_filename}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <File className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Preview not available</p>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Size:</strong> {formatFileSize(previewFile.file_size)}</p>
                <p><strong>Type:</strong> {previewFile.mime_type}</p>
                <p><strong>Uploaded:</strong> {formatDate(previewFile.created_at, 'long')}</p>
                {previewFile.width && previewFile.height && (
                  <p><strong>Dimensions:</strong> {previewFile.width} × {previewFile.height}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}