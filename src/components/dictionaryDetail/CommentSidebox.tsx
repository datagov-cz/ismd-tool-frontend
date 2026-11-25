'use client';

import { useEffect, useRef } from 'react';
import {
  GovButton,
  GovControlGroup,
  GovIcon,
} from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  CommentCreateModel,
  CommentModel,
  usePostComment,
} from '@/api/generated';
import { createCommentSchema } from '@/lib/formSchemas';
import { useCommentBoxStore } from '@/store/commentBoxStore';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Sidebox } from '../shared/Sidebox';

import { CommentItem } from './CommentItem';

interface CommentSideboxProps {
  ontologyIRI?: string;
  conceptIRI?: string;
  comments?: CommentModel[];
  refetch: () => void;
  userId: string;
}

export const CommentSidebox = ({
  ontologyIRI,
  conceptIRI,
  comments,
  refetch,
  userId,
}: CommentSideboxProps) => {
  const t = useTranslations('DictionaryDetail.CommentSidebox');
  const tError = useTranslations('Errors');

  const isOpen = useCommentBoxStore((state) => state.isOpen);
  const setIsOpen = useCommentBoxStore((state) => state.setIsOpen);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommentCreateModel>({
    resolver: zodResolver(createCommentSchema(t)),
    defaultValues: {
      ontologyIRI: ontologyIRI,
      conceptIRI: conceptIRI,
    },
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [comments]);

  const postCommentMutation = usePostComment({
    mutation: {
      onSuccess: (data) => {
        toast(data.message || 'Comment uploaded', { type: 'success' });
        reset();
        refetch();
      },
      onError: (error) => {
        toast(getErrorMessage(error, tError), { type: 'error' });
      },
    },
  });

  const onSubmit = (data: CommentCreateModel) => {
    postCommentMutation.mutate({
      data: data,
    });
  };

  const commentLength = watch('comment')?.length ?? 0;

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex-1 overflow-hidden flex flex-col h-full justify-between">
        <div ref={containerRef} className="space-y-3 overflow-y-auto">
          {comments?.map(({ id, ...comment }) => (
            <CommentItem
              key={id}
              {...comment}
              id={id}
              loggedUser={userId}
              refetch={() => refetch()}
            />
          ))}
        </div>
        <form
          autoComplete="off"
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label htmlFor="comment-first" className="hidden">
            {t('TextareaPlaceholder')}
          </label>
          <div className="mb-1 flex justify-end text-xs text-card-description">
            <span
              id="comment-counter"
              className={`tabular-nums ${
                commentLength > 255 ? 'text-status-error-600' : ''
              }`}
            >
              {commentLength}/255 znaků
            </span>
          </div>
          <GovControlGroup
            color={errors.comment ? 'error' : 'primary'}
            invalid={!!errors.comment}
            className="w-full bg-blue-subtle [&_span]:h-auto!"
          >
            <textarea
              autoComplete="off"
              id="comment-first"
              aria-invalid={!!errors.comment}
              aria-describedby={
                errors.comment
                  ? 'comment-error-first comment-counter'
                  : 'comment-counter'
              }
              className="min-h-24 min-w-0 flex-1 resize-y bg-transparent px-3 py-2"
              rows={4}
              placeholder={t('TextareaPlaceholder')}
              {...register('comment')}
            />
            <GovButton
              aria-label={t('SendButtonAria')}
              nativeType="submit"
              type="outlined"
              color="primary"
              disabled={isSubmitting || !!errors.comment}
              size="xs"
              className="h-full shrink-0 self-stretch [&_.element]:h-full [&_button]:h-full!"
              iconEnd={<GovIcon name="send" size="l" />}
            >
              {t('Send')}
            </GovButton>
          </GovControlGroup>
          {errors.comment && (
            <p
              id="comment-error-first"
              className="mt-1 text-status-error-600 text-sm"
            >
              {errors.comment.message}
            </p>
          )}
        </form>
      </div>
    </Sidebox>
  );
};
