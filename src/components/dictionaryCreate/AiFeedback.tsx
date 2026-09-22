'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useVocabularyAi } from '@/hooks/useVocabularyAi';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

export const AiFeedback = () => {
  const t = useTranslations('CreateOntology.AiSuggestion');
  const feedback = useVocabularyDraftStore((state) => state.feedback);
  const { vote } = useVocabularyAi();

  if (feedback) {
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
        onClick={() => vote('like')}
      >
        <GovIcon slot="icon-start" type="components" name="hand-thumbs-up" />
      </GovButton>
      <GovButton
        type="base"
        color="primary"
        size="s"
        nativeType="button"
        aria-label={t('SuggestionUsefulNo')}
        onClick={() => vote('dislike')}
      >
        <GovIcon slot="icon-start" type="components" name="hand-thumbs-down" />
      </GovButton>
    </div>
  );
};
