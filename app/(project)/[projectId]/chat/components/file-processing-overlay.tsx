'use client';

import { useRealtimeBatch } from '@trigger.dev/react-hooks';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessingStatusCard } from './processing-status-card';
import { ProcessingComplete } from './processing-complete';
import { ProcessingError } from './processing-error';
import { useEffect, useState } from 'react';

interface FileProcessingOverlayProps {
  batchId: string;
  publicAccessToken: string;
  onComplete: () => void;
  onDismiss: () => void;
}

export function FileProcessingOverlay({
  batchId,
  publicAccessToken,
  onComplete,
  onDismiss,
}: FileProcessingOverlayProps) {
  const { runs, error } = useRealtimeBatch(batchId, {
    accessToken: publicAccessToken,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [shouldAutoComplete, setShouldAutoComplete] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const totalRuns = runs.length;
  const completedRuns = runs.filter(
    (run) => run.status === 'COMPLETED' || run.status === 'FAILED',
  ).length;
  const failedRuns = runs.filter((run) => run.status === 'FAILED');
  const successfulRuns = runs.filter((run) => run.status === 'COMPLETED');
  const isComplete = completedRuns === totalRuns && totalRuns > 0;
  const hasErrors = failedRuns.length > 0;

  useEffect(() => {
    if (!batchId || !publicAccessToken) return;

    if (isComplete && !hasErrors && !shouldAutoComplete) {
      setShouldAutoComplete(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    isComplete,
    hasErrors,
    shouldAutoComplete,
    onComplete,
    batchId,
    publicAccessToken,
  ]);

  if (!batchId || !publicAccessToken) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Main content */}
      <Card
        className={`relative z-10 w-full max-w-md mx-4 border-0 shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <CardContent className="p-6">
          {error ? (
            <ProcessingError error={error.message} onDismiss={onDismiss} />
          ) : isComplete && !hasErrors ? (
            <ProcessingComplete
              successCount={successfulRuns.length}
              onContinue={onComplete}
            />
          ) : hasErrors && isComplete ? (
            <ProcessingError
              error="Some files failed to process"
              failedRuns={failedRuns}
              onDismiss={onDismiss}
            />
          ) : (
            <ProcessingStatusCard
              runs={runs}
              totalRuns={totalRuns}
              completedRuns={completedRuns}
              progress={totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
