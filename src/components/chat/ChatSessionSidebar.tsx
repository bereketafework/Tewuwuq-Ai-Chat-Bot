
'use client';

import type { ChatSession } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MessageSquarePlus, Trash2, Edit3, Check, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ChatSessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  // onRenameSession: (sessionId: string, newTitle: string) => void; // Add if implementing rename
}

export function ChatSessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  // onRenameSession,
}: ChatSessionSidebarProps) {
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleRenameStart = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setNewTitle(session.title);
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (newTitle.trim()) {
      // onRenameSession(sessionId, newTitle.trim()); // Uncomment when rename is fully implemented in useChat
      console.warn("Rename functionality not fully wired up in useChat yet. Session ID:", sessionId, "New Title:", newTitle.trim());
      setRenamingSessionId(null);
    }
  };

  const handleRenameCancel = () => {
    setRenamingSessionId(null);
    setNewTitle('');
  };
  
  useEffect(() => {
    // If the active session is deleted, and a rename was in progress for it, cancel rename.
    if (renamingSessionId && !sessions.find(s => s.id === renamingSessionId)) {
      handleRenameCancel();
    }
  }, [sessions, renamingSessionId]);

  return (
    <aside className="w-full md:w-72 lg:w-80 bg-card text-card-foreground border-r border-border flex flex-col h-full max-h-screen p-0 md:p-0">
      <div className="p-3 border-b border-border shrink-0">
        <Button onClick={onNewChat} variant="outline" className="w-full justify-start text-accent-foreground hover:bg-accent/90 bg-accent">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-grow p-2">
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 px-4">
            <MessageCircle className="mx-auto h-12 w-12 opacity-50 mb-2" />
            <p className="text-sm">No chat sessions yet.</p>
            <p className="text-xs">Start a new conversation to see it here.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                {renamingSessionId === session.id ? (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <Input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(session.id);
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      className="h-8 flex-grow bg-background focus-visible:ring-primary"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => handleRenameSubmit(session.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={handleRenameCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-md text-sm truncate flex justify-between items-center group',
                      activeSessionId === session.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/80 text-foreground',
                    )}
                    title={session.title}
                  >
                    <span className="truncate flex-grow mr-2">{session.title}</span>
                    <div className="flex-shrink-0 space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {/* Rename button can be added back if full functionality is wired up 
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6 p-0", 
                          activeSessionId === session.id ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={(e) => { e.stopPropagation(); handleRenameStart(session); }}
                        aria-label="Rename session"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 p-0", 
                              activeSessionId === session.id ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={(e) => { e.stopPropagation(); setSessionToDelete(session.id); }}
                            aria-label="Delete session"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        {/* Ensure DialogContent is only rendered when sessionToDelete matches */}
                        {sessionToDelete === session.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Chat: "{session.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete this chat session and its messages. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => { 
                                  onDeleteSession(session.id); 
                                  setSessionToDelete(null); 
                                }} 
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <div className="p-2 border-t border-border mt-auto text-center text-xs text-muted-foreground shrink-0">
        <p>&copy; {new Date().getFullYear()} ትውውቅ (Tewuwuq)</p>
      </div>
    </aside>
  );
}
