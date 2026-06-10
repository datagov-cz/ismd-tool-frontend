'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const PROTECTED_PATTERNS = [
  /^\/concept\/[^/]+$/,
  /^\/concept\/[^/]+\/edit$/,
  /^\/dictionary\/[^/]+$/,
  /^\/dictionary\/[^/]+\/edit$/,
];

const EXCLUDED_PATTERNS = [
  /^\/concept\/nkd(\/edit)?$/,
  /^\/dictionary\/nkd(\/edit)?$/,
];

const isProtected = (pathname: string) =>
  !EXCLUDED_PATTERNS.some((re) => re.test(pathname)) &&
  PROTECTED_PATTERNS.some((re) => re.test(pathname));

export const SessionGuard = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isSigningOut = useRef(false);

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError' && !isSigningOut.current) {
      isSigningOut.current = true;
      signOut({ callbackUrl: process.env.NEXT_PUBLIC_BASE_PATH });
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated' && isProtected(pathname)) {
      router.replace('/');
    }
  }, [status, pathname, router]);

  if (status === 'unauthenticated' && isProtected(pathname)) {
    return null;
  }

  return <>{children}</>;
};
