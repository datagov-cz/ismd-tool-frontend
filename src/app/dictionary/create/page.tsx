'use client';

import { useTranslations } from 'next-intl';

import { useGetCurrentUser } from '@/api/generated';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { UploadFlow } from '@/components/uploadFlow/UploadFlow';

import { CreateForm } from './create-form';

const CreateDictionary = () => {
  const { data, isLoading } = useGetCurrentUser();
  const t = useTranslations('CreateOntology');

  if (isLoading)
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <CircularLoader />
      </div>
    );

  if (!data?.success) return null;

  return (
    <div className="w-full py-10">
      <div className="max-w-250 mx-auto space-y-5">
        <h2 className="text-blue-primary font-medium">{t('Form.Title')}</h2>
        <CreateForm />
        <h2 className="text-blue-primary font-medium">{t('Form.Or')}</h2>
        <UploadFlow />
      </div>
    </div>
  );
};

export default CreateDictionary;
