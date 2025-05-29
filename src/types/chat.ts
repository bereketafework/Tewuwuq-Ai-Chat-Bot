export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  isLoading?: boolean; // Optional flag for AI "typing..." state
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number; // Timestamp of the last message or session creation
  messages: ChatMessage[];
  createdAt: number; // Timestamp of session creation for sorting
}