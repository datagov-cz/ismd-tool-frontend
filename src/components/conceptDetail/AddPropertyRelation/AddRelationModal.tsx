'use client';

import { useState } from 'react';
import {
  GovButton,
  GovDialog,
  GovFormLabel,
} from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { useEditConcept } from '@/api/generated';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import { AddRelationModelSchema } from './addPropertyRelationSchema';

type Props = {
  iri: string;
  conceptName?: string;
  open: boolean;
  setOpen: (_open: boolean) => void;
  slug: string;
};

export const AddRelationModal = ({
  iri,
  conceptName,
  open,
  setOpen,
  slug,
}: Props) => {
  const [direction, setDirection] = useState<
    'currentToOther' | 'otherToCurrent'
  >('currentToOther');

  const t = useTranslations('ConceptDetail.Main');

  const queryInvalidate = useQueryInvalidator();
  const { mutate: editConcept } = useEditConcept();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddRelationModelSchema),
    defaultValues: { relation: null, otherConcept: null },
  });

  const onSubmit = (data: z.infer<typeof AddRelationModelSchema>) => {
    if (!data.relation?.id || !data.otherConcept?.iri) return;

    editConcept(
      {
        conceptId: data.relation.id,
        data: {
          conceptType: 'VZTAH',
          domain: direction === 'currentToOther' ? iri : data.otherConcept.iri,
          range: direction === 'currentToOther' ? data.otherConcept.iri : iri,
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
          {t('AddRelation')} <strong>{conceptName}</strong>
        </h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center gap-2">
            <GovButton
              color="primary"
              type={direction === 'currentToOther' ? 'solid' : 'outlined'}
              onGovClick={() => setDirection('currentToOther')}
            >
              {conceptName} → {t('OtherConcept')}
            </GovButton>
            <GovButton
              color="primary"
              type={direction === 'otherToCurrent' ? 'solid' : 'outlined'}
              onGovClick={() => setDirection('otherToCurrent')}
            >
              {t('OtherConcept')} → {conceptName}
            </GovButton>
          </div>

          <div>
            <GovFormLabel className="w-full! [&_label]:w-full!">
              <span className="font-bold">Vztah</span>
            </GovFormLabel>
            <ConceptInput
              placeholder={'Vyberte vztah'}
              name={'relation'}
              single={true}
              nonFloatingDropDown={true}
              searchType="RELATIONSHIP"
              searchSource="ISMD"
            />
          </div>

          <div>
            <GovFormLabel className="w-full! [&_label]:w-full!">
              <span className="font-bold">
                {direction === 'currentToOther'
                  ? t('DestinationConcept')
                  : t('SourceConcept')}
              </span>
            </GovFormLabel>
            <ConceptInput
              placeholder={'Vyberte pojem'}
              name={'otherConcept'}
              single={true}
              nonFloatingDropDown={true}
              searchType="CONCEPT"
              searchSource="ISMD"
            />
          </div>
        </form>
        <div className="w-full flex gap-2 justify-end" slot="footer">
          <GovButton
            type="outlined"
            color="primary"
            size="s"
            onGovClick={() => form.handleSubmit(onSubmit)()}
          >
            {t('AddRelationButton')}
          </GovButton>
        </div>
      </GovDialog>
    </FormProvider>
  );
};
