'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface FileEditorProps {
  filePath: string;
  onClose: () => void;
}

export default function FileEditor({ filePath, onClose }: FileEditorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [filePath]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/files?action=read&path=${encodeURIComponent(filePath)}`
      );
      const data = await res.json();
      setContent(data.content || '');
      setModified(false);
    } catch (error) {
      console.error('Failed to fetch file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write',
          path: filePath,
          content,
        }),
      });
      setModified(false);
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setSaving(false);
    }
  };

  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languages: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      h: 'c',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      css: 'css',
      scss: 'scss',
      html: 'html',
      xml: 'xml',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell',
    };
    return languages[ext || ''] || 'plaintext';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 border-b border-gray-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            x
          </button>
          <span className="text-sm text-gray-300">{filePath}</span>
          {modified && <span className="text-yellow-400 text-sm">*</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContent}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white"
          >
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !modified}
            className="px-4 py-1 bg-jarvis-blue text-black text-sm font-medium rounded hover:bg-jarvis-blue-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading...
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage(filePath)}
            value={content}
            onChange={(value) => {
              setContent(value || '');
              setModified(true);
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 10 },
            }}
          />
        )}
      </div>
    </div>
  );
}
