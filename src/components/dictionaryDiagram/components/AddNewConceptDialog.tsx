import { GovButton, GovDialog, GovIcon } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import {
  ConceptEditModelConceptTypeEnum,
  useCreateConcept,
  useGetOntologyDetail,
} from '@/api/generated';
import { normalizeFormData } from '@/components/conceptForm/ConceptCreate';
import {
  ConceptForm,
  MultiLangueModelSchema,
} from '@/components/conceptForm/schema/conceptFormSchema';
import { type ConceptForm as ConceptFormValues } from '@/components/conceptForm/schema/conceptFormSchema';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { Select } from '@/components/shared/Select';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

function getDomain(url: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const match = withProtocol.match(/^(https?:\/\/[^/]+)/i);
    return match ? `${match[1]}/` : null;
  } catch {
    return null;
  }
}

const AddNewConceptSchema = z.object({
  nameModel: z.object({
    name: MultiLangueModelSchema,
  }),
  conceptTypeEnum: z.enum(['TRIDA', 'VLASTNOST', 'VZTAH']),
  type: z.string(),
});

type AddNewConceptValues = z.infer<typeof AddNewConceptSchema>;

export const AddNewConceptDialog = ({
  open,
  onClose,
  ontology,
}: {
  open: boolean;
  onClose: () => void;
  ontology: string;
}) => {
  const t = useTranslations('CreateConcept');
  const tWrapper = useTranslations('ConceptCreateWrapper');

  const { data } = useGetOntologyDetail(ontology);
  const { mutate: createConcept, isPending } = useCreateConcept();
  const queryInvalidate = useQueryInvalidator();

  const graphName = data?.data?.ontologyMetadata?.graphName;

  const form = useForm<AddNewConceptValues>({
    resolver: zodResolver(AddNewConceptSchema),
    defaultValues: {
      nameModel: { name: [{ languageTag: 'cs', name: '' }] },
      conceptTypeEnum: 'TRIDA',
      type: '',
    },
  });

  const CONCEPT_TYPE_OPTIONS = [
    {
      value: ConceptEditModelConceptTypeEnum.TRIDA,
      label: t('CommonConceptFields.Options.Class'),
    },
    {
      value: ConceptEditModelConceptTypeEnum.VLASTNOST,
      label: t('CommonConceptFields.Options.Property'),
    },
    {
      value: ConceptEditModelConceptTypeEnum.VZTAH,
      label: t('CommonConceptFields.Options.Relation'),
    },
  ];

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: AddNewConceptValues) => {
    if (!graphName) return;

    const formData = {
      ontologyGraphName: graphName,
      namespace: getDomain(graphName) ?? undefined,
      conceptType: values.conceptTypeEnum,
      conceptTypeEnum: values.conceptTypeEnum,
      nameModel: values.nameModel,
    } as ConceptFormValues;

    createConcept(
      { slug: ontology, data: { ...normalizeFormData(formData), type: '' } },
      {
        onSuccess: () => {
          toast.success(tWrapper('ToastSuccess'), { position: 'bottom-right' });
          queryInvalidate.invalidateOntology(ontology);
          queryInvalidate.invalidateDiagram(ontology);
          handleClose();
        },
        onError: () => {
          toast.error(tWrapper('ToastError'), { position: 'bottom-right' });
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GovDialog open={open} onGovClose={() => handleClose()}>
          <span slot="title" className="flex gap-3 items-center">
            <GovIcon
              type="components"
              name="card-heading"
              color="primary"
              size="xl"
            />
            Přidat nový pojem
          </span>

          <div className="space-y-2.5">
            <LanguageInput<ConceptForm>
              name="nameModel.name"
              label={t('NamingSection.NameLabel')}
              placeholder={t('NamingSection.NamePlaceholder')}
              anchor="name"
            />
            <Select
              name="conceptTypeEnum"
              anchor="conceptTypeEnum"
              label={t('ClassCreateFields.Labels.ConceptType')}
              options={CONCEPT_TYPE_OPTIONS}
            />
          </div>

          <div slot="footer" className="space-x-2">
            <GovButton
              color="neutral"
              type="outlined"
              onGovClick={() => handleClose()}
              size="m"
            >
              Zrušit
            </GovButton>
            <GovButton
              color="primary"
              type="solid"
              nativeType="submit"
              size="m"
              disabled={isPending || !graphName}
            >
              <GovIcon slot="icon-start" name="floppy" type="components" />
              Vložit
            </GovButton>
          </div>
        </GovDialog>
      </form>
    </FormProvider>
  );
};
