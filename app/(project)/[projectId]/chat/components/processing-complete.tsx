'use client';

import { Button } from '@/components/ui/button';

interface ProcessingCompleteProps {
  successCount: number;
  onContinue: () => void;
}

export function ProcessingComplete({
  successCount,
  onContinue,
}: ProcessingCompleteProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Files Processed Successfully!
        </h2>
        <p className="text-sm text-muted-foreground">
          All {successCount} {successCount === 1 ? 'file has' : 'files have'}{' '}
          been processed and are ready for use.
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">
            {successCount} {successCount === 1 ? 'file' : 'files'} successfully
            processed
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={onContinue} className="w-full" size="lg">
          Continue to Chat
        </Button>

        <p className="text-xs text-muted-foreground">
          You can now ask questions about your uploaded files.
        </p>
      </div>
    </div>
  );
}
