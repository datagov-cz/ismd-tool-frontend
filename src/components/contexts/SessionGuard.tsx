import { ReactNode, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';

export const SessionGuard = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const isSigningOut = useRef(false);

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError' && !isSigningOut.current) {
      isSigningOut.current = true;
      signOut({ callbackUrl: process.env.NEXT_PUBLIC_BASE_PATH });
    }
  }, [session]);

  return <>{children}</>;
};
