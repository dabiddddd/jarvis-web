'use client';

import { useState, useRef, useEffect } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Jarvis Terminal v1.0' },
    { type: 'output', content: 'Type "clear" to clear screen.' },
    { type: 'output', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const command = input.trim();
    setInput('');
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    if (command === 'clear') {
      setLines([]);
      return;
    }

    setLines((prev) => [...prev, { type: 'input', content: `$ ${command}` }]);
    setLoading(true);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const data = await res.json();

      if (data.stdout) {
        setLines((prev) => [...prev, { type: 'output', content: data.stdout }]);
      }
      if (data.stderr) {
        setLines((prev) => [...prev, { type: 'error', content: data.stderr }]);
      }
      if (data.exitCode !== 0 && !data.stdout && !data.stderr) {
        setLines((prev) => [
          ...prev,
          { type: 'error', content: `Exit code: ${data.exitCode}` },
        ]);
      }
    } catch (error) {
      setLines((prev) => [
        ...prev,
        { type: 'error', content: 'Failed to execute command' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-full bg-jarvis-darker p-3 md:p-4 overflow-y-auto cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-jarvis-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-jarvis-muted text-xs ml-2 font-mono">terminal</span>
      </div>

      {/* Output lines */}
      {lines.map((line, i) => (
        <div
          key={i}
          className={`font-mono text-xs md:text-sm mb-1 ${
            line.type === 'input'
              ? 'text-jarvis-accent'
              : line.type === 'error'
              ? 'text-red-400'
              : 'text-jarvis-text'
          }`}
        >
          <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
        </div>
      ))}

      {/* Input line */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
        <span className="text-jarvis-accent font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 bg-transparent outline-none text-jarvis-text font-mono text-xs md:text-sm disabled:opacity-50"
          autoFocus
        />
      </form>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-jarvis-accent animate-pulse" />
          <span className="text-jarvis-muted text-xs font-mono">processing...</span>
        </div>
      )}
    </div>
  );
}
