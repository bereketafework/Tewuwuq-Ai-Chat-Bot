
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { DateSeparator } from './DateSeparator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Bot, MessageCircle } from 'lucide-react'; // Added MessageCircle
import type { AnalyzeTextAndFileInput } from '@/ai/flows/analyze-file-and-chat'; // Updated to new flow type

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
  onSendMessage: (
    text: string, 
    mode: AnalyzeTextAndFileInput['mode'], // Use new flow input type
    file?: { name: string; type: string; dataUri: string; size: number }
  ) => void;
  currentSessionId: string | null; 
}

export function ChatInterface({ 
  messages, 
  isLoadingAI, 
  onSendMessage, 
  currentSessionId,
}: ChatInterfaceProps) {
  const [currentMode, setCurrentMode] = useState<AnalyzeTextAndFileInput['mode']>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, currentSessionId]);
  
  const handleSendMessage = (
    text: string, 
    mode: AnalyzeTextAndFileInput['mode'],
    file?: { name: string; type: string; dataUri: string; size: number }
  ) => {
    onSendMessage(text, mode, file); // Pass file along
  };

  let lastMessageDate: number | null = null;

  if (!currentSessionId) {
    return null; 
  }

  return (
    <div className="flex flex-col h-full max-h-full w-full overflow-hidden">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div ref={viewportRef} className="space-y-2 pb-4">
          {messages.length === 0 && !isLoadingAI && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10 md:pt-16 px-4">
              <MessageCircle data-ai-hint="conversation empty" className="lucide lucide-message-circle-dashed mb-6 h-16 w-16 opacity-40 text-primary" />
              <p className="text-lg font-medium text-foreground">ትውውቅ (Tewuwuq)</p>
              <p className="text-sm max-w-sm mt-1">
                This chat session is empty. Start the conversation by typing a message or attaching a file below.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Select a mode (General or Medical) for tailored responses.
              </p>
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
                <div className="max-w-[70%] rounded-xl p-3 shadow-md bg-card rounded-tl-none"> {/* Card bg for AI bubble */}
                    <div className="h-4 bg-muted/50 rounded w-32 mb-1.5"></div> {/* Muted for skeleton */}
                    <div className="h-3 bg-muted/40 rounded w-24"></div>
                </div>
            </div>
          )}
           {isLoadingAI && messages.length === 0 && ( 
             <div className="flex items-start gap-2 py-3 animate-pulse pt-16"> {/* Placeholder for first AI message loading */}
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ml-auto mr-2 opacity-0">
                  {/* Invisible placeholder to maintain layout consistency if needed */}
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <ChatInput 
        onSendMessage={(text, mode, file) => handleSendMessage(text, mode, file)} // Ensure file is passed
        isLoading={isLoadingAI}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />
    </div>
  );
}
