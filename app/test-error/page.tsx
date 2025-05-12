'use client';

import { useState } from 'react';

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('This is a test error');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        type="button"
        onClick={() => setShouldError(true)}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Trigger Error
      </button>
    </div>
  );
}
