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
  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'files' as const, label: 'Files', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { id: 'terminal' as const, label: 'Terminal', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div className="w-64 bg-jarvis-darker border-r border-jarvis-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-jarvis-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-jarvis-accent/10 flex items-center justify-center border border-jarvis-accent/30">
            <svg className="w-5 h-5 text-jarvis-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <span className="font-heading text-sm font-bold text-jarvis-text tracking-wider">JARVIS</span>
            <p className="text-[10px] text-jarvis-muted tracking-widest">v1.0</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className="w-full py-2.5 px-4 bg-jarvis-accent/10 hover:bg-jarvis-accent/20 text-jarvis-accent rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 border border-jarvis-accent/20 hover:border-jarvis-accent/40 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 mb-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full py-2.5 px-4 rounded-lg text-left text-sm flex items-center gap-3 transition-all duration-200 mb-1 cursor-pointer ${
              view === item.id
                ? 'bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/30'
                : 'text-jarvis-muted hover:bg-jarvis-card hover:text-jarvis-text border border-transparent'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="text-[10px] text-jarvis-muted uppercase tracking-widest px-3 py-2 font-medium">
          History
        </div>
        {conversations.length === 0 ? (
          <p className="text-jarvis-muted/50 text-xs px-3 py-4">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 mb-1 ${
                activeConversation === conv.id
                  ? 'bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/30'
                  : 'text-jarvis-muted hover:bg-jarvis-card hover:text-jarvis-text border border-transparent'
              }`}
              onClick={() => {
                onSelectConversation(conv.id);
                onViewChange('chat');
              }}
            >
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="flex-1 truncate text-xs">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-jarvis-muted hover:text-red-400 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-jarvis-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-jarvis-accent animate-pulse" />
          <span className="text-[10px] text-jarvis-muted tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>
    </div>
  );
}
