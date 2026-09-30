import { useTranslations } from 'next-intl';

import { useConceptSuggestions } from '@/hooks/useConceptSuggestions';
import type { ConceptSuggestionRequest } from '@/lib/conceptSuggestion/types';

import { AiLoadingMessage } from './AiLoadingMessage';
import { AiStatusMessage } from './AiStatusMessage';
import { SuggestionsList } from './SuggestionsList';

type Props = {
  request: ConceptSuggestionRequest;
  onRetry: () => void;
  onDefinitionApplied: () => void;
};

export const ConceptSuggestionJob = ({
  request,
  onRetry,
  onDefinitionApplied,
}: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const state = useConceptSuggestions(request);

  if (state.status === 'offline') {
    return <AiStatusMessage message={t('Offline')} color="warning" />;
  }

  if (state.status === 'loading') {
    return <AiLoadingMessage isReconnecting={state.isReconnecting} />;
  }

  if (state.status === 'failed') {
    return (
      <AiStatusMessage message={t('Failed')} color="error" onRetry={onRetry} />
    );
  }

  if (state.suggestions.length === 0) {
    return <AiStatusMessage message={t('Empty')} onRetry={onRetry} />;
  }

  return (
    <SuggestionsList
      jobId={state.jobId}
      kind={request.kind}
      suggestions={state.suggestions}
      knownSlugs={request.knownSlugs}
      onDefinitionApplied={onDefinitionApplied}
    />
  );
};
