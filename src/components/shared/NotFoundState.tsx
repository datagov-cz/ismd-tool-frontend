'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';

interface Props {
  title: string;
  backLabel: string;
}

export const NotFoundState = ({ title, backLabel }: Props) => {
  const router = useRouter();

  return (
    <div className="w-full h-full flex items-center justify-center flex-1 flex-col gap-2">
      <h1 className="text-2xl">{title}</h1>
      <GovButton type="solid" color="primary" onClick={() => router.back()}>
        {backLabel}
      </GovButton>
    </div>
  );
};
