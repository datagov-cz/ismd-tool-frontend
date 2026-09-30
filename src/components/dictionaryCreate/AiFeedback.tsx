'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useVocabularyAi } from '@/hooks/useVocabularyAi';
import type { FeedbackVote } from '@/lib/vocabularyDraft/types';

export const AiFeedback = () => {
  const t = useTranslations('CreateOntology.AiSuggestion');
  const [sentVote, setSentVote] = useState<FeedbackVote | null>(null);
  const { vote } = useVocabularyAi();

  const handleVote = (value: FeedbackVote) => {
    if (vote(value)) {
      setSentVote(value);
    }
  };

  if (sentVote) {
    return (
      <div className="text-center text-sm text-muted" role="status">
        {t('FeedbackThanks')}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-muted">{t('SuggestionUseful')}</span>
      <GovButton
        type="base"
        color="primary"
        size="s"
        nativeType="button"
        aria-label={t('SuggestionUsefulYes')}
        onClick={() => handleVote('like')}
      >
        <GovIcon slot="icon-start" type="components" name="hand-thumbs-up" />
      </GovButton>
      <GovButton
        type="base"
        color="primary"
        size="s"
        nativeType="button"
        aria-label={t('SuggestionUsefulNo')}
        onClick={() => handleVote('dislike')}
      >
        <GovIcon slot="icon-start" type="components" name="hand-thumbs-down" />
      </GovButton>
    </div>
  );
};
