
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatSession, ChatMessageFile } from '@/types/chat';
import { analyzeTextAndFile, type AnalyzeTextAndFileInput } from '@/ai/flows/analyze-file-and-chat';
import { analyzeChatSession, type AnalyzeChatSessionInput } from '@/ai/flows/analyze-chat-session';
import { MessagePart, Role } from 'genkit';

import { 
  loadChatSessions, 
  saveChatSessions, 
  loadActiveSessionId,
  saveActiveSessionId,
  loadLegacyChatHistory, 
  clearLegacyChatHistory 
} from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const MAX_TITLE_LENGTH = 35;

function generateSessionTitle(firstMessageText?: string, file?: ChatMessageFile): string {
  let baseTitle = "New Chat";
  if (file) {
    baseTitle = file.name;
  } else if (firstMessageText) {
    baseTitle = firstMessageText;
  }

  if (baseTitle.length > MAX_TITLE_LENGTH) {
    return baseTitle.substring(0, MAX_TITLE_LENGTH -3) + '...';
  }
  if (baseTitle === "New Chat" || !baseTitle.trim()) {
     return `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return baseTitle;
}


export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAnalyzingSession, setIsAnalyzingSession] = useState(false); // For session analysis loading state
  const { toast } = useToast();

  useEffect(() => {
    const legacyMessages = loadLegacyChatHistory();
    let loadedSessions = loadChatSessions();

    if (legacyMessages.length > 0 && loadedSessions.length === 0) {
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: generateSessionTitle(legacyMessages[0]?.text),
        messages: legacyMessages,
        timestamp: legacyMessages[legacyMessages.length - 1]?.timestamp || Date.now(),
        createdAt: legacyMessages[0]?.timestamp || Date.now(),
      };
      loadedSessions = [newSession];
      saveChatSessions(loadedSessions);
      setActiveSessionIdState(newSession.id); // Set active session
      saveActiveSessionId(newSession.id);
      clearLegacyChatHistory();
      toast({ title: "Chat history updated", description: "Your previous chat has been saved as a new session." });
    }
    
    setSessions(loadedSessions.sort((a, b) => b.createdAt - a.createdAt));
    
    const storedActiveId = loadActiveSessionId();
    if (storedActiveId && loadedSessions.find(s => s.id === storedActiveId)) {
      setActiveSessionIdState(storedActiveId);
    } else if (loadedSessions.length > 0) {
      setActiveSessionIdState(loadedSessions[0].id); 
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
      title: `New Chat (${new Date().toLocaleDateString([], { month: 'short', day: 'numeric'})})`,
      messages: [],
      timestamp: Date.now(),
      createdAt: Date.now(),
    };
    const updatedSessions = [newSession, ...sessions]; // Add to the beginning
    updateSessionsAndSave(updatedSessions);
    setActiveSessionId(newSessionId);
    return newSessionId;
  }, [sessions, updateSessionsAndSave, setActiveSessionId]);

  const selectSession = useCallback((sessionId: string) => {
    if (sessions.find(s => s.id === sessionId)) {
      setActiveSessionId(sessionId);
    } else {
      if (sessions.length > 0) {
        setActiveSessionId(sessions.sort((a,b) => b.createdAt - a.createdAt)[0].id); // Select newest if current is gone
      } else {
        startNewSession();
      }
    }
  }, [sessions, setActiveSessionId, startNewSession]);

  const sendMessage = useCallback(async (
    text: string, 
    mode: AnalyzeTextAndFileInput['mode'],
    file?: ChatMessageFile
  ) => {
    if (!text.trim() && !file) return;

    let currentSessionId = activeSessionId;
    let isNewSession = false;
    if (!currentSessionId) {
      currentSessionId = startNewSession();
      isNewSession = true;
    }
    
    const userMessageText = text || (file ? `File: ${file.name}` : "User initiated action");

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: userMessageText,
      sender: 'user',
      timestamp: Date.now(),
      file: file ? { name: file.name, type: file.type, dataUri: file.dataUri, size: file.size } : undefined,
    };

    const sessionsWithUserMessage = sessions.map(session => {
      if (session.id === currentSessionId) {
        const newMessages = [...session.messages, newUserMessage];
        const newTitle = (isNewSession || session.messages.length === 0) 
                         ? generateSessionTitle(text, file) 
                         : session.title;
        return { ...session, messages: newMessages, title: newTitle, timestamp: Date.now() };
      }
      return session;
    });
    updateSessionsAndSave(sessionsWithUserMessage);
    setIsLoadingAI(true);

    try {
      const currentSession = sessionsWithUserMessage.find(s => s.id === currentSessionId);
      const chatHistoryForAI: AnalyzeTextAndFileInput['history'] = (currentSession?.messages || [])
        .slice(0, -1) 
        .map(msg => {
          const parts: MessagePart[] = [];
          if (msg.text) parts.push({ text: msg.text });
          if (msg.file) parts.push({ media: { url: msg.file.dataUri, contentType: msg.file.type } });
          
          return {
            role: msg.sender === 'user' ? 'user' : 'model' as Role,
            parts: parts,
          };
        });

      const aiInput: AnalyzeTextAndFileInput = {
        history: chatHistoryForAI,
        currentMessageText: text,
        mode,
      };
      if (file) {
        aiInput.currentFile = { dataUri: file.dataUri, mimeType: file.type };
      }
      
      const aiResponse = await analyzeTextAndFile(aiInput);
      
      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiResponse.amharicResponse,
        sender: 'ai',
        timestamp: Date.now(),
        reasoning: aiResponse.reasoning,
      };

      const sessionsWithAiResponse = sessionsWithUserMessage.map(session => {
        if (session.id === currentSessionId) {
           return { ...session, messages: [...session.messages, newAiMessage], timestamp: Date.now() };
        }
        return session;
      });
      updateSessionsAndSave(sessionsWithAiResponse);

    } catch (error) {
      console.error('Error communicating with AI:', error);
      let errorMessage = 'Failed to get response from AI. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('DEADLINE_EXCEEDED') 
          ? 'The request to the AI timed out. Please try again.'
          : error.message.includes('API key not valid')
            ? 'Invalid API Key. Please check your API key in the .env file.'
            : `AI Error: ${error.message.substring(0,100)}`;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
       const sessionsAfterError = sessionsWithUserMessage.map(session => {
        if (session.id === currentSessionId) {
           const errorMsg: ChatMessage = {
             id: `err-${Date.now()}`,
             text: `Error: Could not get AI response. (${errorMessage})`,
             sender: 'ai',
             timestamp: Date.now()
           }
           return { ...session, messages: [...session.messages, errorMsg], timestamp: Date.now() };
        }
        return session;
      });
      updateSessionsAndSave(sessionsAfterError);
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
        setActiveSessionId(remainingSessions.sort((a,b) => b.createdAt - a.createdAt)[0].id);
      } else {
        setActiveSessionId(null); 
      }
    }
    toast({
      title: 'Chat Deleted',
      description: 'The chat session has been removed.',
    });
  }, [activeSessionId, sessions, updateSessionsAndSave, setActiveSessionId, toast]);

  const performSessionAnalysis = useCallback(async (sessionId: string | null): Promise<string | null> => {
    if (!sessionId) {
      toast({ title: 'Error', description: 'No active session to analyze.', variant: 'destructive' });
      return null;
    }
    const sessionToAnalyze = sessions.find(s => s.id === sessionId);
    if (!sessionToAnalyze || sessionToAnalyze.messages.length === 0) {
      toast({ title: 'Info', description: 'Session is empty or not found. Nothing to analyze.', variant: 'default' });
      return null;
    }

    setIsAnalyzingSession(true);
    try {
      const input: AnalyzeChatSessionInput = {
        messages: sessionToAnalyze.messages.map(m => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          timestamp: m.timestamp,
          file: m.file,
          reasoning: m.reasoning,
        })),
        sessionTitle: sessionToAnalyze.title,
      };
      const result = await analyzeChatSession(input);
      return result.analysis;
    } catch (error) {
      console.error('Error analyzing chat session:', error);
      let errorMessage = 'Failed to analyze session.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('DEADLINE_EXCEEDED')
          ? 'The analysis request timed out.'
          : `Analysis Error: ${error.message.substring(0, 100)}`;
      }
      toast({
        title: 'Analysis Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzingSession(false);
    }
  }, [sessions, toast]);


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
    isAnalyzingSession,
    performSessionAnalysis,
  };
}
