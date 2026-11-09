import { useId, useState } from 'react';
import { GovButton, GovFormCheckbox } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { SuggestionCard } from '@/components/conceptForm/components/SuggestionCard';
import { useApplySuggestion } from '@/hooks/useApplySuggestion';
import {
  type FieldKey,
  useSuggestionFieldCards,
} from '@/hooks/useSuggestionFieldCards';
import type {
  ConceptSuggestion,
  ConceptSuggestionKind,
} from '@/lib/conceptSuggestion/types';

type Props = {
  jobId: string;
  kind: ConceptSuggestionKind;
  suggestion: ConceptSuggestion;
  knownSlugs: string[];
  onDefinitionApplied: () => void;
};

const lastIriSegment = (iri: string) =>
  iri.split(/[/#]/).filter(Boolean).pop() ?? iri;

export const SuggestionFields = ({
  jobId,
  kind,
  suggestion,
  knownSlugs,
  onDefinitionApplied,
}: Props) => {
  const id = useId();
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const apply = useApplySuggestion(jobId, onDefinitionApplied);
  const { cards, missingTargetIri } = useSuggestionFieldCards({
    kind,
    suggestion,
    knownSlugs,
  });
  const [deselected, setDeselected] = useState<FieldKey[]>([]);

  const selected = cards.filter((card) => !deselected.includes(card.key));
  const allSelected = selected.length === cards.length;

  const toggleCard = (key: FieldKey) =>
    setDeselected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const toggleAll = () =>
    setDeselected(allSelected ? cards.map((card) => card.key) : []);

  return (
    <>
      <div className="flex items-center justify-between gap-2 pt-2">
        <GovButton
          type="outlined"
          color="primary"
          size="s"
          nativeType="button"
          aria-pressed={allSelected}
          onClick={toggleAll}
        >
          <span className="flex items-center gap-2">
            <GovFormCheckbox
              id={`${id}-select-all`}
              checked={allSelected}
              readOnly
              size="s"
              aria-hidden="true"
              className="pointer-events-none"
            />
            {t('SelectAll')}
          </span>
        </GovButton>
        <span className="text-sm text-muted">
          {t('SelectedCount', {
            selected: selected.length,
            total: cards.length,
          })}
        </span>
      </div>
      {cards.map((card) => (
        <SuggestionCard
          key={card.key}
          id={`${id}-${card.key}`}
          label={card.label}
          description={card.description}
          checked={!deselected.includes(card.key)}
          onToggle={() => toggleCard(card.key)}
        />
      ))}
      {missingTargetIri ? (
        <div className="text-sm text-muted">
          {t('Ai.TargetNotFound', { target: lastIriSegment(missingTargetIri) })}
        </div>
      ) : null}
      <div className="flex justify-center">
        <GovButton
          type="solid"
          color="primary"
          nativeType="button"
          disabled={selected.length === 0}
          onClick={() => apply(suggestion.suggestionId, selected)}
        >
          {t('ApplySelected')}
        </GovButton>
      </div>
    </>
  );
};
