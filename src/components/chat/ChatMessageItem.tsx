'use client';

import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';

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
  const avatarFallback = isUser ? 'U' : 'AI';
  
  // Animation for message arrival
  const animationClasses = 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out';

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
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>
      <p className={cn('text-xs text-muted-foreground px-10', isUser ? 'text-right' : 'text-left')}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
