
'use client';

import { format } from 'date-fns';

interface DateSeparatorProps {
  timestamp: number;
}

export function DateSeparator({ timestamp }: DateSeparatorProps) {
  return (
    <div className="flex justify-center my-4" aria-label={`Date: ${format(new Date(timestamp), 'MMMM d, yyyy')}`}>
      <div className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full shadow-sm">
        {format(new Date(timestamp), 'MMMM d, yyyy')}
      </div>
    </div>
  );
}
