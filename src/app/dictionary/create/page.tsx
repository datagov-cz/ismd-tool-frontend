'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { UploadFlow } from '@/components/uploadFlow/UploadFlow';

import { CreateForm } from './create-form';

const CreateDictionary = () => {
  const { user, isLoading } = useCurrentUser();
  const t = useTranslations('CreateOntology');
  const router = useRouter();

  if (isLoading)
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <CircularLoader />
      </div>
    );

  if (!user?.userId) return null;

  return (
    <div className="w-full pt-5 pb-10 bg-primary-subtlest">
      <div className="max-w-250 mx-auto space-y-5">
        <div className="relative">
          <button
            onClick={() => router.back()}
            className="absolute top-0 -left-5 pt-1 -translate-x-full flex gap-1 text-blue-primary font-bold items-center text-sm"
          >
            <GovIcon name="chevron-compact-left" size="s" color="primary" />
            {t('Form.Back')}
          </button>

          <span className="font-medium text-md">{t('Form.Title')}</span>
        </div>
        <CreateForm />
        <h2 className="text-dark-primary font-medium text-center">
          {t('Form.Or')}
        </h2>
        <UploadFlow />
      </div>
    </div>
  );
};

export default CreateDictionary;
