export interface IFileUploadProps {
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export interface IFileItemProps {
  file: File;
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
