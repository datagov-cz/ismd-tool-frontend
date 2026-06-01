import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { useEditConcept } from '@/api/generated';
import { AddPropertyRelationModelSchema } from '@/components/conceptForm/schema/conceptFormSchema';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

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
  const queryInvalidate = useQueryInvalidator();
  const { mutate: editConcept } = useEditConcept({
    mutation: {
      onSuccess: (data) => {
        queryInvalidate.invalidateConcept(data.data?.slug || '');
        queryInvalidate.invalidateConcept(slug);
        setOpen(false);
      },
    },
  });
  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddPropertyRelationModelSchema),
    defaultValues: {
      concept: null,
    },
  });

  const onSubmit = (data: z.infer<typeof AddPropertyRelationModelSchema>) => {
    if (!data.concept?.id) return;
    editConcept({
      conceptId: data.concept?.id,
      data: {
        domain: iri,
        conceptType: type === 'property' ? 'VLASTNOST' : 'VZTAH',
      },
    });
  };

  return (
    <GovDialog
      labelTag="h2"
      onGovClose={() => setOpen(false)}
      open={open}
      className="fixed z-100"
    >
      <h2 slot="title" className="font-normal!">
        Přidat {type === 'property' ? 'vlastnost' : 'vztah'} k pojmu{' '}
        <strong>{conceptName}</strong>
      </h2>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ConceptInput
            placeholder={'Vyberte pojem'}
            name={'concept'}
            single={true}
            nonFloatingDropDown={true}
            searchType="PROPERTY"
            searchSource="ISMD"
          />
          <div className="w-full flex gap-2 justify-end">
            <GovButton type="outlined" color="primary" nativeType="submit">
              {type === 'property' ? 'Přidat vlastnost' : 'Vytvořit vztah'}
            </GovButton>
          </div>
        </form>
      </FormProvider>
    </GovDialog>
  );
};
