
'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TranslateAndRespondInAmharicInput } from '@/ai/flows/translate-and-respond-in-amharic';


interface ChatInputProps {
  onSendMessage: (text: string, mode: TranslateAndRespondInAmharicInput['mode']) => void;
  isLoading: boolean;
  currentMode: TranslateAndRespondInAmharicInput['mode'];
  onModeChange: (mode: TranslateAndRespondInAmharicInput['mode']) => void;
}

export function ChatInput({ onSendMessage, isLoading, currentMode, onModeChange }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue, currentMode);
      setInputValue('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center flex-wrap gap-3 p-4 border-t border-border bg-background sticky bottom-0"
    >
      <div className="flex-shrink-0">
        <Label htmlFor="chat-mode-select" className="sr-only">Chat Mode</Label>
        <Select
          value={currentMode}
          onValueChange={(value: TranslateAndRespondInAmharicInput['mode']) => onModeChange(value)}
          disabled={isLoading}
          name="chat-mode-select"
        >
          <SelectTrigger 
            className="w-auto min-w-[130px] bg-muted focus-visible:ring-accent h-10"
            aria-label="Select chat mode"
            id="chat-mode-select"
          >
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Mode</SelectItem>
            <SelectItem value="medical">Medical Mode</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={currentMode === 'medical' ? "Ask medical questions (Amharic/English)..." : "Type your message (Amharic/English)..."}
        className="flex-grow bg-muted focus-visible:ring-accent min-w-[200px]"
        disabled={isLoading}
        aria-label="Chat message input"
      />
      <Button type="submit" size="icon" variant="ghost" className="text-accent hover:bg-accent/10 flex-shrink-0" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendHorizonal className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
