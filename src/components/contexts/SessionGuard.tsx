import { ReactNode, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';

export const SessionGuard = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: process.env.NEXT_PUBLIC_BASE_PATH });
    }
  }, [session]);

  return <>{children}</>;
};
