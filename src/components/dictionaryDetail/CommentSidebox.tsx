'use client';

import { useEffect, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import { tempComments } from '@/lib/constants';
import { CommentSchemaType, createCommentSchema } from '@/lib/formSchemas';
import { useCommentBoxStore } from '@/store/commentBoxStore';
import { Sidebox } from '../shared/Sidebox';

import { CommentItem } from './CommentItem';

export const CommentSidebox = () => {
  const t = useTranslations('DictionaryDetail.CommentSidebox');

  const { data: session } = useSession();

  const isOpen = useCommentBoxStore((state) => state.isOpen);
  const setIsOpen = useCommentBoxStore((state) => state.setIsOpen);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentSchemaType>({
    resolver: zodResolver(createCommentSchema(t)),
  });

  const [comments, setComments] = useState(tempComments);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [comments]);

  // TODO: Get detail's comments from API

  // TODO: Implement sending comment to API - use useForm
  const onSubmit: SubmitHandler<CommentSchemaType> = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setComments([
        ...comments,
        {
          id: comments.length + 1,
          text: data.message,
          author: 'John Doe',
          dateTime: new Date(),
        },
      ]);

      reset();
    } catch (error) {
      console.error('Error sending comment:', error);
      setError('message', {
        message: t('ErrorSendingComment'),
      });
    }
  };

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div ref={containerRef} className="space-y-4 overflow-y-auto">
        {comments.map(({ id, ...comment }) => (
          <CommentItem
            key={id}
            {...comment}
            user={session?.user?.name || 'John Doe'}
          />
        ))}
      </div>
      <form
        className={`relative w-full border rounded-md ${errors.message ? 'border-red-500' : 'border-blue dark:border-white/60'}`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <label htmlFor="comment" className="hidden">
          {t('TextareaPlaceholder')}
        </label>
        <textarea
          id="comment"
          className="size-full px-3 py-2"
          placeholder={t('TextareaPlaceholder')}
          {...register('message')}
        />
        {errors.message && (
          <p className="text-red-500 text-sm absolute bottom-1 left-3">
            {errors.message.message}
          </p>
        )}
        <button
          className="absolute right-4 bottom-2 text-sm outline-1 outline-blue dark:outline-white/60 font-medium cursor-pointer hover:bg-blue/20 dark:hover:bg-blue-hover p-1 rounded transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('SendButtonAria')}
          type="submit"
          disabled={isSubmitting || !!errors.message}
        >
          <GovIcon name="send" size="l" />
        </button>
      </form>
    </Sidebox>
  );
};
