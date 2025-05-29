'use client';
import { useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import { FileProcessingOverlay } from './file-processing-overlay';

export function FileProcess() {
  const [batchId, setBatchId] = useQueryState('batchId');
  const [publicAccessToken, setPublicAccessToken] =
    useQueryState('publicAccessToken');
  const router = useRouter();

  const handleComplete = () => {
    setBatchId(null);
    setPublicAccessToken(null);
    router.refresh();
  };

  const handleDismiss = () => {
    setBatchId(null);
    setPublicAccessToken(null);
  };

  if (!batchId || !publicAccessToken) return null;

  return (
    <FileProcessingOverlay
      batchId={batchId}
      publicAccessToken={publicAccessToken}
      onComplete={handleComplete}
      onDismiss={handleDismiss}
    />
  );
}
