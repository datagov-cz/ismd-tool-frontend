import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { SectionTitle } from '@/components/shared/SectionTitle';
import type {
  ConceptSuggestion,
  ConceptSuggestionKind,
} from '@/lib/conceptSuggestion/types';

import { CandidateList } from './CandidateList';
import { SuggestionFeedback } from './SuggestionFeedback';
import { SuggestionFields } from './SuggestionFields';

type Props = {
  jobId: string;
  kind: ConceptSuggestionKind;
  suggestions: ConceptSuggestion[];
  knownSlugs: string[];
  onDefinitionApplied: () => void;
};

export const SuggestionsList = ({
  jobId,
  kind,
  suggestions,
  knownSlugs,
  onDefinitionApplied,
}: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const [pickedId, setPickedId] = useState(suggestions[0].suggestionId);

  const picked =
    suggestions.find((suggestion) => suggestion.suggestionId === pickedId) ??
    suggestions[0];

  return (
    <div className="space-y-2">
      <SectionTitle icon="cpu" label={t('AIAssistTitle')} size="md" />
      <div className="text-base">{t('AIAssistDetail')}</div>
      <CandidateList
        suggestions={suggestions}
        pickedId={picked.suggestionId}
        onPick={setPickedId}
      />
      <SuggestionFields
        key={picked.suggestionId}
        jobId={jobId}
        kind={kind}
        suggestion={picked}
        knownSlugs={knownSlugs}
        onDefinitionApplied={onDefinitionApplied}
      />
      <SuggestionFeedback jobId={jobId} suggestionId={picked.suggestionId} />
    </div>
  );
};
