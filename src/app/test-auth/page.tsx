'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

import { axiosInstance } from '@/axios-instance';

export default function TestAuth() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <button onClick={() => signIn('keycloak')}>Sign in with Keycloak</button>
    );
  }

  const testApiCall = async () => {
    try {
      const result = await axiosInstance({
        url: '/api/test-endpoint',
        method: 'GET',
      });
      console.log('API Success:', result);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div>
      <p>Signed in as {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
      <button onClick={testApiCall}>Test API Call</button>
    </div>
  );
}
