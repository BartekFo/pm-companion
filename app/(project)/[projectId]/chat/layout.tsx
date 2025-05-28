import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getProjectById } from '@/lib/db/queries';
import Script from 'next/script';

export const experimental_ppr = true;

interface ChatLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ChatLayout({
  children,
  params,
}: ChatLayoutProps) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);

  if (!session) {
    redirect('/login');
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    redirect('/');
  }

  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar projectId={project.id} user={session.user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
