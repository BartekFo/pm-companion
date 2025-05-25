import { redirect } from 'next/navigation';
import { ProjectHeading } from './components/project-heading';
import { auth } from '../(auth)/auth';
import { ProjectsList, ProjectsListSkeleton } from './components/projects-list';
import { Suspense } from 'react';

export default async function ProjectPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }
  return (
    <>
      <ProjectHeading
        title="Welcome to PM Companion!"
        description="Choose an existing project or create a new one to get started"
      />
      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsList />
      </Suspense>
    </>
  );
}
