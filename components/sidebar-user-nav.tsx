'use client';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toast } from './toast';
import { LoaderIcon } from './icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Text } from './typography';

export function SidebarUserNav({ user }: { user: User }) {
  const { status } = useSession();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-auto p-0">
              {status === 'loading' ? (
                <div className="size-4">
                  <LoaderIcon />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <Text className="text-sm font-medium">
                      {user.email?.split('@')[0]}
                    </Text>
                    <Text className="text-xs text-neutral-800">
                      {user.email}
                    </Text>
                  </div>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="user-nav-menu"
            side="top"
            className="w-(--radix-popper-anchor-width)"
          >
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  if (status === 'loading') {
                    toast({
                      type: 'error',
                      description:
                        'Checking authentication status, please try again!',
                    });
                    return;
                  }
                  signOut({
                    redirectTo: '/',
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
