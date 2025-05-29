'use client';

import { Button } from '@/components/ui/button';

interface Run {
  id: string;
  status: string;
  payload?: any;
  error?: any;
}

interface ProcessingErrorProps {
  error: string;
  failedRuns?: Run[];
  onDismiss: () => void;
}

export function ProcessingError({
  error,
  failedRuns = [],
  onDismiss,
}: ProcessingErrorProps) {
  const getFileName = (run: Run): string => {
    if (run.payload?.fileName) return run.payload.fileName;
    if (run.payload?.filename) return run.payload.filename;
    if (run.payload?.name) return run.payload.name;
    if (run.payload?.file?.name) return run.payload.file.name;
    return `File ${failedRuns.indexOf(run) + 1}`;
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Processing Failed
        </h2>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>

      {failedRuns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Failed Files:</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-32 overflow-y-auto">
            <div className="space-y-2">
              {failedRuns.map((run) => (
                <div key={run.id} className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-red-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-700 dark:text-red-300 truncate">
                    {getFileName(run)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-sm">What to do next:</span>
          </div>
          <ul className="text-left text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-7">
            <li>• Remove the failed file(s) and try uploading again</li>
            <li>• Check if the file format is supported</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={onDismiss} className="flex-1">
            Continue
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          You can continue using the chat, but the failed files won&apos;t be
          available for questions.
        </p>
      </div>
    </div>
  );
}
