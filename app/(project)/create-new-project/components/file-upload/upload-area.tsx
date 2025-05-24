import { type ChangeEvent, useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IUploadAreaProps } from './types';
import { SmallText } from '@/components/typography';

export function UploadArea({
  accept,
  multiple,
  name,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: IUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && fileInputRef.current) {
      onFileSelect(Array.from(e.target.files));

      fileInputRef.current.value = '';
    }
  };

  return (
    <button
      type="button"
      className={cn(
        'flex gap-3 items-center justify-center w-full border-1 border-dashed rounded-lg px-4 py-9 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 bg-primary-50 hover:border-gray-400',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
    >
      <Upload className="h-6 w-6 text-primary-950" />
      <SmallText className="text-gray-600 font-medium">
        Drag & Drop or <span className="text-primary-700">Choose file</span>
      </SmallText>

      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </button>
  );
}
