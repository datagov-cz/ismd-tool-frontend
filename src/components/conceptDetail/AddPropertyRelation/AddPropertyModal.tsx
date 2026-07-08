'use client';

import { useState } from 'react';
import { GovButton, GovDialog, GovIcon } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { useCreateConcept, useEditConcept } from '@/api/generated';
import { normalizeFormData } from '@/components/conceptForm/ConceptCreate';
import { BASE_DEFAULTS } from '@/components/conceptForm/ConceptForm';
import {
  ConceptForm,
  ConceptFormSchema,
} from '@/components/conceptForm/schema/conceptFormSchema';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { DataTypeInput } from '@/components/shared/DataTypeInput';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import { AddPropertyModelSchema } from './addPropertyRelationSchema';

type Props = {
  classIri: string;
  conceptClassName?: string;
  ontologyGraphName?: string;
  ontologySlug?: string;
  open: boolean;
  setOpen: (_open: boolean) => void;
  classSlug: string;
};

export const AddPropertyModal = ({
  classIri,
  conceptClassName,
  ontologySlug,
  ontologyGraphName,
  open,
  setOpen,
  classSlug,
}: Props) => {
  const queryInvalidate = useQueryInvalidator();
  const { mutate: editConcept } = useEditConcept();
  const { mutate: createConcept } = useCreateConcept();
  const [createView, setCreateView] = useState(false);

  const t = useTranslations('ConceptDetail.Main');
  const tLabels = useTranslations('CreateConcept');

  const formAdd = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddPropertyModelSchema),
    defaultValues: { concept: null },
  });

  const formCreate = useForm({
    mode: 'onChange',
    resolver: zodResolver(ConceptFormSchema),
    defaultValues: {
      ...BASE_DEFAULTS,
      ontologyGraphName: ontologyGraphName,
      conceptType: 'VLASTNOST',
      conceptTypeEnum: 'VLASTNOST',
    },
  });

  const onSubmit = (data: z.infer<typeof AddPropertyModelSchema>) => {
    if (!data.concept?.id) return;
    editConcept(
      {
        conceptId: data.concept.id,
        data: {
          domain: classIri,
          conceptType: 'VLASTNOST',
        },
      },
      {
        onSuccess: (response) => {
          queryInvalidate.invalidateConcept(response.data?.slug || classSlug);
          queryInvalidate.invalidateOntology(
            response.data?.ontologySlug || ontologySlug || '',
          );
          setOpen(false);
        },
      },
    );
  };

  const onSubmitCreate = (data: z.infer<typeof ConceptFormSchema>) => {
    createConcept(
      {
        slug: ontologySlug || '',
        data: { ...normalizeFormData(data), domain: classIri },
      },
      {
        onSuccess: (response) => {
          queryInvalidate.invalidateConcept(response.data?.slug || '');
          queryInvalidate.invalidateConcept(classSlug);
          queryInvalidate.invalidateOntology(
            response.data?.ontologySlug || ontologySlug || '',
          );
          setOpen(false);
        },
      },
    );
  };

  if (createView)
    return (
      <FormProvider {...formCreate}>
        <GovDialog
          labelTag="h2"
          onGovClose={() => {
            setCreateView(false);
            setOpen(false);
          }}
          open={open}
          className="fixed z-100 [&_dialog]:max-w-150!"
        >
          <h3 slot="title" className="font-normal!">
            {t('AddProperty')} <strong>{conceptClassName}</strong>
          </h3>
          <form onSubmit={formCreate.handleSubmit(onSubmitCreate)}>
            <LanguageInput<ConceptForm>
              name="nameModel.name"
              label={tLabels('NamingSection.NameLabel')}
              placeholder={tLabels('NamingSection.NamePlaceholder')}
              layout="flex"
              anchor="name"
            />
            <DataTypeInput
              name="dataType"
              anchor="dataType"
              label={tLabels('TypesSection.PropertyDataTypeLabel')}
              layout="flex"
            />
            <LanguageInput<ConceptForm>
              name="definitionModel.definition"
              label={tLabels('ConceptMeaningSection.DefinitionLabel')}
              placeholder={tLabels(
                'ConceptMeaningSection.DefinitionPlaceholder',
              )}
              anchor="definition"
              layout="flex"
            />
          </form>
          <div className="w-full flex gap-2 justify-end" slot="footer">
            <GovButton
              type="base"
              color="primary"
              size="s"
              onGovClick={() => setCreateView(false)}
            >
              {t('Cancel')}
            </GovButton>
            <GovButton
              type="solid"
              color="primary"
              size="s"
              onGovClick={() => formCreate.handleSubmit(onSubmitCreate)()}
            >
              <GovIcon name="floppy" slot="icon-start" />
              {t('CreateAndAddProperty')}
            </GovButton>
          </div>
        </GovDialog>
      </FormProvider>
    );

  return (
    <FormProvider {...formAdd}>
      <GovDialog
        labelTag="h2"
        onGovClose={() => {
          setCreateView(false);
          setOpen(false);
        }}
        open={open}
        className="fixed z-100 [&_dialog]:max-w-150!"
      >
        <h3 slot="title" className="font-normal!">
          {t('AddProperty')} <strong>{conceptClassName}</strong>
        </h3>
        <form onSubmit={formAdd.handleSubmit(onSubmit)} className="space-y-4">
          <ConceptInput
            placeholder={'Vyberte pojem'}
            name={'concept'}
            single={true}
            nonFloatingDropDown={true}
            searchType="PROPERTY"
            searchSource="ISMD"
          />
        </form>
        {formAdd.formState.dirtyFields.concept ? (
          <div className="w-full flex gap-2 justify-end" slot="footer">
            <GovButton
              type="solid"
              color="primary"
              size="s"
              onGovClick={() => formAdd.handleSubmit(onSubmit)()}
            >
              <GovIcon name="tag" slot="icon-start" />
              {t('AddPropertyButton')}
            </GovButton>
          </div>
        ) : (
          <div
            className="w-full flex gap-8 justify-center items-center"
            slot="footer"
          >
            <span className="font-medium">{t('NoSuitableProperty')}</span>
            <GovButton
              type="outlined"
              color="primary"
              size="s"
              onGovClick={() => setCreateView(true)}
            >
              {t('CreateProperty')}
            </GovButton>
          </div>
        )}
      </GovDialog>
    </FormProvider>
  );
};
