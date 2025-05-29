
'use client';

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2, Paperclip, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalyzeTextAndFileInput } from '@/ai/flows/analyze-file-and-chat';
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

const chatModes: Array<{ value: AnalyzeTextAndFileInput['mode']; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'medical', label: 'Medical' },
  { value: 'child', label: 'Child' },
  { value: 'student', label: 'Student' },
];

export function ChatInput({ onSendMessage, isLoading, currentMode, onModeChange }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; dataUri: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // md breakpoint
    };
    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: 'File Too Large',
          description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
          variant: 'destructive',
        });
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
         toast({
          title: 'Invalid File Type',
          description: `Please select an image (JPEG, PNG, GIF, WEBP) or PDF file. Detected: ${file.type}`,
          variant: 'destructive',
        });
        if (fileInputRef.current) fileInputRef.current.value = ""; 
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
      fileInputRef.current.value = ""; 
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

  const getPlaceholderText = () => {
    switch(currentMode) {
      case 'medical':
        return "Ask medical questions...";
      case 'child':
        return "Ask fun questions or what you want to learn... 😊";
      case 'student':
        return "Explore topics or ask for explanations... 🎓";
      case 'general':
      default:
        return "Type message or attach file...";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-3 border-t bg-background sticky bottom-0 shadow-sm" // Increased gap to 3
    >
      {selectedFile && (
        <div className="flex items-center justify-between p-2 text-sm bg-card rounded-lg border">
          <span className="truncate text-muted-foreground flex items-center">
            <Paperclip className="inline h-4 w-4 mr-2 text-primary" /> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <Button type="button" variant="ghost" size="icon" onClick={clearSelectedFile} className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center flex-wrap gap-2 sm:gap-3">
         {isSmallScreen ? (
          <div className="flex-shrink-0">
            <Label htmlFor="chat-mode-select" className="sr-only">Chat Mode</Label>
            <Select
              value={currentMode}
              onValueChange={(value: AnalyzeTextAndFileInput['mode']) => onModeChange(value)}
              disabled={isLoading}
              name="chat-mode-select"
            >
              <SelectTrigger 
                className="w-auto min-w-[120px] bg-card focus-visible:ring-primary h-10 text-sm"
                aria-label="Select chat mode"
                id="chat-mode-select"
              >
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {chatModes.map(mode => (
                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap items-center flex-shrink-0">
            {chatModes.map((mode) => (
              <Button
                key={mode.value}
                type="button"
                variant={currentMode === mode.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange(mode.value)}
                disabled={isLoading}
                className={cn(
                  "h-9 text-xs sm:text-sm px-3", 
                  currentMode === mode.value 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                    : "text-foreground hover:bg-accent/50 hover:border-accent"
                )}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        )}

        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={getPlaceholderText()}
          className="flex-grow bg-card focus-visible:ring-primary min-w-[100px] text-sm h-10"
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <Button 
          type="button" 
          size="icon" 
          variant="outline"
          className="text-primary border-primary hover:bg-primary/10 flex-shrink-0 h-10 w-10" 
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
          variant="default" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 h-10 w-10 shadow-md" 
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
