import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
} from 'react';

export type EnvironmentVariables = {
  NEXT_PUBLIC_BASE_PATH?: string;
  environment: string;
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
