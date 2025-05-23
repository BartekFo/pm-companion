import { redirect } from 'next/navigation';
import { CreateProjectButton } from './components/create-project-button';
import { ProjectHeading } from './components/project-heading';
import { auth } from '../(auth)/auth';

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
      <div className="flex flex-wrap rounded-sm gap-2.5 p-6 border border-primary-200 max-w-5xl w-full min-h-104 bg-[#FFFFFF66]">
        <CreateProjectButton />
      </div>
    </>
  );
}
