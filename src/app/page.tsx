
'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSessionSidebar } from '@/components/chat/ChatSessionSidebar';
import { useChat } from '@/hooks/useChat';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ChatHistoryControls } from '@/components/chat/ChatHistoryControls';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Loader2 } from 'lucide-react';

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
    clearActiveSessionHistory,
    isAnalyzingSession, // Added from useChat
  } = useChat();

  const activeSessionTitle = activeSessionId ? (sessions.find(s => s.id === activeSessionId)?.title || "Chat") : "ትውውቅ (Tewuwuq)";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen max-h-screen bg-background text-foreground overflow-hidden relative"> {/* Added relative for overlay */}
        {isAnalyzingSession && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center p-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-xl font-semibold text-foreground">Analyzing Session...</p>
              <p className="text-sm text-muted-foreground">Please wait while the AI processes the chat history.</p>
          </div>
        )}
        <Sidebar side="left" collapsible="icon" className="border-r border-border bg-card">
          <ChatSessionSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={selectSession}
            onNewChat={startNewSession}
            onDeleteSession={deleteSession}
          />
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-col h-full w-full">
            {/* Header for the main content panel */}
            <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-card shadow-sm">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="ml-3 text-lg font-semibold text-foreground truncate max-w-[calc(100vw-250px)] md:max-w-xs lg:max-w-sm xl:max-w-md" title={activeSessionTitle}> {/* Adjusted max-width */}
                  {activeSessionTitle}
                </h1>
              </div>
              {activeSessionId && <ChatHistoryControls onClearHistory={clearActiveSessionHistory} activeSessionId={activeSessionId} />}
            </div>

            {/* Main chat content area */}
            <div className="flex-grow flex flex-col overflow-hidden">
              {activeSessionId ? (
                <ChatInterface
                  key={activeSessionId} // Ensures re-render on session change
                  messages={currentMessages}
                  isLoadingAI={isLoadingAI}
                  onSendMessage={sendMessage}
                  currentSessionId={activeSessionId}
                />
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-4 bg-gradient-to-br from-background to-muted/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square-plus mb-4 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" x2="15" y1="10" y2="10"/><line x1="12" x2="12" y1="7" y2="13"/></svg>
                  <h2 className="text-2xl font-semibold mb-2">Welcome to ትውውቅ (Tewuwuq)</h2>
                  <p className="mb-4">Start a new conversation or select one from the sidebar.</p>
                  <Button 
                    onClick={startNewSession}
                    variant="default"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" /> 
                    Start New Chat
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
