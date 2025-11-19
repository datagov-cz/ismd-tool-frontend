'use client';

import { useEffect, useRef } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
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

//TODO: add user
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
      params: {
        userId: 'test',
      },
    });
  };

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="mt-4 flex-1 overflow-hidden flex flex-col h-full justify-between">
        <div ref={containerRef} className="space-y-4 overflow-y-auto">
          {comments?.map(({ id, ...comment }) => (
            // TODO: use real user data
            <CommentItem
              key={id}
              {...comment}
              id={id}
              loggedUser={userId || 'Anonymous'}
              refetch={() => refetch()}
            />
          ))}
        </div>
        <form
          className={clsx(
            'relative w-full border rounded-md',
            errors.comment
              ? 'border-red-500'
              : 'border-blue dark:border-white/60',
          )}
          onSubmit={handleSubmit(onSubmit)}
        >
          <label htmlFor="comment" className="hidden">
            {t('TextareaPlaceholder')}
          </label>
          <textarea
            id="comment"
            className="size-full px-3 py-2"
            placeholder={t('TextareaPlaceholder')}
            {...register('comment')}
          />
          {errors.comment && (
            <p className="text-red-500 text-sm absolute bottom-1 left-3">
              {errors.comment.message}
            </p>
          )}
          <button
            className="absolute right-4 bottom-2 text-sm outline-1 outline-blue dark:outline-white/60 font-medium cursor-pointer hover:bg-blue/20 dark:hover:bg-blue-hover p-1 rounded transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('SendButtonAria')}
            type="submit"
            disabled={isSubmitting || !!errors.comment}
          >
            <GovIcon name="send" size="l" />
          </button>
        </form>
      </div>
    </Sidebox>
  );
};
