'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export default function Chat({ conversationId, onConversationCreated }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  assistantMessage += data.chunk;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantMessage,
                    };
                    return updated;
                  });
                }
                if (data.done && data.conversationId) {
                  onConversationCreated(data.conversationId);
                }
                if (data.error) {
                  assistantMessage += `\n\nError: ${data.error}`;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantMessage,
                    };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-jarvis-accent/20 mb-4 md:mb-6 glow-green">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-jarvis-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h2 className="font-heading text-lg md:text-2xl font-bold text-jarvis-text mb-2">Good evening, sir.</h2>
              <p className="text-jarvis-muted text-xs md:text-sm">How may I assist you today?</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 md:px-5 md:py-4 ${
                msg.role === 'user'
                  ? 'bg-jarvis-accent text-white'
                  : 'bg-jarvis-card border border-jarvis-border text-jarvis-text'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg !bg-jarvis-darker !border !border-jarvis-border text-xs md:text-sm"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-jarvis-darker px-1.5 py-0.5 rounded text-jarvis-accent text-xs md:text-sm" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content || '...'}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t border-jarvis-border glass">
        <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Jarvis anything..."
              disabled={loading}
              rows={1}
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-jarvis-card border border-jarvis-border rounded-xl focus:outline-none focus:border-jarvis-accent text-jarvis-text placeholder-jarvis-muted/50 resize-none disabled:opacity-50 transition-all duration-200 text-sm md:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-3 md:px-6 md:py-3.5 bg-jarvis-accent text-white font-heading font-semibold rounded-xl hover:bg-jarvis-accent-dim transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer glow-green-hover"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
