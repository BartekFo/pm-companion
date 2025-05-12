import type { Attachment } from 'ai';
import { LoaderIcon } from './icons';
import { FileCheck2 } from 'lucide-react';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, contentType } = attachment;

  if (contentType !== 'application/pdf') {
    return null;
  }

  return (
    <div
      data-testid="pdf-attachment-info"
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
    >
      {isUploading ? (
        <div
          data-testid="input-attachment-loader"
          className="animate-spin text-zinc-500 shrink-0"
        >
          <LoaderIcon />
        </div>
      ) : (
        <FileCheck2 className="size-6 text-green-600 shrink-0" />
      )}
      <div className="flex flex-col overflow-hidden">
        <div
          className="text-sm font-medium text-foreground truncate"
          title={name ?? 'PDF Document'}
        >
          {name || 'PDF Document'}
        </div>
        {isUploading ? (
          <div className="text-xs text-muted-foreground">Uploading PDF...</div>
        ) : (
          <div className="text-xs text-green-700">PDF ready</div>
        )}
      </div>
    </div>
  );
};
