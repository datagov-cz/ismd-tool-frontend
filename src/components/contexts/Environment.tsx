import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
} from 'react';

export type EnvironmentVariables = {
  NEXT_PUBLIC_BASE_PATH?: string;
  environment: string;
  /**
   * Show the NIA login button. Set server-side from KEYCLOAK_NIA_ENABLED and read at
   * request time, so it is a Container App env-var change rather than a rebuild —
   * unlike NEXT_PUBLIC_*, which Next.js inlines at build time.
   *
   * Must be flipped together with enable_nia in keycloak-config: those live in a
   * different Terraform state and cannot reference each other. Button without the
   * IdP = Keycloak error page.
   */
  niaEnabled?: boolean;
};

interface EnvironmentContextProps {
  variables?: EnvironmentVariables;
}

export const EnvironmentContext = createContext<EnvironmentContextProps>({});

export function useEnvironment() {
  const context = useContext(EnvironmentContext);

  if (context === undefined) {
    throw new Error(
      'useEnvironment must be used within an EnvironmentProvider',
    );
  }

  return context;
}

interface EnvironmentProps {
  variables: EnvironmentVariables;
}

export default function Environment({
  children,
  variables,
}: PropsWithChildren<EnvironmentProps>): ReactNode {
  return (
    <EnvironmentContext.Provider value={{ variables }}>
      {children}
    </EnvironmentContext.Provider>
  );
}
