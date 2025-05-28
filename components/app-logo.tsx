'use client';

interface AppLogoProps {
  isHorizontal?: boolean;
}

export default function AppLogo({ isHorizontal = false }: AppLogoProps) {
  return (
    <div>
      <img
        className="dark:hidden"
        src={
          isHorizontal
            ? '/images/full-logo-horizontal-sidebar.svg'
            : '/images/full-logo-white.svg'
        }
        alt="POCompanion Logo"
        width={isHorizontal ? 300 : 220}
      />
      <img
        className="hidden dark:block"
        src={
          isHorizontal
            ? '/images/full-logo-horizontal-sidebar-dark.svg'
            : '/images/full-logo-dark.svg'
        }
        alt="POCompanion Logo"
        width={isHorizontal ? 300 : 220}
      />
    </div>
  );
}
