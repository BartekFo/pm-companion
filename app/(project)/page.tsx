import { ProjectHeading } from './components/project-heading';

export default function ProjectPage() {
  return (
    <div className="main-gradient h-dvh flex items-center justify-center">
      <ProjectHeading
        title="Welcome to PM Companion!"
        description="Choose an existing project or create a new one to get started"
      />
    </div>
  );
}
