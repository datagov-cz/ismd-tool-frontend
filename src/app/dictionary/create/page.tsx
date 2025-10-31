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
import { Select } from '@/components/shared/Select';
import { OntologyType } from '@/lib/appTypes';
import { LANG_TAGS, NAMESPACE } from '@/lib/constants';
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
      namespace: NAMESPACE,
      languageTag: LANG_TAGS[0],
      name: '',
      description: '',
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
        languageTag: data.languageTag,
      },
      descriptionModel: {
        description: data.description,
        languageTag: data.languageTag,
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
          <div className="w-full space-y-4">
            <Input
              name="namespace"
              label={t('Form.NamespaceLabel')}
              placeholder={t('Form.NamespacePlaceholder')}
            />
            <Select
              options={LANG_TAGS}
              label={t('Form.LanguageTagLabel')}
              name="languageTag"
            />
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
          </div>
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
