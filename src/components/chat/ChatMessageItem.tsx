
'use client';

import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, FileText, ImageIcon } from 'lucide-react';
import React from 'react';
import Image from 'next/image'; // For image previews
import { Badge } from '@/components/ui/badge'; // For reasoning display

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
  
  const animationClasses = 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out';

  const renderTextWithFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\n)/g).filter(part => part.length > 0); // Split by **bolded text** or newline
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
      }
      if (part === '\n') {
        return <br key={index} />;
      }
      return <span key={index}>{part}</span>; // Use span to ensure keys are applied correctly for fragments
    });
  };

  const renderFilePreview = (file: ChatMessage['file']) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    
    // Simple inline preview for images, icon for PDFs
    if (isImage) {
      return (
        <div className="mt-2 p-2 border border-border rounded-md bg-background/50 max-w-xs">
          <Image 
            src={file.dataUri} 
            alt={file.name} 
            width={150} 
            height={100} 
            className="rounded object-contain max-h-40" 
          />
          <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="mt-2 p-2 border border-border rounded-md bg-background/50 flex items-center gap-2 max-w-xs">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-foreground truncate">{file.name}</p>
        </div>
      );
    }
    return (
      <div className="mt-2 p-2 border border-border rounded-md bg-background/50 flex items-center gap-2 max-w-xs">
        <ImageIcon className="h-6 w-6 text-muted-foreground" /> {/* Fallback icon */}
        <p className="text-sm text-foreground truncate">{file.name}</p>
      </div>
    );
  };


  return (
    <div className={cn('flex flex-col gap-1 py-3', alignment, animationClasses)}> {/* Reduced gap-2 to gap-1 */}
      <div className={cn('flex items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn(isUser ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground')}>
            {avatarIcon}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'max-w-[70%] rounded-xl p-3 shadow-md break-words', // Ensure break-words is applied
            bubbleStyles
          )}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap"> {/* Changed p to div for block display of children */}
            {renderTextWithFormatting(message.text)}
          </div>
          {message.file && renderFilePreview(message.file)}
          {message.reasoning && !isUser && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-muted-foreground/80 hover:text-muted-foreground">
                View Reasoning
              </summary>
              <div className="mt-1 p-2 border-t border-dashed border-current/30">
                 {renderTextWithFormatting(message.reasoning)}
              </div>
            </details>
          )}
        </div>
      </div>
      <p className={cn('text-xs text-muted-foreground px-10', isUser ? 'text-right' : 'text-left')}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
