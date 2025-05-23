import { SmallText } from '@/components/typography';
import Link from 'next/link';
import { SquarePlus } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

export function CreateProjectButton() {
  return (
    <Link href={ROUTES.PROJECT.CREATE_NEW_PROJECT}>
      <div className="flex flex-col items-center justify-center gap-1 w-55 h-45 rounded-sm border border-dotted border-primary-300 bg-neutral-0 hover:border-primary-900 group cursor-pointer active:bg-primary-50">
        <SquarePlus className="text-primary-900 group-hover:fill-primary-900 group-hover:[&>path]:text-neutral-0" />
        <SmallText>Create new project</SmallText>
      </div>
    </Link>
  );
}
