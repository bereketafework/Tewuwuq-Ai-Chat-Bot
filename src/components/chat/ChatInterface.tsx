
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
// ChatHistoryControls is removed from here as it's moved to page.tsx
import { DateSeparator } from './DateSeparator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Bot } from 'lucide-react';
import type { TranslateAndRespondInAmharicInput } from '@/ai/flows/translate-and-respond-in-amharic';

const isSameDay = (d1Epoch: number, d2Epoch: number): boolean => {
  if (!d1Epoch || !d2Epoch) return false;
  const date1 = new Date(d1Epoch);
  const date2 = new Date(d2Epoch);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  onSendMessage: (text: string, mode: TranslateAndRespondInAmharicInput['mode']) => void;
  // onClearHistory is removed as it's handled by ChatHistoryControls in page.tsx
  currentSessionId: string | null; 
  // sessionTitle prop is removed as it's handled by the header in page.tsx
}

export function ChatInterface({ 
  messages, 
  isLoadingAI, 
  onSendMessage, 
  currentSessionId,
}: ChatInterfaceProps) {
  const [currentMode, setCurrentMode] = useState<TranslateAndRespondInAmharicInput['mode']>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, currentSessionId]);
  
  const handleSendMessage = (text: string) => {
    onSendMessage(text, currentMode);
  };

  let lastMessageDate: number | null = null;

  if (!currentSessionId) {
    // This case is now handled by page.tsx showing a welcome message.
    // This component shouldn't be rendered if no active session.
    // However, as a fallback, we can return null or a minimal placeholder.
    return null; 
  }

  return (
    // Removed outer border and shadow as it's part of the main panel now
    // Removed main bg-background, as parent provides it.
    <div className="flex flex-col h-full max-h-full w-full overflow-hidden">
      {/* Header is removed from here. It's now in page.tsx */}

      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div ref={viewportRef} className="space-y-2 pb-4">
          {messages.length === 0 && !isLoadingAI && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10 md:pt-16">
              <Image src="https://placehold.co/300x200.png" alt="Chat placeholder" width={250} height={167} className="rounded-lg mb-4 opacity-70" data-ai-hint="conversation Ethiopia" />
              <p className="text-lg font-medium">ትውውቅ (Tewuwuq)</p>
              <p className="text-sm">Start a conversation by typing a message below.</p>
              <p className="text-sm">Select a mode (General or Medical) and chat in Amharic or English.</p>
            </div>
          )}
          {messages.map((msg, index) => {
            const showDateSeparator = !lastMessageDate || !isSameDay(lastMessageDate, msg.timestamp);
            if (showDateSeparator) {
              lastMessageDate = msg.timestamp;
            }
            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <DateSeparator timestamp={msg.timestamp} />
                )}
                <ChatMessageItem message={msg} />
              </React.Fragment>
            );
          })}
          {isLoadingAI && messages.length > 0 && (
             <div className="flex items-start gap-2 py-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="max-w-[70%] rounded-xl p-3 shadow-md bg-card rounded-tl-none">
                    <div className="h-4 bg-muted-foreground/30 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-24"></div>
                </div>
            </div>
          )}
           {isLoadingAI && messages.length === 0 && ( 
             <div className="flex items-start gap-2 py-3 animate-pulse pt-16">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ml-auto mr-2">
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoadingAI}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />
    </div>
  );
}
