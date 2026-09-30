import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import { resolveLegalSource } from '@/api/generated';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import { withCsEntry } from '@/lib/languageEntries';

export type PrefilledLegalSource = {
  definition?: string;
  legalSourceLabel?: string;
  legalSourceBodyHtml?: string;
};

export const useLegalSourcePrefill = () => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const { getValues, setValue, trigger } = useFormContext<ConceptForm>();
  const latestRequest = useRef(0);
  const [fragmentIri, setFragmentIri] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState<PrefilledLegalSource | null>(null);

  const selectFragment = async (value: string) => {
    latestRequest.current += 1;
    const requestId = latestRequest.current;
    setFragmentIri(value);
    setPrefilled(null);

    if (!value) {
      return;
    }

    let resolved;
    try {
      resolved = (await resolveLegalSource({ iri: value })).data;
    } catch {
      if (latestRequest.current === requestId) {
        toast.error(t('LoadError'));
      }
      return;
    }

    if (latestRequest.current !== requestId) {
      return;
    }

    if (!resolved) {
      toast.error(t('NotFound'));
      return;
    }

    const definition = resolved.fragmentBody?.trim()
      ? resolved.fragmentBody
      : undefined;

    if (definition) {
      setValue(
        'definitionModel.definition',
        withCsEntry(getValues('definitionModel.definition'), definition),
        { shouldDirty: true },
      );
      void trigger('definitionModel.definition');
    }

    setValue('definingLegalSource', [value], { shouldDirty: true });

    setPrefilled({
      definition,
      legalSourceLabel: resolved.displayLabel,
      legalSourceBodyHtml: resolved.fragmentBodyHtml,
    });
    toast.success(t('Success'));
  };

  const forgetDefinition = () =>
    setPrefilled((current) =>
      current ? { ...current, definition: undefined } : current,
    );

  return { fragmentIri, prefilled, selectFragment, forgetDefinition };
};
