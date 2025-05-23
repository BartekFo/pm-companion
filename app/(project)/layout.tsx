import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PM Companion',
  description: 'Choose an existing project or create a new one to get started',
};

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="main-gradient p-6 h-dvh flex flex-col items-center justify-center gap-[2.5rem]">
      {children}
    </div>
  );
}
