
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
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'; // Using sidebar structure components

interface ChatSessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export function ChatSessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSessionSidebarProps) {
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null); // Keep for future rename
  const [newTitle, setNewTitle] = useState(''); // Keep for future rename
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Simplified rename handlers for now, not fully wired to useChat
  const handleRenameStart = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setNewTitle(session.title);
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (newTitle.trim()) {
      console.warn("Rename functionality not fully implemented yet. Session ID:", sessionId, "New Title:", newTitle.trim());
      // onRenameSession(sessionId, newTitle.trim()); // This would be the call
      setRenamingSessionId(null);
    }
  };

  const handleRenameCancel = () => {
    setRenamingSessionId(null);
    setNewTitle('');
  };
  
  useEffect(() => {
    if (renamingSessionId && !sessions.find(s => s.id === renamingSessionId)) {
      handleRenameCancel();
    }
  }, [sessions, renamingSessionId]);

  return (
    <>
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <Button 
          onClick={onNewChat} 
          variant="default" // Primary action
          className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-grow group-data-[collapsible=icon]:overflow-hidden">
        <ScrollArea className="h-full w-full">
          {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 px-4 h-full flex flex-col justify-center items-center group-data-[collapsible=icon]:hidden">
              <MessageCircle className="mx-auto h-10 w-10 opacity-50 mb-3" />
              <p className="text-sm font-medium">No Chats Yet</p>
              <p className="text-xs mt-1">Click "New Chat" to start.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li key={session.id}>
                  {renamingSessionId === session.id ? (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted group-data-[collapsible=icon]:hidden">
                      <Input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(session.id);
                          if (e.key === 'Escape') handleRenameCancel();
                        }}
                        className="h-8 flex-grow bg-background focus-visible:ring-primary text-sm"
                        autoFocus
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handleRenameSubmit(session.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={handleRenameCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectSession(session.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectSession(session.id);
                        }
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm truncate flex justify-between items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-background',
                        activeSessionId === session.id
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-inner' // Active state more prominent
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground', 
                        'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:px-0' // Icon mode styling
                      )}
                      title={session.title}
                    >
                      <span className="truncate flex-grow mr-2 group-data-[collapsible=icon]:hidden">{session.title}</span>
                       <span className="truncate hidden group-data-[collapsible=icon]:inline text-xs font-semibold">
                        {session.title.substring(0,1).toUpperCase()}
                       </span>
                      <div className="flex-shrink-0 space-x-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden"> {/* Actions hidden in icon mode */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-6 w-6 p-0", 
                                activeSessionId === session.id ? "text-sidebar-primary-foreground/70 hover:text-sidebar-primary-foreground" : "text-muted-foreground hover:text-destructive" // More subtle delete
                              )}
                              onClick={(e) => { e.stopPropagation(); setSessionToDelete(session.id); }}
                              aria-label="Delete session"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          {sessionToDelete === session.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chat: "{sessions.find(s => s.id === sessionToDelete)?.title}"?</AlertDialogTitle>
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
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Delete Session
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-sidebar-border text-center text-xs text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden">
        <p>&copy; {new Date().getFullYear()} ትውውቅ</p> {/* Simplified footer */}
      </SidebarFooter>
    </>
  );
}
