'use client';

import { useState, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import { UploadArea } from './upload-area';
import type { IFileUploadProps } from './types';
import { Label } from '@/components/ui/label';
import { FileItem } from './file-item';
import { motion } from 'motion/react';

export function FileUpload({
  name = 'files',
  accept = '.pdf,.doc,.docx,.txt',
  multiple = true,
  maxFiles = 10,
  className,
}: IFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (files: File[]) => {
    addFiles(files);
  };

  const addFiles = (newFiles: File[]) => {
    const existingFileNames = new Set(files.map((file) => file.name));
    const uniqueFiles = newFiles.filter(
      (file) => !existingFileNames.has(file.name),
    );
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = uniqueFiles.slice(0, remainingSlots);
    setFiles((prev) => [...prev, ...filesToAdd]);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>Upload important files</Label>
      <UploadArea
        accept={accept}
        multiple={multiple}
        name={name}
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileSelect}
      />
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="space-y-2"
      >
        <AnimatePresence initial={false}>
          {files.map((file) => (
            <FileItem key={file.name} file={file} onRemove={removeFile} />
          ))}
        </AnimatePresence>
      </motion.div>

      {files.map((file) => (
        <input
          key={`hidden-${file.name}`}
          type="file"
          className="hidden"
          name={name}
          ref={(input) => {
            if (input) {
              const dt = new DataTransfer();
              dt.items.add(file);
              input.files = dt.files;
            }
          }}
        />
      ))}
    </div>
  );
}
