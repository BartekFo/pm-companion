import type { ProjectFile } from '@/lib/db/schema';

export interface IFileUploadProps {
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  className?: string;
  defaultFiles?: ProjectFile[];
}

export interface IFileItemProps {
  fileName: string;
  onRemove: (name: string) => void;
}

export interface IUploadAreaProps {
  accept: string;
  multiple: boolean;
  name: string;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDrop: (e: React.DragEvent<HTMLButtonElement>) => void;
  onFileSelect: (files: File[]) => void;
}
