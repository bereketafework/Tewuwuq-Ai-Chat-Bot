'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatSession } from '@/types/chat';
import { translateAndRespondInAmharic, type TranslateAndRespondInAmharicInput } from '@/ai/flows/translate-and-respond-in-amharic';
import { 
  loadChatSessions, 
  saveChatSessions, 
  clearAllChatSessions as clearAllSessionsFromLs,
  loadActiveSessionId,
  saveActiveSessionId,
  loadLegacyChatHistory, // For one-time migration
  clearLegacyChatHistory // For one-time migration
} from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const MAX_TITLE_LENGTH = 30;

function generateSessionTitle(firstMessageText?: string): string {
  if (!firstMessageText) {
    return `Chat ${new Date().toLocaleTimeString()}`;
  }
  const words = firstMessageText.split(' ');
  let title = words.slice(0, 5).join(' ');
  if (title.length > MAX_TITLE_LENGTH) {
    title = title.substring(0, MAX_TITLE_LENGTH) + '...';
  }
  return title || `Chat ${new Date().toLocaleTimeString()}`;
}


export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // One-time migration from legacy chat history
    const legacyMessages = loadLegacyChatHistory();
    let loadedSessions = loadChatSessions();

    if (legacyMessages.length > 0 && loadedSessions.length === 0) {
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: generateSessionTitle(legacyMessages[0]?.text),
        messages: legacyMessages,
        timestamp: legacyMessages[legacyMessages.length - 1]?.timestamp || Date.now(),
        createdAt: Date.now(),
      };
      loadedSessions = [newSession];
      saveChatSessions(loadedSessions);
      setActiveSessionIdState(newSession.id);
      saveActiveSessionId(newSession.id);
      clearLegacyChatHistory(); // Clear old history after migration
      toast({ title: "Chat history updated", description: "Your previous chat has been saved as a new session." });
    }
    
    setSessions(loadedSessions.sort((a, b) => b.createdAt - a.createdAt)); // Sort by creation date
    
    const storedActiveId = loadActiveSessionId();
    if (storedActiveId && loadedSessions.find(s => s.id === storedActiveId)) {
      setActiveSessionIdState(storedActiveId);
    } else if (loadedSessions.length > 0) {
      setActiveSessionIdState(loadedSessions[0].id); // Default to the newest session if no active one or active one is invalid
      saveActiveSessionId(loadedSessions[0].id);
    } else {
      setActiveSessionIdState(null);
      saveActiveSessionId(null);
    }
  }, [toast]);

  const updateSessionsAndSave = useCallback((newSessions: ChatSession[]) => {
    const sortedSessions = newSessions.sort((a, b) => b.createdAt - a.createdAt);
    setSessions(sortedSessions);
    saveChatSessions(sortedSessions);
  }, []);

  const setActiveSessionId = useCallback((sessionId: string | null) => {
    setActiveSessionIdState(sessionId);
    saveActiveSessionId(sessionId);
  }, []);
  
  const startNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: `New Chat (${new Date().toLocaleDateString([], { month: 'short', day: 'numeric'})})`, // Placeholder title
      messages: [],
      timestamp: Date.now(),
      createdAt: Date.now(),
    };
    const updatedSessions = [newSession, ...sessions];
    updateSessionsAndSave(updatedSessions);
    setActiveSessionId(newSessionId);
    return newSessionId;
  }, [sessions, updateSessionsAndSave, setActiveSessionId]);

  const selectSession = useCallback((sessionId: string) => {
    if (sessions.find(s => s.id === sessionId)) {
      setActiveSessionId(sessionId);
    } else {
      // If session doesn't exist, maybe default to first or new
      if (sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
      } else {
        startNewSession();
      }
    }
  }, [sessions, setActiveSessionId, startNewSession]);

  const sendMessage = useCallback(async (text: string, mode: TranslateAndRespondInAmharicInput['mode']) => {
    if (!text.trim()) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = startNewSession(); // Create a new session if none is active
    }
    
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        const newMessages = [...session.messages, newUserMessage];
        // Update title for new chats based on first message
        const newTitle = (session.messages.length === 0) ? generateSessionTitle(text) : session.title;
        return { ...session, messages: newMessages, title: newTitle, timestamp: Date.now() };
      }
      return session;
    });
    updateSessionsAndSave(updatedSessions);
    setIsLoadingAI(true);

    try {
      const aiResponse = await translateAndRespondInAmharic({ englishInput: text, mode });
      
      let aiMessageText = aiResponse.amharicResponse;
      if (aiResponse.reasoning) {
        aiMessageText += `\n\n---\n${aiResponse.reasoning}`;
      }
      
      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiMessageText,
        sender: 'ai',
        timestamp: Date.now(),
      };

      const finalSessions = sessions.map(session => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, newUserMessage, newAiMessage], timestamp: Date.now() };
        }
        // This is tricky: we need to get the latest state of session.messages that includes newUserMessage
        // It's better to update based on the `updatedSessions` state from before the API call
        return session; 
      });
      
      // Find the session to update from the version that already has the user message
       const sessionsWithAiResponse = updatedSessions.map(session => {
        if (session.id === currentSessionId) {
           return { ...session, messages: [...session.messages, newAiMessage], timestamp: Date.now() };
        }
        return session;
      });
      updateSessionsAndSave(sessionsWithAiResponse);

    } catch (error) {
      console.error('Error communicating with AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI. Please try again.',
        variant: 'destructive',
      });
      // Revert user message if AI fails? Or keep it? For now, keep.
    } finally {
      setIsLoadingAI(false);
    }
  }, [activeSessionId, sessions, updateSessionsAndSave, toast, startNewSession]);

  const clearActiveSessionHistory = useCallback(() => {
    if (!activeSessionId) return;

    const updatedSessions = sessions.map(session => {
      if (session.id === activeSessionId) {
        return { ...session, messages: [], timestamp: Date.now() };
      }
      return session;
    });
    updateSessionsAndSave(updatedSessions);
    toast({
      title: 'Chat Cleared',
      description: 'The current chat session history has been removed.',
    });
  }, [activeSessionId, sessions, updateSessionsAndSave, toast]);

  const deleteSession = useCallback((sessionIdToDelete: string) => {
    const remainingSessions = sessions.filter(session => session.id !== sessionIdToDelete);
    updateSessionsAndSave(remainingSessions);

    if (activeSessionId === sessionIdToDelete) {
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id); // Select the newest remaining
      } else {
        setActiveSessionId(null); // No sessions left
      }
    }
    toast({
      title: 'Chat Deleted',
      description: 'The chat session has been removed.',
    });
  }, [activeSessionId, sessions, updateSessionsAndSave, setActiveSessionId, toast]);

  const currentMessages = sessions.find(s => s.id === activeSessionId)?.messages || [];

  return {
    sessions,
    activeSessionId,
    currentMessages,
    isLoadingAI,
    sendMessage,
    startNewSession,
    selectSession,
    deleteSession,
    clearActiveSessionHistory,
  };
}