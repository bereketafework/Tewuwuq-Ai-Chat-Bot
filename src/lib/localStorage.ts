import type { ChatMessage, ChatSession } from '@/types/chat';

const CHAT_SESSIONS_KEY = 'tewuwuqChatSessions';
const ACTIVE_SESSION_ID_KEY = 'tewuwuqActiveSessionId';

// --- Chat Session Management ---

export function saveChatSessions(sessions: ChatSession[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  }
}

export function loadChatSessions(): ChatSession[] {
  if (typeof window !== 'undefined') {
    const storedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (storedSessions) {
      try {
        const sessions = JSON.parse(storedSessions) as ChatSession[];
        // Ensure all sessions have a createdAt field for proper sorting
        return sessions.map(session => ({
          ...session,
          createdAt: session.createdAt || session.timestamp // Fallback for older sessions
        })).sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first
      } catch (error) {
        console.error('Error parsing chat sessions from localStorage:', error);
        return [];
      }
    }
  }
  return [];
}

export function clearAllChatSessions(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAT_SESSIONS_KEY);
    localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
  }
}

// --- Active Session ID Management ---

export function saveActiveSessionId(sessionId: string | null): void {
  if (typeof window !== 'undefined') {
    if (sessionId === null) {
      localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
    } else {
      localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
    }
  }
}

export function loadActiveSessionId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
  }
  return null;
}


// --- Legacy functions (can be removed if no longer directly used elsewhere, but useChat hook will handle migration) ---
const CHAT_HISTORY_KEY = 'tewuwuqChatHistory';

export function loadLegacyChatHistory(): ChatMessage[] {
  if (typeof window !== 'undefined') {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (storedHistory) {
      try {
        return JSON.parse(storedHistory) as ChatMessage[];
      } catch (error) {
        console.error('Error parsing legacy chat history from localStorage:', error);
        return [];
      }
    }
  }
  return [];
}

export function clearLegacyChatHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }
}