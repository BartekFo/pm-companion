import { getUserProjects } from '@/lib/db/queries';
import { CreateProjectButton } from '../create-project-button';
import { ProjectCard } from '../project-card';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export async function ProjectsList() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const projects = await getUserProjects(session.user.id);

  return (
    <div className="flex flex-wrap rounded-sm gap-2.5 p-6 border border-primary-200 max-w-5xl w-full min-h-104 bg-neutral-0/40">
      {projects.map((project) => (
        <ProjectCard key={project.id} id={project.id} name={project.name} />
      ))}
      <CreateProjectButton />
    </div>
  );
}

export function ProjectsListSkeleton() {
  return (
    <div className="flex flex-wrap rounded-sm gap-2.5 p-6 border border-primary-200 max-w-5xl w-full min-h-104 bg-[#FFFFFF66]">
      <Skeleton className="w-55 h-45" />
      <Skeleton className="w-55 h-45" />
      <Skeleton className="w-55 h-45" />
      <Skeleton className="w-55 h-45" />
    </div>
  );
}
