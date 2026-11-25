import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { CommentModel, useDeleteComment } from '@/api/generated';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { ConfirmationModal } from '../shared/ConfirmationModal';

interface Props extends CommentModel {
  loggedUser: string;
  refetch: () => void;
}

export const CommentItem = ({
  id,
  userId,
  comment,
  loggedUser,
  postedTime,
  refetch,
}: Props) => {
  const t = useTranslations('DictionaryDetail.CommentSidebox');
  const tError = useTranslations('Errors');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Comment timestamps represent the wall-clock time returned by the API.
  // Normalize timezone-less values as UTC, then format in UTC so the browser
  // does not shift the time by its local UTC offset.
  const parsedPostedTime = postedTime
    ? new Date(
        /(?:Z|[+-]\d{2}:?\d{2})$/i.test(postedTime)
          ? postedTime
          : `${postedTime}Z`,
      )
    : null;
  const hasValidPostedTime =
    parsedPostedTime && !Number.isNaN(parsedPostedTime.getTime());

  const isOwner = userId === loggedUser;

  const deleteComment = useDeleteComment({
    mutation: {
      onSuccess: () => {
        setShowConfirmModal(false);
        toast(t('DeleteSuccess'), { type: 'success' });
        refetch();
      },
      onError: (error) => {
        toast(getErrorMessage(error, tError), { type: 'error' });
      },
    },
  });

  const handleDelete = () => {
    if (loggedUser !== userId) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (id) {
      deleteComment.mutate({ commentId: id });
    }
  };

  return (
    <div className="flex flex-col gap-y-2 p-2 not-last:border-b border-border-default">
      <div className="flex gap-4 justify-between">
        <div className="flex gap-4 items-center">
          <span className="text-sm text-foreground flex justify-center items-center gap-1.5 font-medium">
            {hasValidPostedTime &&
              parsedPostedTime.toLocaleTimeString('cs-CZ', {
                hour: 'numeric',
                minute: 'numeric',
                timeZone: 'UTC',
              })}
            <span className="min-w-0.5 min-h-0.5 w-0.5 h-0.5 bg-foreground rounded-full block" />
            {hasValidPostedTime &&
              parsedPostedTime.toLocaleDateString('cs-CZ', {
                timeZone: 'UTC',
              })}
            {isOwner && (
              <span className="pl-1.5 border-l border-border-default text-accent leading-3">
                {t('OwnComment')}
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <p className="mt-1 text-sm whitespace-pre-wrap line-clamp-3">
          {comment}
        </p>
        {isOwner && (
          <GovButton onClick={handleDelete} color="error" type="base" size="s">
            <GovIcon name="trash" size="m" />
          </GovButton>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => confirmDelete()}
        cancelBtnText={t('DeleteCommentConfirmModal.CancelButton')}
        confirmBtnText={t('DeleteCommentConfirmModal.ConfirmButton')}
      >
        {t('DeleteCommentConfirmModal.Description')}
      </ConfirmationModal>
    </div>
  );
};
