'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { AiProgress } from '@/components/shared/AiProgress';
import { useConceptSuggestionRequest } from '@/hooks/useConceptSuggestionRequest';

import { AiStatusMessage } from './AiStatusMessage';
import { ConceptSuggestionJob } from './ConceptSuggestionJob';

type Props = {
  fragmentIri: string;
  ontologySlug: string;
  onDefinitionApplied: () => void;
};

export const ConceptAiSuggestions = ({
  fragmentIri,
  ontologySlug,
  onDefinitionApplied,
}: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const state = useConceptSuggestionRequest(fragmentIri, ontologySlug);
  const [attempt, setAttempt] = useState(0);

  if (state.status === 'unsupported') {
    return <AiStatusMessage message={t('Unsupported')} color="warning" />;
  }

  if (state.status === 'needsDomain') {
    return <AiStatusMessage message={t('NeedsDomain')} />;
  }

  if (state.status === 'resolving') {
    return <AiProgress title={t('LoadingTitle')} hint={t('LoadingHint')} />;
  }

  return (
    <ConceptSuggestionJob
      key={`${state.key}::${attempt}`}
      request={state.request}
      onRetry={() => setAttempt((current) => current + 1)}
      onDefinitionApplied={onDefinitionApplied}
    />
  );
};
