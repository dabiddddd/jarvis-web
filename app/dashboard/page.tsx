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
        <div className="animate-pulse text-jarvis-blue text-2xl">Loading...</div>
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
        <header className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="text-jarvis-blue font-bold">JARVIS</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-sm capitalize">{view}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{session.user?.email}</span>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-400 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

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
