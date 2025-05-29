'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { ChatHistoryControls } from './ChatHistoryControls';
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
  onClearHistory: () => void;
  currentSessionId: string | null; // Added
  sessionTitle: string; // Added
}

export function ChatInterface({ 
  messages, 
  isLoadingAI, 
  onSendMessage, 
  onClearHistory,
  currentSessionId,
  sessionTitle
}: ChatInterfaceProps) {
  const [currentMode, setCurrentMode] = useState<TranslateAndRespondInAmharicInput['mode']>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, currentSessionId]); // Also scroll on session change
  
  const handleSendMessage = (text: string) => {
    onSendMessage(text, currentMode);
  };

  let lastMessageDate: number | null = null;

  if (!currentSessionId) {
    // This case should ideally be handled by the parent component (page.tsx)
    // by not rendering ChatInterface or showing a "select/start chat" message.
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <p className="text-lg">Please select a chat or start a new one from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full bg-background shadow-2xl rounded-lg overflow-hidden w-full border border-border">
      <header className="p-4 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 truncate">
           <svg width="28" height="28" viewBox="0 0 100 100" className="text-primary fill-current shrink-0">
            <path d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5zm0 82.02c-20.44 0-37.02-16.58-37.02-37.02S29.56 12.98 50 12.98s37.02 16.58 37.02 37.02S70.44 87.02 50 87.02z"/>
            <path d="M62.5 37.5h-25c-1.38 0-2.5 1.12-2.5 2.5v12.5c0 1.38 1.12 2.5 2.5 2.5h10v7.5l7.5-7.5h7.5c1.38 0 2.5-1.12 2.5-2.5V40c0-1.38-1.12-2.5-2.5-2.5z"/>
           </svg>
          <h1 className="text-lg font-semibold text-foreground truncate" title={sessionTitle}>{sessionTitle}</h1>
        </div>
        <ChatHistoryControls onClearHistory={onClearHistory} />
      </header>

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