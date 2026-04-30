import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { CommentModel, useDeleteComment } from '@/api/generated';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isOwner = userId === loggedUser;

  const deleteComment = useDeleteComment({
    mutation: {
      onSuccess: () => {
        setShowConfirmModal(false);
        toast(t('DeleteSuccess'), { type: 'success' });
        refetch();
      },
      onError: (error) => {
        toast(String(error), { type: 'error' });
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
    <div className="flex flex-col gap-y-2 p-2 not-last:border-b border-secondary/70">
      <div className="flex gap-4 justify-between">
        <div className="flex gap-4 items-center">
          <span className="text-sm text-black flex justify-center items-center gap-1.5 font-medium">
            {postedTime &&
              new Date(postedTime).toLocaleTimeString('CS', {
                hour: 'numeric',
                minute: 'numeric',
              })}
            <span className="min-w-0.5 min-h-0.5 w-0.5 h-0.5 bg-black rounded-full block" />
            {postedTime && new Date(postedTime).toLocaleDateString('CS')}
            {isOwner && (
              <span className="pl-1.5 border-l border-blue/30 text-blue-primary leading-3">
                Vlastní komentář
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
          <GovButton
            onGovClick={handleDelete}
            color="error"
            type="base"
            size="s"
          >
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
