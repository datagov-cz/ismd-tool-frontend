import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import { acceptSuggestions } from '@/api/generated';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import type { FieldCard } from '@/hooks/useSuggestionFieldCards';
import { withCsEntry } from '@/lib/languageEntries';

export const useApplySuggestion = (
  jobId: string,
  onDefinitionApplied: () => void,
) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const { getValues, setValue, trigger } = useFormContext<ConceptForm>();
  const accepted = useRef(new Set<string>());

  return (suggestionId: string, cards: FieldCard[]) => {
    cards.forEach((card) => {
      if (card.key === 'classType') {
        setValue(card.path, card.value, { shouldDirty: true });
        return;
      }
      if (card.key === 'range') {
        setValue(card.path, card.value, { shouldDirty: true });
        return;
      }
      setValue(card.path, withCsEntry(getValues(card.path), card.description), {
        shouldDirty: true,
      });
    });
    void trigger(cards.map((card) => card.path));
    if (cards.some((card) => card.key === 'definition')) {
      onDefinitionApplied();
    }
    toast.success(t('Applied'));
    if (accepted.current.has(suggestionId)) {
      return;
    }
    accepted.current.add(suggestionId);
    acceptSuggestions([{ jobId, suggestionIds: [suggestionId] }]).catch(
      () => undefined,
    );
  };
};
