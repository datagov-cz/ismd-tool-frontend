import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { ConceptForm as ConceptFormType } from '@/components/conceptForm/schema/conceptFormSchema';

import { FormToolbar } from './components/FormToolbar';
import { useConceptFormHints } from './components/hint/conceptFormHints';
import { HintSidebar } from './components/hint/HintSidebar';
import { useFormHints } from './components/hint/useFormHints';
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

export const BASE_DEFAULTS: Omit<
  ConceptFormValues,
  'ontologyGraphName' | 'namespace'
> = {
  conceptType: 'TRIDA',
  conceptTypeEnum: 'TRIDA',
  identifier: undefined,
  nameModel: { name: { cs: '' } },
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
};

interface ConceptFormProps {
  ontologyGraphName: string;
  onSubmit: (_data: ConceptFormValues) => void;
  isPending: boolean;
  defaultValues?: Partial<ConceptFormValues>;
  editing?: boolean;
}

export const ConceptForm = ({
  ontologyGraphName,
  onSubmit,
  isPending,
  defaultValues: externalDefaults,
  editing,
}: ConceptFormProps) => {
  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(ConceptFormSchema),
    defaultValues: {
      ...BASE_DEFAULTS,
      ontologyGraphName,
      namespace: getDomain(ontologyGraphName) ?? undefined,
      ...externalDefaults,
    },
  });

  const { errors } = form.formState;

  const { hints, defaultHint, defaultHintEdit } = useConceptFormHints();

  const { hint, open, setOpen, handleFocus } = useFormHints(
    hints,
    editing ? defaultHintEdit : defaultHint,
  );

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      toast.error('Prosím opravte chyby ve formuláři.', {
        position: 'bottom-right',
      });
    }
  }, [errors]);

  useEffect(() => {
    if (!externalDefaults) return;

    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    requestAnimationFrame(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [externalDefaults]);

  return (
    <FormProvider {...form}>
      <div className="relative w-full lg:max-w-160 xl:max-w-200">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onFocus={handleFocus}
          className="w-full space-y-2.5"
        >
          <NamingSection />
          <TypesSection editing={editing} />
          <ConceptMeaningSection />
          <SourcesSection />
          <RightsAndObligationsSection />
          <ProclamationSection />
          <OntologySection />
          <FormToolbar<ConceptFormType> isPending={isPending} />
        </form>

        <div className="absolute hidden lg:block left-full top-0 h-full w-full xl:w-[calc(100vw-100%-12rem)] pl-6">
          {open && (
            <HintSidebar
              hint={hint}
              onClose={() => setOpen(false)}
              className="sticky top-22 w-full max-w-80"
            />
          )}
        </div>
      </div>
    </FormProvider>
  );
};
