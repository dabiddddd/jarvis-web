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
      {/* Header */}
      <div className="h-12 border-b border-jarvis-border flex items-center px-4 justify-between glass">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-jarvis-muted hover:text-jarvis-accent transition-colors cursor-pointer p-1 rounded hover:bg-jarvis-accent/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-jarvis-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-jarvis-text">{filePath}</span>
            {modified && (
              <span className="w-2 h-2 rounded-full bg-jarvis-accent animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContent}
            className="px-3 py-1.5 text-sm text-jarvis-muted hover:text-jarvis-text transition-colors cursor-pointer rounded hover:bg-jarvis-card"
          >
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !modified}
            className="px-4 py-1.5 bg-jarvis-accent text-jarvis-darker text-sm font-heading font-medium rounded-lg hover:bg-jarvis-accent-dim transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-jarvis-accent/30 border-t-jarvis-accent rounded-full animate-spin" />
              <p className="text-jarvis-muted text-sm">Loading file...</p>
            </div>
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
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              background: '#0F172A',
            }}
          />
        )}
      </div>
    </div>
  );
}
