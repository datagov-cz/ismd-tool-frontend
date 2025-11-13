'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/shared/Button';

export default function TestAuth() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <Button
        className="w-max"
        onClick={() => signIn('keycloak', { prompt: 'login' })}
      >
        Sign in with Keycloak
      </Button>
    );
  }

  return (
    <div>
      <p>Signed in as {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}
