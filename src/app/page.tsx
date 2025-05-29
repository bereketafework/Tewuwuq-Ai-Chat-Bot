'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSessionSidebar } from '@/components/chat/ChatSessionSidebar';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const { 
    sessions, 
    activeSessionId, 
    currentMessages, 
    isLoadingAI, 
    sendMessage, 
    startNewSession, 
    selectSession, 
    deleteSession,
    clearActiveSessionHistory 
  } = useChat();

  return (
    <div className="flex h-screen max-h-screen bg-background text-foreground overflow-hidden">
      <ChatSessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={startNewSession}
        onDeleteSession={deleteSession}
      />
      <main className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50 p-0 md:p-4 overflow-hidden">
        {activeSessionId ? (
          <ChatInterface
            key={activeSessionId} // Ensure ChatInterface re-renders or resets state on session change
            messages={currentMessages}
            isLoadingAI={isLoadingAI}
            onSendMessage={sendMessage}
            onClearHistory={clearActiveSessionHistory}
            currentSessionId={activeSessionId}
            sessionTitle={sessions.find(s => s.id === activeSessionId)?.title || "Chat"}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square-plus mb-4 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" x2="15" y1="10" y2="10"/><line x1="12" x2="12" y1="7" y2="13"/></svg>
            <h2 className="text-2xl font-semibold mb-2">Welcome to ትውውቅ (Tewuwuq)</h2>
            <p className="mb-4">Start a new conversation or select one from the sidebar.</p>
            <button 
              onClick={startNewSession}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Start New Chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}