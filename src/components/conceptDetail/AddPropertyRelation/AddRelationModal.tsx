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
import { Input } from '@/components/shared/Input';
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

  const queryInvalidate = useQueryInvalidator();
  const { mutate: editConcept } = useEditConcept();
  const { mutate: createConcept } = useCreateConcept();

  const [createView, setCreateView] = useState(false);

  const formAdd = useForm({
    mode: 'onChange',
    resolver: zodResolver(AddRelationModelSchema),
    defaultValues: { relation: null, otherConcept: null },
  });

  const formCreate = useForm({
    mode: 'onChange',
    resolver: zodResolver(ConceptFormSchema),
    defaultValues: {
      ...BASE_DEFAULTS,
      ontologyGraphName: ontologyGraphName,
      conceptType: 'VZTAH',
      conceptTypeEnum: 'VZTAH',
      ...(direction === 'currentToOther'
        ? { domain: { label: conceptClassName, iri: classIri } }
        : { range: { label: conceptClassName, iri: classIri } }),
    },
  });

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
          queryInvalidate.invalidateConcept(classSlug);
          setOpen(false);
          setCreateView(false);
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
          queryInvalidate.invalidateConcept(classSlug);
          queryInvalidate.invalidateOntology(
            response.data?.ontologySlug || ontologySlug || '',
          );
          setOpen(false);
          setCreateView(false);
        },
      },
    );
  };

  if (createView) {
    return (
      <FormProvider {...formCreate}>
        <GovDialog
          labelTag="h2"
          onGovClose={() => {
            setOpen(false);
            setCreateView(false);
          }}
          open={open}
          className="fixed z-100 [&_dialog]:max-w-150!"
        >
          <h3 slot="title" className="font-normal!">
            {t('AddRelation')} <strong>{conceptClassName}</strong>
          </h3>
          <form onSubmit={formCreate.handleSubmit(onSubmitCreate)}>
            <div className="flex justify-center gap-2">
              <GovButton
                color="primary"
                type={direction === 'currentToOther' ? 'solid' : 'outlined'}
                onGovClick={() => setDirection('currentToOther')}
              >
                {conceptClassName} → {t('OtherConcept')}
              </GovButton>
              <GovButton
                color="primary"
                type={direction === 'otherToCurrent' ? 'solid' : 'outlined'}
                onGovClick={() => setDirection('otherToCurrent')}
              >
                {t('OtherConcept')} → {conceptClassName}
              </GovButton>
            </div>

            <Input
              register={formCreate.register}
              name="nameModel.name.cs"
              label={tLabels('NamingSection.NameLabel')}
              placeholder={tLabels('NamingSection.NamePlaceholder')}
              required
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
              {t('CreateAndAddRelationship')}
            </GovButton>
          </div>
        </GovDialog>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...formAdd}>
      <GovDialog
        labelTag="h2"
        onGovClose={() => {
          setOpen(false);
          setCreateView(false);
        }}
        open={open}
        className="fixed z-100 [&_dialog]:max-w-150!"
      >
        <h3 slot="title" className="font-normal!">
          {t('AddRelation')} <strong>{conceptClassName}</strong>
        </h3>
        <form onSubmit={formAdd.handleSubmit(onSubmit)}>
          <div className="flex justify-center gap-2">
            <GovButton
              color="primary"
              type={direction === 'currentToOther' ? 'solid' : 'outlined'}
              onGovClick={() => setDirection('currentToOther')}
            >
              {conceptClassName} → {t('OtherConcept')}
            </GovButton>
            <GovButton
              color="primary"
              type={direction === 'otherToCurrent' ? 'solid' : 'outlined'}
              onGovClick={() => setDirection('otherToCurrent')}
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
        {formAdd.formState.dirtyFields.relation ||
        formAdd.formState.dirtyFields.otherConcept ? (
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
            <span className="font-medium">{t('NoSuitableRelationship')}</span>
            <GovButton
              type="outlined"
              color="primary"
              size="s"
              onGovClick={() => setCreateView(true)}
            >
              {t('CreateRelationship')}
            </GovButton>
          </div>
        )}
      </GovDialog>
    </FormProvider>
  );
};
