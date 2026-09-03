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
import { LanguageInput } from '@/components/shared/LanguageInput';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import { AddRelationModelSchema } from './addPropertyRelationSchema';

type Props = {
  classIri: string;
  conceptClassName?: string;
  open: boolean;
  setOpen: (_open: boolean) => void;
  classSlug: string;
  ontologyGraphName?: string;
  ontologySlug?: string;
};

export const AddRelationModal = ({
  classIri,
  conceptClassName,
  open,
  setOpen,
  classSlug,
  ontologySlug,
  ontologyGraphName,
}: Props) => {
  const [direction, setDirection] = useState<
    'currentToOther' | 'otherToCurrent'
  >('currentToOther');

  const t = useTranslations('ConceptDetail.Main');
  const tLabels = useTranslations('CreateConcept');
  const tError = useTranslations('Errors');

  const queryInvalidate = useQueryInvalidator();

  const { mutate: editConcept } = useEditConcept({
    mutation: { networkMode: 'always' },
  });
  const { mutate: createConcept } = useCreateConcept({
    mutation: { networkMode: 'always' },
  });

  const [createView, setCreateView] = useState(false);

  const formAdd = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddRelationModelSchema),
    defaultValues: { relation: null, otherConcept: null },
  });

  const formCreate = useForm({
    mode: 'onChange',
    resolver: zodResolver(createConceptFormSchema(tError)),
    defaultValues: {
      ...BASE_DEFAULTS,
      ontologyGraphName: ontologyGraphName,
      conceptType: 'VZTAH',
      conceptTypeEnum: 'VZTAH',
      domain: { label: conceptClassName, iri: classIri },
    },
  });

  const changeDirection = (dir: 'currentToOther' | 'otherToCurrent') => {
    if (dir === direction) return;
    const { domain, range } = formCreate.getValues();
    formCreate.setValue('domain', range ?? undefined, { shouldValidate: true });
    formCreate.setValue('range', domain ?? undefined, { shouldValidate: true });
    setDirection(dir);
  };

  const onSubmit = (data: z.infer<typeof AddRelationModelSchema>) => {
    if (!data.relation?.id || !data.otherConcept?.iri) return;

    editConcept(
      {
        conceptId: data.relation.id,
        data: {
          conceptType: 'VZTAH',
          domain:
            direction === 'currentToOther' ? classIri : data.otherConcept.iri,
          range:
            direction === 'currentToOther' ? data.otherConcept.iri : classIri,
        },
      },
      {
        onSuccess: (response) => {
          queryInvalidate.invalidateConcept(response.data?.slug || '');
          queryInvalidate.invalidateConcept(decodeURIComponent(classSlug));
          setOpen(false);
          setCreateView(false);
          formAdd.reset({ relation: null, otherConcept: null });
        },
      },
    );
  };

  const onSubmitCreate = (data: z.infer<typeof ConceptFormSchema>) => {
    createConcept(
      {
        slug: ontologySlug || '',
        data: { ...normalizeFormData(data) },
      },
      {
        onSuccess: (response) => {
          queryInvalidate.invalidateConcept(response.data?.slug || '');
          queryInvalidate.invalidateConcept(decodeURIComponent(classSlug));
          queryInvalidate.invalidateOntology(
            response.data?.ontologySlug || ontologySlug || '',
          );
          setOpen(false);
          setCreateView(false);
          formCreate.reset({
            ...BASE_DEFAULTS,
            ontologyGraphName: ontologyGraphName,
            conceptType: 'VZTAH',
            conceptTypeEnum: 'VZTAH',
          });
        },
      },
    );
  };

  if (createView) {
    return (
      <FormProvider {...formCreate}>
        <GovDialog
          onClose={() => {
            setOpen(false);
            setCreateView(false);
          }}
          open={open}
          className="fixed z-100"
          title={
            <h3 className="font-normal!">
              {t('AddRelation')} <strong>{conceptClassName}</strong>
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
                iconStart={<GovIcon name="floppy" />}
              >
                {t('CreateAndAddRelationship')}
              </GovButton>
            </div>
          }
        >
          <form onSubmit={formCreate.handleSubmit(onSubmitCreate)}>
            <div className="flex justify-center gap-2">
              <GovButton
                size="m"
                color="primary"
                type={direction === 'currentToOther' ? 'solid' : 'outlined'}
                onClick={() => changeDirection('currentToOther')}
              >
                {conceptClassName} → {t('OtherConcept')}
              </GovButton>
              <GovButton
                size="m"
                color="primary"
                type={direction === 'otherToCurrent' ? 'solid' : 'outlined'}
                onClick={() => changeDirection('otherToCurrent')}
              >
                {t('OtherConcept')} → {conceptClassName}
              </GovButton>
            </div>

            <LanguageInput<ConceptForm>
              name="nameModel.name"
              label={tLabels('NamingSection.NameLabel')}
              placeholder={tLabels('NamingSection.NamePlaceholder')}
              layout="flex"
              anchor="name"
            />
            <ConceptInput
              placeholder={'Vyberte pojem'}
              name={direction === 'currentToOther' ? 'range' : 'domain'}
              single={true}
              nonFloatingDropDown={true}
              label={
                direction === 'currentToOther'
                  ? t('DestinationConcept')
                  : t('SourceConcept')
              }
              searchType="CLASS"
              searchSource="ISMD"
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
  }

  return (
    <FormProvider {...formAdd}>
      <GovDialog
        onClose={() => {
          setOpen(false);
          setCreateView(false);
        }}
        open={open}
        className="fixed z-100"
        title={
          <h3 className="font-normal!">
            {t('AddRelation')} <strong>{conceptClassName}</strong>
          </h3>
        }
        footer={
          formAdd.formState.dirtyFields.relation ||
          formAdd.formState.dirtyFields.otherConcept ? (
            <div className="w-full flex gap-2 justify-end">
              <GovButton
                type="solid"
                color="primary"
                size="s"
                onClick={() => formAdd.handleSubmit(onSubmit)()}
                iconStart={<GovIcon name="tag" />}
              >
                {t('AddPropertyButton')}
              </GovButton>
            </div>
          ) : (
            <div className="w-full flex gap-8 justify-center items-center">
              <span className="font-medium">{t('NoSuitableRelationship')}</span>
              <GovButton
                type="outlined"
                color="primary"
                size="s"
                onClick={() => setCreateView(true)}
              >
                {t('CreateRelationship')}
              </GovButton>
            </div>
          )
        }
      >
        <form onSubmit={formAdd.handleSubmit(onSubmit)}>
          <div className="flex justify-center gap-2">
            <GovButton
              size="m"
              color="primary"
              type={direction === 'currentToOther' ? 'solid' : 'outlined'}
              onClick={() => changeDirection('currentToOther')}
            >
              {conceptClassName} → {t('OtherConcept')}
            </GovButton>
            <GovButton
              size="m"
              color="primary"
              type={direction === 'otherToCurrent' ? 'solid' : 'outlined'}
              onClick={() => changeDirection('otherToCurrent')}
            >
              {t('OtherConcept')} → {conceptClassName}
            </GovButton>
          </div>

          <ConceptInput
            label="Vztah"
            placeholder={'Vyberte vztah'}
            name={'relation'}
            single={true}
            nonFloatingDropDown={true}
            searchType="RELATIONSHIP"
            searchSource="ISMD"
            layout="flex"
          />

          <ConceptInput
            placeholder={'Vyberte pojem'}
            name={'otherConcept'}
            single={true}
            nonFloatingDropDown={true}
            label={
              direction === 'currentToOther'
                ? t('DestinationConcept')
                : t('SourceConcept')
            }
            searchType="CLASS"
            searchSource="ISMD"
            layout="flex"
          />
        </form>
      </GovDialog>
    </FormProvider>
  );
};
