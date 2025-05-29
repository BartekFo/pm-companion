'use client';

import { createContext, useContext, type ReactNode, useMemo } from 'react';
import { createMongoAbility, type RawRuleOf } from '@casl/ability';
import type { AppAbility } from './abilities';

const AbilityContext = createContext<AppAbility | undefined>(undefined);

interface AbilityProviderProps {
  rules: RawRuleOf<AppAbility>[];
  children: ReactNode;
}

export function AbilityProvider({ rules, children }: AbilityProviderProps) {
  const ability = useMemo(() => {
    return createMongoAbility<AppAbility>(rules);
  }, [rules]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility(): AppAbility {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error('useAbility must be used within AbilityProvider');
  }
  return ability;
}
