import { redirect } from 'next/navigation';
import { ProjectHeading } from '../../components/project-heading';
import { auth } from '@/app/(auth)/auth';
import {
  EditProjectFormDataLayer,
  EditProjectFormDataLayerSkeleton,
} from './components/edit-project-form-data-layer';
import { Suspense } from 'react';

interface EditProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { projectId } = await params;

  return (
    <>
      <ProjectHeading
        title="Edit project"
        description="Update your project details, manage team members and add or remove files"
      />
      <Suspense fallback={<EditProjectFormDataLayerSkeleton />}>
        <EditProjectFormDataLayer projectId={projectId} />
      </Suspense>
    </>
  );
}
