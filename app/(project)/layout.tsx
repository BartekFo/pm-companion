import { getUserProjects } from '@/lib/db/queries';
import type { Metadata } from 'next';
import { SWRConfig } from 'swr';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'PM Companion',
  description: 'Choose an existing project or create a new one to get started',
};

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default async function ProjectLayout({ children }: ProjectLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <SWRConfig
      value={{
        fallback: {
          '/api/projects': getUserProjects(session.user.id),
        },
      }}
    >
      <div className="main-gradient p-6 h-dvh flex flex-col items-center justify-center gap-10">
        {children}
      </div>
    </SWRConfig>
  );
}
