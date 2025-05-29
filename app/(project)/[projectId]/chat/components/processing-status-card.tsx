'use client';

import { ProcessingAnimation } from './processing-animation';
import { BatchProgressIndicator } from './batch-progress-indicator';

interface Run {
  id: string;
  status: string;
  payload?: any;
}

interface ProcessingStatusCardProps {
  runs: Run[];
  totalRuns: number;
  completedRuns: number;
  progress: number;
}

export function ProcessingStatusCard({
  runs,
  totalRuns,
  completedRuns,
  progress,
}: ProcessingStatusCardProps) {
  const getFileName = (run: Run): string => {
    if (run.payload?.fileName) return run.payload.fileName;
    if (run.payload?.filename) return run.payload.filename;
    if (run.payload?.name) return run.payload.name;
    if (run.payload?.file?.name) return run.payload.file.name;
    return `File ${runs.indexOf(run) + 1}`;
  };

  const currentlyProcessing = runs.find(
    (run) => run.status === 'EXECUTING' || run.status === 'RUNNING',
  );

  return (
    <div className="text-center space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <ProcessingAnimation />
        <h2 className="text-xl font-semibold text-foreground">
          Processing Your Files
        </h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we process your uploaded files. This may take a few
          minutes.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <BatchProgressIndicator
          progress={progress}
          completedRuns={completedRuns}
          totalRuns={totalRuns}
        />

        {/* Current file being processed */}
        {currentlyProcessing && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Processing: {getFileName(currentlyProcessing)}</span>
            </div>
          </div>
        )}

        {/* Files list if we have file names */}
        {runs.length > 0 &&
          runs.some(
            (run) => getFileName(run) !== `File ${runs.indexOf(run) + 1}`,
          ) && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-foreground">Files:</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between text-xs px-3 py-1 rounded-md bg-muted/50"
                  >
                    <span className="truncate">{getFileName(run)}</span>
                    <div className="flex-shrink-0 ml-2">
                      {run.status === 'COMPLETED' && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
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
                      )}
                      {run.status === 'FAILED' && (
                        <div className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {(run.status === 'EXECUTING' ||
                        run.status === 'RUNNING') && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                      {run.status === 'QUEUED' && (
                        <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Warning */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
        <p>
          Please don&apos;t close this window or navigate away while files are
          being processed.
        </p>
      </div>
    </div>
  );
}
