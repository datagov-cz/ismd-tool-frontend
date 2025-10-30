'use client';

import { useEffect } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { Input } from '@/components/shared/Input';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';
import { useUserStore } from '@/store/userStore';

const CreateDictionary = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const t = useTranslations('CreateOntology');

  const form = useForm<OntologySchemaType>({
    mode: 'onChange',
    resolver: zodResolver(createOntologySchema(t)),
    defaultValues: {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = (data: OntologySchemaType) => {
    console.log(data);
  };

  // TODO: Replace with proper auth guard. Use redirect in a server component.
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-10">
          <Input
            name="name"
            label={t('Form.NameLabel')}
            placeholder={t('Form.NamePlaceholder')}
          />
          <GovButton
            type="solid"
            size="m"
            color="primary"
            slot="button"
            disabled={isSubmitting}
          >
            {t('Form.SubmitButton')}
          </GovButton>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateDictionary;
