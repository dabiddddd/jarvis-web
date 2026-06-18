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

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setCurrentPath('')}
            className="text-jarvis-blue hover:underline"
          >
            workspace
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-gray-500">/</span>
              <button
                onClick={() =>
                  setCurrentPath(pathParts.slice(0, i + 1).join('/'))
                }
                className="text-jarvis-blue hover:underline"
              >
                {part}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading...</div>
        ) : files.length === 0 ? (
          <div className="p-4 text-center text-gray-400">Empty directory</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {currentPath && (
              <button
                onClick={() =>
                  setCurrentPath(
                    pathParts.slice(0, -1).join('/')
                  )
                }
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-jarvis-gray text-left"
              >
                <span className="text-gray-400">..</span>
                <span className="text-gray-400 text-sm">Parent directory</span>
              </button>
            )}
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
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-jarvis-gray text-left"
              >
                <span className="text-jarvis-blue font-mono">
                  {file.isDirectory ? '/' : '.'}
                </span>
                <span className="flex-1 truncate">{file.name}</span>
                {!file.isDirectory && (
                  <span className="text-gray-500 text-sm">
                    {formatSize(file.size)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
