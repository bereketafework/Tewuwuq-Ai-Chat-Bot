
'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSessionSidebar } from '@/components/chat/ChatSessionSidebar';
import { useChat } from '@/hooks/useChat';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ChatHistoryControls } from '@/components/chat/ChatHistoryControls';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Loader2, MessageCircle } from 'lucide-react'; // Added MessageCircle

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
    clearActiveSessionHistory, // This now deletes the session
    isAnalyzingSession,
  } = useChat();

  const activeSessionTitle = activeSessionId ? (sessions.find(s => s.id === activeSessionId)?.title || "Chat") : "ትውውቅ (Tewuwuq)";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen max-h-screen bg-background text-foreground overflow-hidden relative">
        {isAnalyzingSession && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center p-4 transition-opacity duration-300 ease-in-out">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-xl font-semibold text-foreground">Analyzing Session...</p>
              <p className="text-sm text-muted-foreground">Please wait while the AI processes the chat history.</p>
          </div>
        )}
        <Sidebar side="left" collapsible="icon" className="border-r border-sidebar-border bg-sidebar group-data-[collapsible=icon]:bg-sidebar">
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
            <header className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-card shadow-sm"> {/* Header uses card bg */}
              <div className="flex items-center min-w-0"> 
                <SidebarTrigger />
                <h1 className="ml-3 text-lg font-semibold text-foreground truncate" title={activeSessionTitle}> 
                  {activeSessionTitle}
                </h1>
              </div>
              {activeSessionId && <ChatHistoryControls onClearHistory={clearActiveSessionHistory} activeSessionId={activeSessionId} />}
            </header>

            <main className="flex-grow flex flex-col overflow-hidden"> {/* Changed div to main for semantics */}
              {activeSessionId ? (
                <ChatInterface
                  key={activeSessionId} 
                  messages={currentMessages}
                  isLoadingAI={isLoadingAI}
                  onSendMessage={sendMessage}
                  currentSessionId={activeSessionId}
                />
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-6 bg-gradient-to-br from-background to-muted/30"> {/* Softer gradient */}
                  <MessageCircle className="lucide lucide-message-circle-heart mb-6 h-16 w-16 opacity-40 text-primary" /> {/* Larger icon */}
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">Welcome to ትውውቅ (Tewuwuq)</h2>
                  <p className="mb-6 max-w-md text-muted-foreground">
                    Start a new conversation by clicking the button below or select an existing one from the sidebar.
                  </p>
                  <Button 
                    onClick={startNewSession}
                    variant="default"
                    size="lg" // Larger button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                  >
                    <MessageSquarePlus className="mr-2 h-5 w-5" /> 
                    Start New Chat
                  </Button>
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
