import { TooltipContent } from './ui/tooltip';

import { ROUTES } from '@/lib/constants/routes';

import { TooltipTrigger } from './ui/tooltip';

import { Tooltip } from './ui/tooltip';
import { PlusIcon } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface IOpenNewChatButtonProps {
  projectId: string;
}

export function OpenNewChatButton({ projectId }: IOpenNewChatButtonProps) {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  return (
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
  );
}
