export interface ChatMessageFile {
  name: string;
  type: string; // MIME type
  dataUri: string; // For previews or re-upload, not for sending to AI directly if too large
  size: number;
}

export interface ChatMessage {
  id:string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  isLoading?: boolean; // Optional flag for AI "typing..." state
  file?: ChatMessageFile; // Information about an attached file
  reasoning?: string; // AI's reasoning, to be displayed separately or appended
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number; // Timestamp of the last message or session creation
  messages: ChatMessage[];
  createdAt: number; // Timestamp of session creation for sorting
}
