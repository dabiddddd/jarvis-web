'use client';

import { useState, useEffect } from 'react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
}

interface FileBrowserProps {
  onSelectFile: (path: string) => void;
}

export default function FileBrowser({ onSelectFile }: FileBrowserProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?action=list&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string, isDirectory: boolean) => {
    if (isDirectory) return 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z';
    const ext = name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      ts: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      tsx: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      js: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      json: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      md: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      css: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    };
    return icons[ext || ''] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  };

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="p-3 md:p-4 border-b border-jarvis-border glass">
        <div className="flex items-center gap-1 text-xs md:text-sm overflow-x-auto">
          <button
            onClick={() => setCurrentPath('')}
            className="text-jarvis-accent hover:text-jarvis-accent-dim transition-colors cursor-pointer px-2 py-1 rounded hover:bg-jarvis-accent/10 shrink-0"
          >
            workspace
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <svg className="w-3 h-3 text-jarvis-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => setCurrentPath(pathParts.slice(0, i + 1).join('/'))}
                className="text-jarvis-accent hover:text-jarvis-accent-dim transition-colors cursor-pointer px-2 py-1 rounded hover:bg-jarvis-accent/10 shrink-0"
              >
                {part}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-jarvis-accent/30 border-t-jarvis-accent rounded-full animate-spin" />
            <p className="text-jarvis-muted text-sm">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <svg className="w-12 h-12 text-jarvis-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-jarvis-muted text-sm">Empty directory</p>
          </div>
        ) : (
          <div className="divide-y divide-jarvis-border/50">
            {/* Parent directory */}
            {currentPath && (
              <button
                onClick={() => setCurrentPath(pathParts.slice(0, -1).join('/'))}
                className="w-full px-4 md:px-5 py-3 flex items-center gap-3 hover:bg-jarvis-card/50 text-left transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-jarvis-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-jarvis-muted text-sm">..</span>
              </button>
            )}

            {/* Files */}
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => {
                  if (file.isDirectory) {
                    setCurrentPath(file.path);
                  } else {
                    onSelectFile(file.path);
                  }
                }}
                className="w-full px-4 md:px-5 py-3 flex items-center gap-3 hover:bg-jarvis-card/50 text-left transition-colors cursor-pointer group"
              >
                <svg className={`w-4 h-4 shrink-0 ${file.isDirectory ? 'text-jarvis-blue' : 'text-jarvis-accent'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getFileIcon(file.name, file.isDirectory)} />
                </svg>
                <span className="flex-1 truncate text-jarvis-text group-hover:text-jarvis-accent transition-colors text-sm">{file.name}</span>
                {!file.isDirectory && (
                  <span className="text-jarvis-muted/50 text-xs">{formatSize(file.size)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
