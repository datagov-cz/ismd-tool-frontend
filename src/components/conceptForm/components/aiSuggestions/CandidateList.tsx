import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import type { ConceptSuggestion } from '@/lib/conceptSuggestion/types';

type Props = {
  suggestions: ConceptSuggestion[];
  pickedId: string;
  onPick: (_suggestionId: string) => void;
};

export const CandidateList = ({ suggestions, pickedId, onPick }: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');

  return (
    <ul aria-label={t('CandidatesLabel')} className="flex flex-col gap-2">
      {suggestions.map((suggestion) => {
        const isPicked = suggestion.suggestionId === pickedId;
        return (
          <li key={suggestion.suggestionId}>
            <button
              type="button"
              aria-pressed={isPicked}
              className={clsx(
                'flex w-full min-w-0 cursor-pointer flex-col items-start rounded-lg border px-2.5 py-2 text-left',
                isPicked
                  ? 'border-border-primary bg-blue-subtle'
                  : 'border-border-subtle',
              )}
              onClick={() => onPick(suggestion.suggestionId)}
            >
              <span className="font-bold text-accent">{suggestion.name}</span>
              {suggestion.definition ? (
                <span className="block w-full truncate text-sm text-muted">
                  {suggestion.definition}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
