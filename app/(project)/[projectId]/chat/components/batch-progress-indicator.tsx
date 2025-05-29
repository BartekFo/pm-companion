'use client';

interface BatchProgressIndicatorProps {
  progress: number;
  completedRuns: number;
  totalRuns: number;
}

export function BatchProgressIndicator({
  progress,
  completedRuns,
  totalRuns,
}: BatchProgressIndicatorProps) {
  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(progress, 0)}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
          </div>
        </div>

        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground mix-blend-difference">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {completedRuns} of {totalRuns} files processed
        </span>

        {progress > 0 && progress < 100 && (
          <span className="text-primary font-medium">
            {totalRuns - completedRuns} remaining
          </span>
        )}

        {progress === 100 && (
          <span className="text-green-600 font-medium">Complete!</span>
        )}
      </div>

      {/* Estimated time (placeholder - could be enhanced with real estimates) */}
      {progress > 0 && progress < 100 && completedRuns > 0 && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            Estimated time remaining:{' '}
            {Math.max(1, Math.ceil((totalRuns - completedRuns) * 0.5))} min
          </span>
        </div>
      )}
    </div>
  );
}
