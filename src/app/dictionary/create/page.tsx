'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useCreateOntology } from '@/api/generated';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { TextArea } from '@/components/shared/Textarea';
import { OntologyType } from '@/lib/appTypes';
import { LANG_TAGS, NAMESPACE } from '@/lib/constants';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';

const CreateDictionary = () => {
  const { data: session } = useSession();
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
        languageTag: 'cs',
      },
      descriptionModel: {
        description: data.description,
        languageTag: 'cs',
      },
    };

    mutate(
      {
        params: {
          userId: 'test',
        },
        data: payload,
      },
      {
        onSuccess: (response) => {
          toast(t('Form.CreateNewDictSuccess'));
          if (response.data?.slug) {
            router.push(`/dictionary/${response.data?.slug}`);
          }
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
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  if (!session) {
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
            <Input
              name="name"
              label={t('Form.NameLabel')}
              placeholder={t('Form.NamePlaceholder')}
            />
            <TextArea
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
