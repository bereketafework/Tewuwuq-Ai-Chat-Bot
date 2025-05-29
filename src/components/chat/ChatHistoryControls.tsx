
'use client';

import React from 'react'; // Added React import
import { Button } from '@/components/ui/button';
import { SearchCheck, Trash2 } from 'lucide-react'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatHistoryControlsProps {
  onClearHistory: () => void; // This will now trigger session deletion
  activeSessionId: string | null;
}

export function ChatHistoryControls({ onClearHistory, activeSessionId }: ChatHistoryControlsProps) {
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { performSessionAnalysis, isAnalyzingSession } = useChat();

  const handleAnalyzeSession = useCallback(async () => {
    if (!activeSessionId) return;
    setAnalysisResult(null); // Clear previous result before new analysis
    // analysisOpen is managed by Dialog's onOpenChange, so we don't need to set it true here.
    // The DialogTrigger already handles opening.
    const result = await performSessionAnalysis(activeSessionId);
    setAnalysisResult(result);
  }, [activeSessionId, performSessionAnalysis]);

  const renderTextWithFormatting = (text: string | null) => {
    if (!text) return null;
    // Improved Markdown-like rendering for bold and newlines
    return text.split(/(\n)/g).map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line === '\n' 
          ? <br /> 
          : line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.substring(2, part.length - 2)}</strong>;
              }
              return <span key={partIndex}>{part}</span>;
            })}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
            onClick={() => {
              // setAnalysisOpen(true); // DialogTrigger handles this
              handleAnalyzeSession(); 
            }}
            disabled={!activeSessionId || isAnalyzingSession}
          >
            <SearchCheck className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{isAnalyzingSession && !analysisResult ? 'Analyzing...' : 'Analyze Chat'}</span>
            <span className="sm:hidden">Analyze</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-4 md:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle>Chat Session Analysis</DialogTitle>
            <DialogDescription>
              A deep analysis of the current chat session.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow min-h-[200px] border rounded-md bg-muted/50">
            {isAnalyzingSession && !analysisResult && (
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-2/3 mt-5" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            )}
            {!isAnalyzingSession && analysisResult && (
              <div className="text-sm whitespace-pre-wrap p-4 break-words">{renderTextWithFormatting(analysisResult)}</div>
            )}
            {!isAnalyzingSession && !analysisResult && (
              <p className="text-sm text-muted-foreground p-4 text-center">
                {activeSessionId ? "Click 'Analyze Chat' to start or an error occurred." : "Please select a session to analyze."}
              </p>
            )}
          </ScrollArea>
           <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4 self-end">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive px-2 sm:px-3"
            disabled={!activeSessionId} // Disable if no active session
          >
            <Trash2 className="mr-1 sm:mr-2 h-4 w-4" /> 
            <span className="hidden sm:inline">Delete Session</span> 
            <span className="sm:hidden">Delete</span> 
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat session?</AlertDialogTitle> 
            <AlertDialogDescription>
              This action will permanently delete the current chat session and all its messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {/* Resets any component-local state if needed */}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClearHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Session 
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
