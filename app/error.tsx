'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          We&apos;ve been notified and are looking into it. Try refreshing the
          page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            Go home
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <p className="font-mono text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
