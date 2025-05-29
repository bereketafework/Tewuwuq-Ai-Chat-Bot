
'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { ChatHistoryControls } from './ChatHistoryControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Bot } from 'lucide-react'; // Added import for Bot icon

export function ChatInterface() {
  const { messages, isLoadingAI, sendMessage, clearHistory } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  return (
    <div className="flex flex-col h-screen max-h-screen bg-background shadow-2xl rounded-lg overflow-hidden w-full max-w-2xl mx-auto border border-border">
      <header className="p-4 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
           {/* Placeholder for a logo, if available */}
           {/* <MessageSquareText className="h-7 w-7 text-primary" />  Or an actual logo */}
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
              <p className="text-sm">All responses will be in Amharic.</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
          {isLoadingAI && messages.length > 0 && (
             <div className="flex items-start gap-2 py-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="max-w-[70%] rounded-xl p-3 shadow-md bg-card rounded-tl-none">
                    <div className="h-4 bg-muted-foreground/30 rounded w-32"></div>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* <Separator /> */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoadingAI} />
    </div>
  );
}
