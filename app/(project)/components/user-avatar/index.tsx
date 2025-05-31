'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from '@/components/toast';
import type { User } from 'next-auth';

interface IUserAvatarProps {
  user: User;
}

export function UserAvatar({ user }: IUserAvatarProps) {
  const { status } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="h-auto p-0 absolute top-6 right-6">
          {status === 'loading' ? (
            <div className="size-4">
              <Loader />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {user.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-testid="user-nav-menu"
        side="bottom"
        className="w-(--radix-popper-anchor-width) mr-6"
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
  );
}
