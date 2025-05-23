import { redirect } from 'next/navigation';
import { ProjectHeading } from '../components/project-heading';
import { auth } from '@/app/(auth)/auth';

export default async function CreateNewProjectPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <ProjectHeading
        title="Create project"
        description="Enter your project details, assign team members to begin collaboration and upload relevant files to share with your Team"
      />
    </div>
  );
}
