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
  createConceptFormSchema,
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
  const { mutate: editConcept } = useEditConcept({
    mutation: { networkMode: 'always' },
  });
  const { mutate: createConcept } = useCreateConcept({
    mutation: { networkMode: 'always' },
  });
  const [createView, setCreateView] = useState(false);

  const t = useTranslations('ConceptDetail.Main');
  const tLabels = useTranslations('CreateConcept');
  const tError = useTranslations('Errors');

  const formAdd = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddPropertyModelSchema),
    defaultValues: { concept: null },
  });

  const formCreate = useForm({
    mode: 'onChange',
    resolver: zodResolver(createConceptFormSchema(tError)),
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
          queryInvalidate.invalidateConcept(response.data?.slug || '');
          queryInvalidate.invalidateConcept(decodeURIComponent(classSlug));
          queryInvalidate.invalidateOntology(
            response.data?.ontologySlug || ontologySlug || '',
          );
          setOpen(false);
          formAdd.reset({ concept: null });
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
          queryInvalidate.invalidateConcept(decodeURIComponent(classSlug));
          queryInvalidate.invalidateOntology(
            response.data?.ontologySlug || ontologySlug || '',
          );
          setOpen(false);
          formCreate.reset({
            ...BASE_DEFAULTS,
            ontologyGraphName: ontologyGraphName,
            conceptType: 'VLASTNOST',
            conceptTypeEnum: 'VLASTNOST',
          });
        },
      },
    );
  };

  if (createView)
    return (
      <FormProvider {...formCreate}>
        <GovDialog
          onClose={() => {
            setCreateView(false);
            setOpen(false);
          }}
          open={open}
          className="fixed z-100 [&_dialog]:max-w-150!"
          title={
            <h3 className="font-normal!">
              {t('AddProperty')} <strong>{conceptClassName}</strong>
            </h3>
          }
          footer={
            <div className="w-full flex gap-2 justify-end">
              <GovButton
                type="base"
                color="primary"
                size="s"
                onClick={() => setCreateView(false)}
              >
                {t('Cancel')}
              </GovButton>
              <GovButton
                type="solid"
                color="primary"
                size="s"
                onClick={() => formCreate.handleSubmit(onSubmitCreate)()}
              >
                <GovIcon name="floppy" slot="icon-start" />
                {t('CreateAndAddProperty')}
              </GovButton>
            </div>
          }
        >
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
        </GovDialog>
      </FormProvider>
    );

  return (
    <FormProvider {...formAdd}>
      <GovDialog
        onClose={() => {
          setCreateView(false);
          setOpen(false);
        }}
        open={open}
        className="fixed z-100 [&_dialog]:max-w-150!"
        title={
          <h3 className="font-normal!">
            {t('AddProperty')} <strong>{conceptClassName}</strong>
          </h3>
        }
        footer={
          formAdd.formState.dirtyFields.concept ? (
            <div className="w-full flex gap-2 justify-end">
              <GovButton
                type="solid"
                color="primary"
                size="s"
                onClick={() => formAdd.handleSubmit(onSubmit)()}
              >
                <GovIcon name="tag" slot="icon-start" />
                {t('AddPropertyButton')}
              </GovButton>
            </div>
          ) : (
            <div className="w-full flex gap-8 justify-center items-center">
              <span className="font-medium">{t('NoSuitableProperty')}</span>
              <GovButton
                type="outlined"
                color="primary"
                size="s"
                onClick={() => setCreateView(true)}
              >
                {t('CreateProperty')}
              </GovButton>
            </div>
          )
        }
      >
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
      </GovDialog>
    </FormProvider>
  );
};
