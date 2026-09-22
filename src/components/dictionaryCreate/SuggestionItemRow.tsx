'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  GovButton,
  GovFormCheckbox,
  GovFormMessage,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { AiActionPopover } from '@/components/dictionaryCreate/AiActionPopover';
import { SuggestionEditForm } from '@/components/dictionaryCreate/SuggestionEditForm';
import { TreeItem } from '@/components/dictionaryCreate/Tree';
import type { DraftEdit } from '@/lib/vocabularyDraft/apply';
import type { DraftItem } from '@/lib/vocabularyDraft/types';
import type { NamingIssue } from '@/lib/vocabularyDraft/validation';

type ActionsProps = {
  className?: string;
  aiDisabled: boolean;
  editDisabled: boolean;
  isLoading?: boolean;
  onStartEdit: () => void;
  onRegenerate: (_contextText: string) => void;
};

export const SuggestionActions = ({
  className,
  aiDisabled,
  editDisabled,
  isLoading = false,
  onStartEdit,
  onRegenerate,
}: ActionsProps) => {
  const t = useTranslations('CreateOntology.AiSuggestion');

  return (
    <span className={clsx('flex items-center gap-2 shrink-0', className)}>
      <GovButton
        type="outlined"
        color="primary"
        size="xs"
        nativeType="button"
        disabled={editDisabled}
        aria-label={t('EditItem')}
        onClick={onStartEdit}
      >
        <GovIcon slot="icon-start" type="components" name="pencil" />
      </GovButton>
      <AiActionPopover
        disabled={aiDisabled}
        onConfirm={({ contextText }) => onRegenerate(contextText)}
        trigger={
          <GovButton
            type="outlined"
            color="primary"
            size="xs"
            nativeType="button"
            disabled={aiDisabled && !isLoading}
            loading={isLoading ? 'true' : undefined}
            aria-busy={isLoading}
            aria-label={t('RegenerateItem')}
          >
            <GovIcon slot="icon-start" type="components" name="stars" />
          </GovButton>
        }
      />
    </span>
  );
};

type DefinitionLineProps = {
  text?: string;
  className?: string;
};

export const DefinitionLine = ({ text, className }: DefinitionLineProps) => {
  const t = useTranslations('CreateOntology.AiSuggestion');
  const textRef = useRef<HTMLSpanElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element || isExpanded) {
      return;
    }
    const measure = () =>
      setIsTruncated(element.scrollWidth > element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, isExpanded]);

  if (!text) {
    return null;
  }

  return (
    <div className={clsx('flex items-baseline gap-4', className)}>
      <span
        ref={textRef}
        className={clsx('min-w-0 flex-1 text-muted', !isExpanded && 'truncate')}
      >
        {text}
      </span>
      {isExpanded || isTruncated ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          className="shrink-0 text-sm text-blue-primary underline cursor-pointer"
          onClick={() => setIsExpanded((value) => !value)}
        >
          [{isExpanded ? t('Less') : t('More')}]
        </button>
      ) : null}
    </div>
  );
};

type Props = {
  id: string;
  item: DraftItem;
  checked: boolean;
  title: ReactNode;
  subtitle?: string;
  issue?: NamingIssue;
  isRegenerating: boolean;
  aiDisabled: boolean;
  className?: string;
  onToggle: () => void;
  onEdit: (_edit: DraftEdit) => void;
  onRegenerate: (_contextText: string) => void;
};

export const SuggestionItemRow = ({
  id,
  item,
  checked,
  title,
  subtitle,
  issue,
  isRegenerating,
  aiDisabled,
  className,
  onToggle,
  onEdit,
  onRegenerate,
}: Props) => {
  const t = useTranslations('CreateOntology.AiSuggestion');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <TreeItem className={className} aria-busy={isRegenerating}>
      {isEditing ? (
        <SuggestionEditForm
          item={item}
          onCancel={() => setIsEditing(false)}
          onSave={(edit) => {
            onEdit(edit);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <div className="flex items-start gap-4">
            <button
              type="button"
              aria-pressed={checked}
              className={clsx(
                'select-none min-w-0 flex items-start gap-2 text-base font-bold text-blue-primary text-left',
                isRegenerating && 'opacity-60',
              )}
              onClick={onToggle}
            >
              <span className="flex h-6 w-4 shrink-0 items-center">
                <GovFormCheckbox
                  id={id}
                  checked={checked}
                  readOnly
                  size="s"
                  aria-hidden="true"
                  className="pointer-events-none"
                />
              </span>
              <span className="min-w-0">
                {title}
                {subtitle ? (
                  <span className="font-normal text-muted"> → {subtitle}</span>
                ) : null}
              </span>
            </button>
            <SuggestionActions
              className="self-center"
              aiDisabled={aiDisabled || isRegenerating}
              editDisabled={isRegenerating}
              isLoading={isRegenerating}
              onStartEdit={() => setIsEditing(true)}
              onRegenerate={onRegenerate}
            />
          </div>
          <DefinitionLine
            text={item.data.definition?.cs}
            className={clsx('pl-6 text-sm', isRegenerating && 'opacity-60')}
          />
          {issue ? (
            <GovFormMessage size="s" color="error" className="pl-6">
              {t(`NamingIssue.${issue}`)}
            </GovFormMessage>
          ) : null}
        </>
      )}
    </TreeItem>
  );
};
