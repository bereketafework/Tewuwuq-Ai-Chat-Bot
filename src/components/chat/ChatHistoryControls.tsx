
'use client';

import { Button } from '@/components/ui/button';
import { Eraser, SearchCheck } from 'lucide-react';
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
  onClearHistory: () => void;
  activeSessionId: string | null;
}

export function ChatHistoryControls({ onClearHistory, activeSessionId }: ChatHistoryControlsProps) {
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { performSessionAnalysis, isAnalyzingSession } = useChat();

  const handleAnalyzeSession = useCallback(async () => {
    if (!activeSessionId) return;
    setAnalysisResult(null); // Clear previous result before new analysis
    const result = await performSessionAnalysis(activeSessionId);
    setAnalysisResult(result);
    // Dialog is controlled by `analysisOpen` which is set by DialogTrigger's onOpenChange or manually.
    // If the result is fetched successfully, it will be shown.
    // If an error occurs, result will be null and the dialog will show an error message.
  }, [activeSessionId, performSessionAnalysis]);

  const renderTextWithFormatting = (text: string | null) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\n)/g).filter(part => part.length > 0);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
      }
      if (part === '\n') {
        return <br key={index} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2"> {/* Reduced gap for smaller screens */}
      {/* Analyze Session Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground px-2 sm:px-3" // Adjusted padding
            onClick={() => {
              // setAnalysisOpen(true); // Managed by Dialog's onOpenChange
              handleAnalyzeSession(); // Fetch analysis when triggered
            }}
            disabled={!activeSessionId || isAnalyzingSession}
          >
            <SearchCheck className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{isAnalyzingSession ? 'Analyzing...' : 'Analyze Chat'}</span>
            <span className="sm:hidden">Analyze</span> {/* Shorter text for mobile */}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat Session Analysis</DialogTitle>
            <DialogDescription>
              A deep analysis of the current chat session.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow py-4 pr-2 min-h-[200px]"> {/* Added min-height */}
            {isAnalyzingSession && !analysisResult && (
              <div className="space-y-3 p-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-2/3 mt-5" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            )}
            {!isAnalyzingSession && analysisResult && (
              <div className="text-sm whitespace-pre-wrap p-2">{renderTextWithFormatting(analysisResult)}</div>
            )}
            {!isAnalyzingSession && !analysisResult && ( // Handles case after loading but no result (e.g. error)
              <p className="text-sm text-muted-foreground p-2">
                {activeSessionId ? "No analysis available or an error occurred during analysis." : "Please select a session to analyze."}
              </p>
            )}
          </ScrollArea>
           <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Clear Chat AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2 sm:px-3">
            <Eraser className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Clear Chat</span>
            <span className="sm:hidden">Clear</span> {/* Shorter text for mobile */}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the messages in the current chat session. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClearHistory} className="bg-destructive hover:bg-destructive/90">
              Clear Current Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
