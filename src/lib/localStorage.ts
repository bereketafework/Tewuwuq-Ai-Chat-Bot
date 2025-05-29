import type { ChatMessage } from '@/types/chat';

const CHAT_HISTORY_KEY = 'tewuwuqChatHistory';

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window !== 'undefined') {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (storedHistory) {
      try {
        return JSON.parse(storedHistory) as ChatMessage[];
      } catch (error) {
        console.error('Error parsing chat history from localStorage:', error);
        return [];
      }
    }
  }
  return [];
}

export function clearChatHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }
}
