'use client';

interface AppLogoProps {
  width?: number;
}

export default function AppLogo({ width = 300 }: AppLogoProps) {
  return (
    <div>
      <img
        className="dark:hidden"
        src="/images/full-logo-horizontal-sidebar.svg"
        alt="POCompanion Logo"
        width={width}
      />
      <img
        className="hidden dark:block"
        src="/images/full-logo-horizontal-sidebar-dark.svg"
        alt="POCompanion Logo"
        width={width}
      />
    </div>
  );
}
