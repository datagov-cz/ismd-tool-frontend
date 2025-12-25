'use client';

import { createContext, ReactNode, useContext } from 'react';

import { useGetCurrentUser, UserInfoDto } from '@/api/generated';

interface UserInfoContextType {
  userInfo: UserInfoDto | null;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>({
  userInfo: null,
});

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const userInfo = useGetCurrentUser();

  return (
    <UserInfoContext.Provider value={{ userInfo: userInfo.data?.data ?? null }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
}
