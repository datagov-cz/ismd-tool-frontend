import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useCreateConcept } from '@/api/generated';

import { FormToolbar } from './components/FormToolbar';
import {
  type ConceptForm as ConceptFormValues,
  ConceptFormSchema,
} from './schema/conceptFormSchema';
import { ConceptMeaningSection } from './sections/ConceptMeaningSection';
import { NamingSection } from './sections/NamingSection';
import { OntologySection } from './sections/OntologySection';
import { ProclamationSection } from './sections/ProclamationSection';
import { RightsAndObligationsSection } from './sections/RightsAndObligationsSection';
import { SourcesSection } from './sections/SourcesSection';
import { TypesSection } from './sections/TypeSection';

function getDomain(url: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const match = withProtocol.match(/^(https?:\/\/[^/]+)/i);
    return match ? `${match[1]}/` : null;
  } catch {
    return null;
  }
}

export const ConceptForm = ({
  ontology,
  ontologyGraphName,
}: {
  ontology: string;
  ontologyGraphName: string;
}) => {
  const navigate = useRouter();
  const { mutate: createConcept, isPending } = useCreateConcept();

  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(ConceptFormSchema),
    defaultValues: {
      ontologyGraphName: ontologyGraphName,
      conceptType: 'TRIDA',
      conceptTypeEnum: 'TRIDA',
      identifier: undefined,
      nameModel: { name: { cs: '' } },
      namespace: getDomain(ontologyGraphName) ?? undefined,
      altNameModel: { altName: [{ languageTag: 'cs', name: '' }] },
      definitionModel: { definition: [{ languageTag: 'cs', name: '' }] },
      descriptionModel: { description: [{ languageTag: 'cs', name: '' }] },
      definingNonLegalSource: [],
      definingLegalSource: [],
      relatedNonLegalSource: [],
      relatedLegalSource: [],
      exactMatch: [],
      inTezaurus: false,
      type: '',
      broaderConcept: [],
      dataType: undefined,
      superProperty: [],
      range: undefined,
      superRelation: [],
      agendaCode: undefined,
      agendaSystemCode: undefined,
      contentType: '',
      acquisitionMethod: '',
      sharingMethod: [],
      isInPPDF: false,
      isPublic: false,
      privacyProvisions: [],
      domain: undefined,
      codeListDataset: undefined,
    },
  });

  const { errors } = form.formState;

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      toast.error('Prosím opravte chyby ve formuláři.', {
        position: 'bottom-right',
      });
    }
  }, [errors]);

  const onSubmit = (formData: ConceptFormValues) => {
    const toRecord = (arr?: { languageTag: string; name: string }[]) =>
      arr?.reduce<Record<string, string>>((acc, { languageTag, name }) => {
        acc[languageTag] = name;
        return acc;
      }, {});

    const normalized = {
      ...formData,
      altNameModel: formData.altNameModel?.altName
        ? { altName: toRecord(formData.altNameModel.altName) }
        : undefined,
      definitionModel: formData.definitionModel?.definition
        ? { definition: toRecord(formData.definitionModel.definition) }
        : undefined,
      descriptionModel: formData.descriptionModel?.description
        ? { description: toRecord(formData.descriptionModel.description) }
        : undefined,
    };

    createConcept(
      {
        slug: ontology,
        data: normalized,
      },
      {
        onSuccess: (data) => {
          toast.success('Koncept byl úspěšně vytvořen.', {
            position: 'bottom-right',
          });
          navigate.push(`/concept/${data.data?.slug}`);
        },
        onError: () => {
          toast.error('Při ukládání konceptu došlo k chybě.', {
            position: 'bottom-right',
          });
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
        <NamingSection />
        <TypesSection />
        <ConceptMeaningSection />
        <SourcesSection />
        <RightsAndObligationsSection />
        <ProclamationSection />
        <OntologySection />
        <FormToolbar isPending={isPending} />
      </form>
    </FormProvider>
  );
};
