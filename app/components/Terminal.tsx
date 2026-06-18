'use client';

import { useState, useRef, useEffect } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Jarvis Terminal v1.0' },
    { type: 'output', content: 'Type commands below. Type "clear" to clear screen.' },
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
      className="h-full bg-black p-4 overflow-y-auto font-mono text-sm cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={`whitespace-pre-wrap ${
            line.type === 'input'
              ? 'text-jarvis-blue'
              : line.type === 'error'
              ? 'text-red-400'
              : 'text-gray-300'
          }`}
        >
          {line.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
        <span className="text-jarvis-blue">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 bg-transparent outline-none text-gray-300 disabled:opacity-50"
          autoFocus
        />
      </form>
    </div>
  );
}
