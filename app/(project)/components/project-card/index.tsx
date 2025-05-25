'use client';
import { Heading3 } from '@/components/typography';
import { ROUTES } from '@/lib/constants/routes';
import { PencilLine } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  name: string;
}

export function ProjectCard({ id, name }: ProjectCardProps) {
  return (
    <div className="flex items-center justify-center w-55 h-45 bg-neutral-0 rounded-sm border border-neutral-100 relative hover:border-primary-900 cursor-pointer">
      <Link
        href={ROUTES.PROJECT.EDIT_PROJECT(id)}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="absolute top-2 right-2 p-2 rounded-sm bg-neutral-0 hover:bg-neutral-100 z-10"
      >
        <PencilLine className="w-4 h-4 text-primary-400" />
      </Link>
      <button
        type="button"
        onClick={() => {
          console.log('clicked');
        }}
        className="absolute inset-0 w-full cursor-pointer h-full active:bg-primary-50"
      >
        <div className="text-center px-2 pointer-events-none">
          <Heading3>{name}</Heading3>
        </div>
        <span className="sr-only">Select project</span>
      </button>
    </div>
  );
}
