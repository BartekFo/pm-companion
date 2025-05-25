import {
  getProjectById,
  getProjectFiles,
  getProjectMembers,
} from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { EditProjectForm } from './edit-project-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditProjectFormDataLayerProps {
  projectId: string;
}

export async function EditProjectFormDataLayer({
  projectId,
}: EditProjectFormDataLayerProps) {
  const [project, members, files] = await Promise.all([
    getProjectById(projectId),
    getProjectMembers(projectId),
    getProjectFiles(projectId),
  ]);

  if (!project) {
    redirect('/project');
  }
  return <EditProjectForm project={project} members={members} files={files} />;
}

export function EditProjectFormDataLayerSkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-150 w-full">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-45 w-full" />
    </div>
  );
}
