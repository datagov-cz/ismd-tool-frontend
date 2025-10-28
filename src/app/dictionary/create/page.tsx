'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useUserStore } from '@/store/userStore';

const CreateDictionary = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  // TODO: Replace with proper auth guard. Use redirect in a server component.
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <div>CreateDictionary</div>;
};

export default CreateDictionary;
