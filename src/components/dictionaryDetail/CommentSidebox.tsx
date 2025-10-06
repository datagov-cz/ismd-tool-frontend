'use client';

import { FormEvent } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { tempComments } from '@/lib/constants';
import { useCommentBoxStore } from '@/store/commentBoxStore';
import { Sidebox } from '../shared/Sidebox';

export const CommentSidebox = () => {
  const t = useTranslations('DictionaryDetail.CommentSidebox');

  const isOpen = useCommentBoxStore((state) => state.isOpen);
  const setIsOpen = useCommentBoxStore((state) => state.setIsOpen);

  // TODO: Get detail's comments from API

  // TODO: Implement sending comment to API - use useForm
  const handleSendComment = (e: FormEvent) => {
    e.preventDefault();
    console.log('Send comment');
  };

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="space-y-4 overflow-y-auto">
        {tempComments.map(({ id, author, dateTime, text }) => (
          <div key={id} className="space-y-2 p-2">
            <div className="text-sm font-medium">
              {author} - {new Date(dateTime).toLocaleDateString()}
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap line-clamp-3">
              {text}
            </p>
          </div>
        ))}
      </div>
      <form
        className="relative w-full border border-blue rounded-md"
        onSubmit={handleSendComment}
      >
        <label htmlFor="comment" className="hidden">
          {t('TextareaPlaceholder')}
        </label>
        <textarea
          id="comment"
          name="comment"
          className="size-full px-3 py-2"
          placeholder={t('TextareaPlaceholder')}
        />
        <button
          className="absolute right-4 bottom-2 text-sm text-blue font-medium cursor-pointer hover:bg-blue/20 p-1 rounded transition-colors flex items-center justify-center"
          aria-label={t('SendButtonAria')}
          type="submit"
        >
          <GovIcon name="send" size="l" />
        </button>
      </form>
    </Sidebox>
  );
};
