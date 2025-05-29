'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { Session } from 'next-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetcher } from '@/lib/utils';
import useSWR from 'swr';
import type { Project } from '@/lib/db/schema';
import { Pencil, PlusIcon } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import Link from 'next/link';
import { Can } from './auth/can';
import { memo } from 'react';
import { ThemeSwitch } from './theme-switch';

interface IChatHeaderProps {
  chatId: string;
  selectedModelId: string;
  isReadonly: boolean;
  session: Session;
  projectId: string;
}

function PureChatHeader({
  chatId,
  selectedModelId,
  isReadonly,
  projectId,
  session,
}: IChatHeaderProps) {
  const router = useRouter();
  const { open } = useSidebar();
  const { data: projects } = useSWR<Array<Project>>('/api/projects', fetcher);

  const { width: windowWidth } = useWindowSize();

  const project = projects?.find((p) => p.id === projectId);

  return (
    <header className="flex sticky top-0 bg-transparent py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      <Select
        value={projectId}
        onValueChange={(value) => {
          router.push(ROUTES.PROJECT.CHAT(value));
        }}
      >
        <SelectTrigger className="w-45 mx-auto border-none justify-start bg-transparent">
          <SelectValue placeholder="Select Project">
            {project?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="shadow-1">
          {projects?.map((project) => (
            <div key={project.id} className="relative">
              <SelectItem value={project.id}>
                <div className="flex items-center justify-between w-full">
                  {project.name}
                </div>
              </SelectItem>
              <Can action="manage" subject="Project">
                <Link
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-neutral-0 dark:hover:bg-neutral-600 cursor-pointer"
                  href={ROUTES.PROJECT.EDIT_PROJECT(project.id)}
                >
                  <Pencil className="h-4 w-4 text-primary-400 " />
                </Link>
              </Can>
            </div>
          ))}
          <Can action="create" subject="Project">
            <Link href={ROUTES.PROJECT.CREATE_NEW_PROJECT}>
              <div className="pl-8 p-1.5 pr-2 font-medium text-sm flex items-center justify-between w-full">
                New Project
                <PlusIcon className="text-primary-400 w-4 h-4" />
              </div>
            </Link>
          </Can>
        </SelectContent>
      </Select>

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}
      <ThemeSwitch />
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
