
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';
import { translateAndRespondInAmharic, type TranslateAndRespondInAmharicInput } from '@/ai/flows/translate-and-respond-in-amharic';
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

  const sendMessage = useCallback(async (text: string, mode: TranslateAndRespondInAmharicInput['mode']) => {
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
      const aiResponse = await translateAndRespondInAmharic({ englishInput: text, mode });
      
      let aiMessageText = aiResponse.amharicResponse;
      if (aiResponse.reasoning) { // Applies to both modes if reasoning is present
        // The AI prompt is responsible for the "ምክንያታዊነት:" prefix.
        aiMessageText += `\n\n---\n${aiResponse.reasoning}`;
      }
      
      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiMessageText,
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

