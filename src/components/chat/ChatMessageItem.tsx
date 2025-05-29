
'use client';

import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import React from 'react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.sender === 'user';
  const alignment = isUser ? 'items-end' : 'items-start';
  const bubbleStyles = isUser
    ? 'bg-primary text-primary-foreground rounded-tr-none'
    : 'bg-card text-card-foreground rounded-tl-none';
  const avatarIcon = isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />;
  
  // Animation for message arrival
  const animationClasses = 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out';

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by **bolded text**
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
      }
      // For non-bold parts, preserve newlines by splitting and adding <br />
      // This is simplistic; a proper markdown parser would be better for complex markdown.
      // However, for bold and newlines, this should suffice.
      return part.split('\n').map((line, lineIndex, arr) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <div className={cn('flex flex-col gap-2 py-3', alignment, animationClasses)}>
      <div className={cn('flex items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className={cn(isUser ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground')}>
            {avatarIcon}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'max-w-[70%] rounded-xl p-3 shadow-md break-words',
            bubbleStyles
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {renderTextWithBold(message.text)}
          </p>
        </div>
      </div>
      <p className={cn('text-xs text-muted-foreground px-10', isUser ? 'text-right' : 'text-left')}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}

