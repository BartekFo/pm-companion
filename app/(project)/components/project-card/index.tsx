'use client';
import { Heading3 } from '@/components/typography';
import { ROUTES } from '@/lib/constants/routes';
import { PencilLine } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/use-permissions';

interface ProjectCardProps {
  id: string;
  name: string;
  role: string;
}

export function ProjectCard({ id, name, role }: ProjectCardProps) {
  const { canManageProject } = usePermissions();

  const canEdit = role === 'owner' || canManageProject();

  return (
    <div className="flex items-center justify-center w-55 h-45 bg-neutral-0 rounded-sm border border-neutral-100 relative hover:border-primary-900 cursor-pointer">
      {canEdit && (
        <Link
          href={ROUTES.PROJECT.EDIT_PROJECT(id)}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 p-2 rounded-sm bg-neutral-0 hover:bg-neutral-100 z-10"
        >
          <PencilLine className="w-4 h-4 text-primary-400" />
        </Link>
      )}
      <Link
        href={ROUTES.PROJECT.CHAT(id)}
        className="grid place-items-center absolute inset-0 w-full cursor-pointer h-full active:bg-primary-50"
      >
        <Heading3>{name}</Heading3>
        <span className="sr-only">Select project</span>
      </Link>
    </div>
  );
}
