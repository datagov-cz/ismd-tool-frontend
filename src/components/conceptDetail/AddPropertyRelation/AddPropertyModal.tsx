'use client';

import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { useEditConcept } from '@/api/generated';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import { AddPropertyModelSchema } from './addPropertyRelationSchema';

type Props = {
  iri: string;
  conceptName?: string;
  open: boolean;
  setOpen: (_open: boolean) => void;
  slug: string;
};

export const AddPropertyModal = ({
  iri,
  conceptName,
  open,
  setOpen,
  slug,
}: Props) => {
  const queryInvalidate = useQueryInvalidator();
  const { mutate: editConcept } = useEditConcept();

  const t = useTranslations('ConceptDetail.Main');

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddPropertyModelSchema),
    defaultValues: { concept: null },
  });

  const onSubmit = (data: z.infer<typeof AddPropertyModelSchema>) => {
    if (!data.concept?.id) return;
    editConcept(
      {
        conceptId: data.concept.id,
        data: {
          domain: iri,
          conceptType: 'VLASTNOST',
        },
      },
      {
        onSuccess: (response) => {
          queryInvalidate.invalidateConcept(response.data?.slug || '');
          queryInvalidate.invalidateConcept(slug);
          setOpen(false);
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <GovDialog
        labelTag="h2"
        onGovClose={() => setOpen(false)}
        open={open}
        className="fixed z-100 [&_dialog]:max-w-150!"
      >
        <h3 slot="title" className="font-normal!">
          {t('AddProperty')} <strong>{conceptName}</strong>
        </h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ConceptInput
            placeholder={'Vyberte pojem'}
            name={'concept'}
            single={true}
            nonFloatingDropDown={true}
            searchType="PROPERTY"
            searchSource="ISMD"
          />
        </form>
        <div className="w-full flex gap-2 justify-end" slot="footer">
          <GovButton
            type="outlined"
            color="primary"
            size="s"
            onGovClick={() => form.handleSubmit(onSubmit)()}
          >
            {t('AddPropertyButton')}
          </GovButton>
        </div>
      </GovDialog>
    </FormProvider>
  );
};
