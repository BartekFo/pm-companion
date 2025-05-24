import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { IFileItemProps } from './types';

export function FileItem({ file, onRemove }: IFileItemProps) {
  return (
    <motion.div
      key={`${file.name}`}
      layout
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-neutral-50/50 rounded-lg"
    >
      <span className="text-sm font-medium text-primary-900 truncate">
        {file.name}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(file.name)}
        className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-200"
      >
        <X className="h-4 w-4 text-primary-500" />
      </Button>
    </motion.div>
  );
}
