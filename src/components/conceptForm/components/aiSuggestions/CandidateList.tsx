import { type KeyboardEvent, useRef } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import type { ConceptSuggestion } from '@/lib/conceptSuggestion/types';

type Props = {
  suggestions: ConceptSuggestion[];
  pickedId: string;
  onPick: (_suggestionId: string) => void;
};

const KEY_STEPS: Record<string, number> = {
  ArrowDown: 1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowLeft: -1,
};

export const CandidateList = ({ suggestions, pickedId, onPick }: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const step = KEY_STEPS[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const next = (index + step + suggestions.length) % suggestions.length;
    onPick(suggestions[next].suggestionId);
    radios.current[next]?.focus();
  };

  return (
    <ul
      role="radiogroup"
      aria-label={t('CandidatesLabel')}
      className="flex flex-col gap-2"
    >
      {suggestions.map((suggestion, index) => {
        const isPicked = suggestion.suggestionId === pickedId;
        return (
          <li key={suggestion.suggestionId} role="presentation">
            <button
              ref={(element) => {
                radios.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isPicked}
              tabIndex={isPicked ? 0 : -1}
              className={clsx(
                'flex w-full min-w-0 cursor-pointer flex-col items-start rounded-lg border px-2.5 py-2 text-left',
                isPicked
                  ? 'border-border-primary bg-blue-subtle'
                  : 'border-border-subtle',
              )}
              onClick={() => onPick(suggestion.suggestionId)}
              onKeyDown={(event) => handleKeyDown(event, index)}
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
