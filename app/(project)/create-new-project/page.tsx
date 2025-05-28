import { redirect } from 'next/navigation';
import { ProjectHeading } from '../components/project-heading';
import { auth } from '@/app/(auth)/auth';
import { CreateNewProjectForm } from './components/form';
import { ForbiddenError } from '@casl/ability';
import { getCurrentUserAbility } from '@/lib/auth/get-ability';

export default async function CreateNewProjectPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  try {
    const ability = await getCurrentUserAbility();
    ForbiddenError.from(ability).throwUnlessCan('create', 'Project');
  } catch (error) {
    redirect('/');
  }

  return (
    <>
      <ProjectHeading
        title="Create project"
        description="Enter your project details, assign team members to begin collaboration and upload relevant files to share with your Team"
      />
      <CreateNewProjectForm />
    </>
  );
}
