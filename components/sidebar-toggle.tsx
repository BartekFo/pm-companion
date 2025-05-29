import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Button } from './ui/button';
import { PanelLeftClose } from 'lucide-react';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="ghost"
          className="p-2 [&_svg]:size-6"
        >
          <PanelLeftClose className="text-primary-500" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
