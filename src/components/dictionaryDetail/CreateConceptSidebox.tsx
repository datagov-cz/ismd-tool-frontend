'use client';

import { useRef } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { CreateConceptBody, useCreateConcept } from '@/api/generated';
import { useCreateConceptBoxStore } from '@/store/createConceptBoxStore';
import { Sidebox } from '../shared/Sidebox';

export const CreateConceptSideBox = () => {
  const t = useTranslations('DictionaryDetail.CreateConcept');

  const isOpen = useCreateConceptBoxStore((state) => state.isOpen);
  const setIsOpen = useCreateConceptBoxStore((state) => state.setIsOpen);

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateConceptBody>({});

  const containerRef = useRef<HTMLDivElement | null>(null);

  const postCommentMutation = useCreateConcept({
    mutation: {
      onSuccess: (data) => {
        toast(data.message || 'Comment uploaded', { type: 'success' });
        reset();
      },
      onError: () => {
        toast('Comment Error', { type: 'error' });
      },
    },
  });

  const onSubmit = (data: CreateConceptBody) => {
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
        <div ref={containerRef} className="space-y-4 overflow-y-auto"></div>
        <form
          className={clsx('relative w-full rounded-md')}
          onSubmit={handleSubmit(onSubmit)}
        >
          <GovButton
            aria-label={t('SendButtonAria')}
            nativeType="submit"
            type="solid"
            color="primary"
            disabled={isSubmitting || !!errors}
          >
            Submit
          </GovButton>
        </form>
      </div>
    </Sidebox>
  );
};
