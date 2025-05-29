
'use client';

import { useState, type FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2, Paperclip, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalyzeTextAndFileInput } from '@/ai/flows/analyze-file-and-chat'; // Updated import
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (
    text: string, 
    mode: AnalyzeTextAndFileInput['mode'],
    file?: { name: string; type: string; dataUri: string; size: number }
  ) => void;
  isLoading: boolean;
  currentMode: AnalyzeTextAndFileInput['mode'];
  onModeChange: (mode: AnalyzeTextAndFileInput['mode']) => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];


export function ChatInput({ onSendMessage, isLoading, currentMode, onModeChange }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; dataUri: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: 'File Too Large',
          description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
          variant: 'destructive',
        });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
         toast({
          title: 'Invalid File Type',
          description: `Please select an image (JPEG, PNG, GIF, WEBP) or PDF file. Detected: ${file.type}`,
          variant: 'destructive',
        });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          dataUri: e.target?.result as string,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((inputValue.trim() || selectedFile) && !isLoading) {
      onSendMessage(inputValue, currentMode, selectedFile || undefined);
      setInputValue('');
      clearSelectedFile();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-3 border-t border-border bg-background sticky bottom-0"
    >
      {selectedFile && (
        <div className="flex items-center justify-between p-2 text-sm bg-muted rounded-md border border-input">
          <span className="truncate text-muted-foreground">
            <Paperclip className="inline h-4 w-4 mr-1" /> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <Button type="button" variant="ghost" size="icon" onClick={clearSelectedFile} className="h-6 w-6 text-muted-foreground hover:text-destructive">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center flex-wrap gap-2">
        <div className="flex-shrink-0">
          <Label htmlFor="chat-mode-select" className="sr-only">Chat Mode</Label>
          <Select
            value={currentMode}
            onValueChange={(value: AnalyzeTextAndFileInput['mode']) => onModeChange(value)}
            disabled={isLoading}
            name="chat-mode-select"
          >
            <SelectTrigger 
              className="w-auto min-w-[120px] bg-muted focus-visible:ring-accent h-10"
              aria-label="Select chat mode"
              id="chat-mode-select"
            >
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentMode === 'medical' ? "Ask medical questions..." : "Type message or attach file..."}
          className="flex-grow bg-muted focus-visible:ring-accent min-w-[150px]"
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="text-muted-foreground hover:text-accent flex-shrink-0" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={ALLOWED_FILE_TYPES.join(',')}
        />
        <Button 
          type="submit" 
          size="icon" 
          variant="default" // Changed to default for better visibility
          className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0" 
          disabled={isLoading || (!inputValue.trim() && !selectedFile)} 
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
