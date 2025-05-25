import { Heading3 } from '@/components/typography';

interface ProjectCardProps {
  id: string;
  name: string;
}

export function ProjectCard({ id, name }: ProjectCardProps) {
  return (
    <div className="flex items-center justify-center w-55 h-45 bg-neutral-0 rounded-sm border border-neutral-100 hover:border-primary-900 cursor-pointer active:bg-primary-50">
      <div className="text-center px-2">
        <Heading3>{name}</Heading3>
      </div>
    </div>
  );
}
