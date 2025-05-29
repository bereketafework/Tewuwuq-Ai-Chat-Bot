'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';
import { translateAndRespondInAmharic } from '@/ai/flows/translate-and-respond-in-amharic';
import { loadChatHistory, saveChatHistory as saveHistoryToLs, clearChatHistory as clearHistoryFromLs } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadedMessages = loadChatHistory();
    setMessages(loadedMessages);
  }, []);

  const saveChatHistory = useCallback((updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
    saveHistoryToLs(updatedMessages);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessagesWithUser = [...messages, newUserMessage];
    saveChatHistory(updatedMessagesWithUser);
    setIsLoadingAI(true);

    try {
      const aiResponse = await translateAndRespondInAmharic({ englishInput: text });
      
      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiResponse.amharicResponse,
        sender: 'ai',
        timestamp: Date.now(),
      };
      saveChatHistory([...updatedMessagesWithUser, newAiMessage]);
    } catch (error) {
      console.error('Error communicating with AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI. Please try again.',
        variant: 'destructive',
      });
      // Optionally remove the user's message or add an error message to chat
      // For simplicity, we'll just show a toast.
    } finally {
      setIsLoadingAI(false);
    }
  }, [messages, saveChatHistory, toast]);

  const clearHistory = useCallback(() => {
    clearHistoryFromLs();
    setMessages([]);
    toast({
      title: 'Chat History Cleared',
      description: 'Your conversation history has been removed.',
    });
  }, [toast]);

  return {
    messages,
    isLoadingAI,
    sendMessage,
    clearHistory,
  };
}
