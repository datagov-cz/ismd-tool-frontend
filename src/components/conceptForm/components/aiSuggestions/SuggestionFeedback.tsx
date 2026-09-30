import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { dislikeSuggestions, likeSuggestions } from '@/api/generated';

type Vote = 'like' | 'dislike';

type Props = {
  jobId: string;
  suggestionId: string;
  hasVoted: boolean;
  onVoted: (_suggestionId: string) => void;
};

export const SuggestionFeedback = ({
  jobId,
  suggestionId,
  hasVoted,
  onVoted,
}: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill');

  const sendVote = (vote: Vote) => {
    onVoted(suggestionId);
    const send = vote === 'like' ? likeSuggestions : dislikeSuggestions;
    send([{ jobId, suggestionIds: [suggestionId] }]).catch(() => undefined);
  };

  if (hasVoted) {
    return (
      <div className="text-center text-sm text-muted">
        {t('Ai.FeedbackThanks')}
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
        onClick={() => sendVote('like')}
      >
        <GovIcon slot="icon-start" type="components" name="hand-thumbs-up" />
      </GovButton>
      <GovButton
        type="base"
        color="primary"
        size="s"
        nativeType="button"
        aria-label={t('SuggestionUsefulNo')}
        onClick={() => sendVote('dislike')}
      >
        <GovIcon slot="icon-start" type="components" name="hand-thumbs-down" />
      </GovButton>
    </div>
  );
};
