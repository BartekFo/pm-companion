'use client';

export function ProcessingAnimation() {
  return (
    <div className="flex justify-center mb-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-4 h-4 bg-primary rounded-full transform -translate-x-2 -translate-y-2" />
        </div>

        <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
        </div>
        <div className="absolute -top-2 -left-2 w-full h-full">
          <div
            className="absolute top-0 left-1/2 w-2 h-2 bg-primary/60 rounded-full animate-ping"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="absolute top-1/2 right-0 w-2 h-2 bg-primary/60 rounded-full animate-ping"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-2 h-2 bg-primary/60 rounded-full animate-ping"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-0 w-2 h-2 bg-primary/60 rounded-full animate-ping"
            style={{ animationDelay: '1.5s' }}
          />
        </div>
      </div>
    </div>
  );
}
