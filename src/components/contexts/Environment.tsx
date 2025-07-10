import React, {createContext, PropsWithChildren, ReactNode, useContext, useEffect} from 'react'

import { AXIOS_INSTANCE } from '@/axios-instance'

export type EnvironmentVariables = {
  NEXT_PUBLIC_BE_URL?: string,
  environment: string
}

interface EnvironmentContextProps {
  variables?: EnvironmentVariables
}

export const EnvironmentContext = createContext<EnvironmentContextProps>({});

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  
  return context;
}

interface EnvironmentProps {
  variables: EnvironmentVariables
}

export default function Environment({children, variables}: PropsWithChildren<EnvironmentProps>): ReactNode {
  // Update axios baseURL when variables change
  useEffect(() => {
    if (variables.NEXT_PUBLIC_BE_URL) {
      AXIOS_INSTANCE.defaults.baseURL = variables.NEXT_PUBLIC_BE_URL;
    }
  }, [variables.NEXT_PUBLIC_BE_URL]);

  return (
    <EnvironmentContext.Provider value={{ variables }}>
      {children}
    </EnvironmentContext.Provider>
  )
}
