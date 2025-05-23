import { Heading2, LeadText } from '@/components/typography';

interface ProjectHeadingProps {
  title: string;
  description: string;
}

export function ProjectHeading({ title, description }: ProjectHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-4 max-w-156">
      <img src={'/images/logo.svg'} alt="POCompanion Logo" width={60} />
      <Heading2 className="text-center">{title}</Heading2>
      <LeadText className="text-center">{description}</LeadText>
    </div>
  );
}
