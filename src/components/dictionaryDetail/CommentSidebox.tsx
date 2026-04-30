'use client';

import { useEffect, useRef } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
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

  const isOpen = useCommentBoxStore((state) => state.isOpen);
  const setIsOpen = useCommentBoxStore((state) => state.setIsOpen);

  const {
    register,
    handleSubmit,
    reset,
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
      onError: () => {
        toast('Comment Error', { type: 'error' });
      },
    },
  });

  const onSubmit = (data: CommentCreateModel) => {
    postCommentMutation.mutate({
      data: data,
    });
  };

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
          className={clsx(
            'relative w-full border rounded-md bg-primary-subtlest',
            errors.comment
              ? 'border-red-500'
              : 'border-blue/20 dark:border-white/60',
          )}
          onSubmit={handleSubmit(onSubmit)}
        >
          <label htmlFor="comment" className="hidden">
            {t('TextareaPlaceholder')}
          </label>
          <textarea
            id="comment"
            className="size-full px-3 py-2"
            rows={4}
            placeholder={t('TextareaPlaceholder')}
            {...register('comment')}
          />
          {errors.comment && (
            <p className="text-red-500 text-sm absolute bottom-1 left-3">
              {errors.comment.message}
            </p>
          )}
          <GovButton
            aria-label={t('SendButtonAria')}
            nativeType="submit"
            type="outlined"
            color="primary"
            disabled={isSubmitting || !!errors.comment}
            size="xs"
            className="absolute z-1000 bottom-2 right-3"
          >
            Odeslat
            <GovIcon name="send" size="l" slot="icon-end" />
          </GovButton>
        </form>
      </div>
    </Sidebox>
  );
};
