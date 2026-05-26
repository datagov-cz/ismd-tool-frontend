'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

import { useGetCurrentUser, UserInfoDto } from '@/api/generated';

type CurrentUserContextValue = {
  user: UserInfoDto | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
};

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(
  undefined,
);

export const CurrentUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { status } = useSession();
  const sessionExists = status === 'authenticated';

  const { data, isLoading } = useGetCurrentUser({
    query: { enabled: sessionExists },
  });

  return (
    <CurrentUserContext.Provider
      value={{
        user: data?.data,
        isLoggedIn: sessionExists && !!data?.data?.userId,
        isLoading: status === 'loading' || isLoading,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const ctx = useContext(CurrentUserContext);
  if (!ctx)
    throw new Error('useCurrentUser must be used within CurrentUserProvider');
  return ctx;
};
