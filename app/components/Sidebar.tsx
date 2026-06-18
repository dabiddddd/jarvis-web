'use client';

interface SidebarProps {
  view: 'chat' | 'files' | 'terminal';
  onViewChange: (view: 'chat' | 'files' | 'terminal') => void;
  conversations: any[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export default function Sidebar({
  view,
  onViewChange,
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <div className="w-64 bg-jarvis-darker border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-jarvis-blue/20 flex items-center justify-center">
            <span className="text-jarvis-blue font-bold text-sm">J</span>
          </div>
          <span className="font-bold text-jarvis-blue">JARVIS</span>
        </div>
      </div>

      <div className="p-2 border-b border-gray-800">
        <button
          onClick={onNewConversation}
          className="w-full py-2 px-3 bg-jarvis-blue/10 hover:bg-jarvis-blue/20 text-jarvis-blue rounded-lg transition-colors text-sm font-medium"
        >
          + New Chat
        </button>
      </div>

      <nav className="p-2 border-b border-gray-800">
        {[
          { id: 'chat', label: 'Chat', icon: '...' },
          { id: 'files', label: 'Files', icon: '...' },
          { id: 'terminal', label: 'Terminal', icon: '>' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as any)}
            className={`w-full py-2 px-3 rounded-lg text-left text-sm flex items-center gap-2 transition-colors ${
              view === item.id
                ? 'bg-jarvis-blue/20 text-jarvis-blue'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="font-mono">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2">
          Conversations
        </div>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              activeConversation === conv.id
                ? 'bg-jarvis-blue/20 text-jarvis-blue'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            onClick={() => {
              onSelectConversation(conv.id);
              onViewChange('chat');
            }}
          >
            <span className="flex-1 truncate">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
