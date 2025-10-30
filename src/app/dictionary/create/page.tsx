'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useCreateOntology } from '@/api/generated';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { OntologyType } from '@/lib/appTypes';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';
import { useUserStore } from '@/store/userStore';

const CreateDictionary = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const t = useTranslations('CreateOntology');

  const form = useForm<OntologySchemaType>({
    mode: 'onChange',
    resolver: zodResolver(createOntologySchema(t)),
    defaultValues: {
      namespace: 'http://example.org/test#',
    },
  });

  const { mutate, isPending } = useCreateOntology();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = (data: OntologySchemaType) => {
    const payload: OntologyType = {
      namespace: data.namespace,
      nameModel: {
        name: data.name,
        languageTag: 'en',
      },
      descriptionModel: {
        description: data.description,
        languageTag: 'en',
      },
    };

    mutate(
      {
        userId: 'test',
        ontology: payload,
      },
      {
        onSuccess: () => {
          toast(t('Form.CreateNewDictSuccess'));
        },
        onError: (error) => {
          console.error('Failed to create ontology:', error);
          toast(t('Form.CreateNewDictError'));
        },
      },
    );
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
          <Input
            name="description"
            label={t('Form.DescriptionLabel')}
            placeholder={t('Form.DescriptionPlaceholder')}
          />
          <Button
            styleType="solid"
            color="primary"
            disabled={isSubmitting || isPending}
            type="submit"
          >
            {t('Form.SubmitButton')}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateDictionary;
