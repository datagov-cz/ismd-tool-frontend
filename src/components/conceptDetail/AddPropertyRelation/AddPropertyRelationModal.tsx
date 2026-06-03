'use client';

import { useState } from 'react';
import {
  GovButton,
  GovDialog,
  GovFormLabel,
} from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { useEditConcept } from '@/api/generated';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import {
  AddPropertyModelSchema,
  AddRelationModelSchema,
} from './addPropertyRelationSchema';

type Props = {
  iri: string;
  type: 'property' | 'relation';
  conceptName?: string;
  open: boolean;
  setOpen: (_open: boolean) => void;
  slug: string;
};

export const AddPropertyRelationModal = ({
  iri,
  type,
  conceptName,
  open,
  setOpen,
  slug,
}: Props) => {
  const [direction, setDirection] = useState<
    'currentToOther' | 'otherToCurrent'
  >('currentToOther');

  const queryInvalidate = useQueryInvalidator();
  const { mutate: editConcept } = useEditConcept();

  const propertyForm = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddPropertyModelSchema),
    defaultValues: { concept: null },
  });

  const onSubmitProperty = (data: z.infer<typeof AddPropertyModelSchema>) => {
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

  const relationForm = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddRelationModelSchema),
    defaultValues: {
      relation: null,
      otherConcept: null,
    },
  });

  const onSubmitRelation = (data: z.infer<typeof AddRelationModelSchema>) => {
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
    <GovDialog
      labelTag="h2"
      onGovClose={() => setOpen(false)}
      open={open}
      className="fixed z-100 [&_dialog]:max-w-150!"
    >
      <h3 slot="title" className="font-normal!">
        Přidat {type === 'property' ? 'vlastnost' : 'vztah'} k pojmu{' '}
        <strong>{conceptName}</strong>
      </h3>
      {type === 'property' && (
        <FormProvider {...propertyForm}>
          <form
            onSubmit={propertyForm.handleSubmit(onSubmitProperty)}
            className="space-y-4"
          >
            <ConceptInput
              placeholder={'Vyberte pojem'}
              name={'concept'}
              single={true}
              nonFloatingDropDown={true}
              searchType="PROPERTY"
              searchSource="ISMD"
            />
            <div className="w-full flex gap-2 justify-end" slot="footer">
              <GovButton
                type="outlined"
                color="primary"
                nativeType="submit"
                size="s"
              >
                Přidat vlastnost
              </GovButton>
            </div>
          </form>
        </FormProvider>
      )}

      {type === 'relation' && (
        <FormProvider {...relationForm}>
          <form
            onSubmit={relationForm.handleSubmit(onSubmitRelation)}
            className="space-y-4"
          >
            <div className="flex justify-center gap-2">
              <GovButton
                color="primary"
                type={direction === 'currentToOther' ? 'solid' : 'outlined'}
                onGovClick={() => setDirection('currentToOther')}
              >
                {conceptName} → jiný pojem
              </GovButton>
              <GovButton
                color="primary"
                type={direction === 'otherToCurrent' ? 'solid' : 'outlined'}
                onGovClick={() => setDirection('otherToCurrent')}
              >
                jiný pojem → {conceptName}
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
                    ? 'Cílový pojem (jiný pojem)'
                    : 'Zdrojový pojem (jiný pojem)'}
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
            <div className="w-full flex gap-2 justify-end" slot="footer">
              <GovButton
                type="outlined"
                color="primary"
                nativeType="submit"
                size="s"
              >
                Vytvořit vztah
              </GovButton>
            </div>
          </form>
        </FormProvider>
      )}
    </GovDialog>
  );
};
