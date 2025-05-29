
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { ChatHistoryControls } from './ChatHistoryControls';
import { DateSeparator } from './DateSeparator'; // Added import
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

export function ChatInterface() {
  const { messages, isLoadingAI, sendMessage, clearHistory } = useChat();
  const [currentMode, setCurrentMode] = useState<TranslateAndRespondInAmharicInput['mode']>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (text: string) => {
    sendMessage(text, currentMode);
  };

  let lastMessageDate: number | null = null;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background shadow-2xl rounded-lg overflow-hidden w-full max-w-2xl mx-auto border border-border">
      <header className="p-4 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary fill-current">
            <path d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5zm0 82.02c-20.44 0-37.02-16.58-37.02-37.02S29.56 12.98 50 12.98s37.02 16.58 37.02 37.02S70.44 87.02 50 87.02z"/>
            <path d="M62.5 37.5h-25c-1.38 0-2.5 1.12-2.5 2.5v12.5c0 1.38 1.12 2.5 2.5 2.5h10v7.5l7.5-7.5h7.5c1.38 0 2.5-1.12 2.5-2.5V40c0-1.38-1.12-2.5-2.5-2.5z"/>
           </svg>
          <h1 className="text-xl font-semibold text-foreground">ትውውቅ (Tewuwuq)</h1>
        </div>
        <ChatHistoryControls onClearHistory={clearHistory} />
      </header>

      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div ref={viewportRef} className="space-y-2 pb-4">
          {messages.length === 0 && !isLoadingAI && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
              <Image src="https://placehold.co/300x200.png" alt="Chat placeholder" width={300} height={200} className="rounded-lg mb-4 opacity-70" data-ai-hint="conversation Ethiopia" />
              <p className="text-lg font-medium">Welcome to ትውውቅ!</p>
              <p className="text-sm">Start a conversation by typing a message below.</p>
              <p className="text-sm">Select a mode (General or Medical) and chat in Amharic or English.</p>
            </div>
          )}
          {messages.map((msg, index) => {
            const showDateSeparator = !lastMessageDate || !isSameDay(lastMessageDate, msg.timestamp);
            if (showDateSeparator) {
              lastMessageDate = msg.timestamp;
            }
            // Reset lastMessageDate for the next full render pass if we are at the start of the array
            // This ensures that if messages are prepended or significantly changed, date calculation restarts correctly.
            // However, for simple appends, it correctly carries over.
            // More robustly, lastMessageDate should re-initialize on each render cycle before the map.
            // The current placement (re-initializing to null before the component return) is correct.

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
           {isLoadingAI && messages.length === 0 && ( // Show loading pulse if first message is being sent
             <div className="flex items-start gap-2 py-3 animate-pulse pt-16">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ml-auto mr-2"> {/* Simulating user message position */}
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

