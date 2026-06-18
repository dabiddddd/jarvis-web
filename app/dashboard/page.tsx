'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import FileBrowser from '../components/FileBrowser';
import FileEditor from '../components/FileEditor';
import Terminal from '../components/Terminal';

type View = 'chat' | 'files' | 'terminal';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<View>('chat');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-jarvis-accent/30 border-t-jarvis-accent rounded-full animate-spin" />
          <p className="text-jarvis-muted font-heading text-sm tracking-widest">INITIALIZING</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar
        view={view}
        onViewChange={setView}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onNewConversation={() => {
          setActiveConversation(null);
          setView('chat');
        }}
        onDeleteConversation={async (id) => {
          await fetch('/api/conversations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          fetchConversations();
        }}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-jarvis-border flex items-center px-6 justify-between glass">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jarvis-accent animate-pulse" />
              <span className="font-heading text-sm font-semibold text-jarvis-accent tracking-wider">JARVIS</span>
            </div>
            <div className="w-px h-4 bg-jarvis-border" />
            <span className="text-jarvis-muted text-sm capitalize">{view}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-jarvis-muted text-sm">Sir</span>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-jarvis-muted hover:text-jarvis-accent text-sm transition-colors duration-200 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'chat' && (
            <Chat
              conversationId={activeConversation}
              onConversationCreated={(id) => {
                setActiveConversation(id);
                fetchConversations();
              }}
            />
          )}
          {view === 'files' && !selectedFile && (
            <FileBrowser onSelectFile={setSelectedFile} />
          )}
          {view === 'files' && selectedFile && (
            <FileEditor
              filePath={selectedFile}
              onClose={() => setSelectedFile(null)}
            />
          )}
          {view === 'terminal' && <Terminal />}
        </div>
      </main>
    </div>
  );
}
