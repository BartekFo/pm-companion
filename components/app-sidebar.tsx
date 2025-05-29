'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import AppLogo from './app-logo';
import { PlusIcon } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

interface IAppSidebarProps {
  user: User | undefined;
  projectId: string;
}

export function AppSidebar({ user, projectId }: IAppSidebarProps) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="cursor-pointer max-w-48">
                <AppLogo isHorizontal />
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push(ROUTES.PROJECT.CHAT(projectId));
                    router.refresh();
                  }}
                >
                  <PlusIcon className="h-4.5 w-4.5 text-primary-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="gap-6">
        <div className="h-px w-full bg-neutral-0 dark:bg-neutral-800" />
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
