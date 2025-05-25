'use client';

import { useEffect, useState, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import { UploadArea } from './upload-area';
import type { IFileUploadProps } from './types';
import { Label } from '@/components/ui/label';
import { FileItem } from './file-item';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import type { ProjectFile } from '@/lib/db/schema';

export function FileUpload({
  name = 'files',
  accept = '.pdf',
  multiple = true,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  className,
  defaultFiles,
}: IFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>([]);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setExistingFiles(defaultFiles ?? []);
  }, [defaultFiles]);

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
    const allowedTypes = accept.split(',').map((type) => type.trim());
    const validFiles = newFiles.filter((file) => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isValidType = allowedTypes.some(
        (type) =>
          type === extension || file.type.includes(type.replace('.', '')),
      );

      if (!isValidType) {
        toast.error(`${file.name}: Unsupported file type`);
        return false;
      }

      if (file.size > maxFileSize) {
        toast.error(
          `${file.name}: File too large (max ${maxFileSize / 1024 / 1024}MB)`,
        );
        return false;
      }

      return true;
    });

    const existingFileNames = new Set(files.map((file) => file.name));
    const uniqueFiles = validFiles.filter((file) => {
      if (existingFileNames.has(file.name)) {
        toast.error(`${file.name}: File already added`);
        return false;
      }
      return true;
    });

    const remainingSlots = maxFiles - files.length;
    if (uniqueFiles.length > remainingSlots && remainingSlots > 0) {
      toast.error(`Only ${remainingSlots} more files can be added`);
    } else if (remainingSlots === 0) {
      toast.error(`Maximum ${maxFiles} files allowed`);
    }

    const filesToAdd = uniqueFiles.slice(0, remainingSlots);
    setFiles((prev) => [...prev, ...filesToAdd]);

    if (filesToAdd.length === 1) {
      toast.success(`${filesToAdd[0].name} added`);
    } else {
      toast.success(`${filesToAdd.length} files added`);
    }
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
    setExistingFiles((prev) => prev.filter((file) => file.fileName !== name));
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="space-y-2"
      >
        <AnimatePresence initial={false}>
          {existingFiles.map((file) => (
            <FileItem
              key={file.fileName}
              fileName={file.fileName}
              onRemove={removeFile}
            />
          ))}
          {files.map((file) => (
            <FileItem
              key={file.name}
              fileName={file.name}
              onRemove={removeFile}
            />
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

      {defaultFiles
        ?.filter(
          (defaultFile) =>
            !existingFiles.some((existing) => existing.id === defaultFile.id),
        )
        .map((file) => (
          <input
            key={`delete-${file.id}`}
            type="hidden"
            name="filesToDelete"
            value={file.id}
          />
        ))}
    </div>
  );
}
