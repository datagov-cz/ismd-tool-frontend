'use client';

import { useState } from 'react';
import {
  GovButton,
  GovChip,
  GovFormCheckbox,
  GovFormMessage,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { FormSection } from '@/components/conceptForm/components/FormSection';
import { SuggestionEditForm } from '@/components/dictionaryCreate/SuggestionEditForm';
import {
  DefinitionLine,
  SuggestionActions,
  SuggestionItemRow,
} from '@/components/dictionaryCreate/SuggestionItemRow';
import { SuggestionItemRowSkeleton } from '@/components/dictionaryCreate/SuggestionSkeleton';
import {
  TreeItem,
  TreeList,
  TreeStem,
} from '@/components/dictionaryCreate/Tree';
import {
  type ClassGroup,
  resolveTargetLabel,
} from '@/lib/vocabularyDraft/grouping';
import type { DraftItem, PendingJob } from '@/lib/vocabularyDraft/types';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

type ExpandKind = 'properties' | 'relationships';

type Props = {
  id: string;
  group: ClassGroup;
  pendingJob: PendingJob | null;
  aiDisabled: boolean;
  onExpand: (_kind: ExpandKind, _classRef: string) => void;
  onRegenerate: (_ref: string, _contextText: string) => void;
};

export const DictionarySuggestionCard = ({
  id,
  group,
  pendingJob,
  aiDisabled,
  onExpand,
  onRegenerate,
}: Props) => {
  const t = useTranslations('CreateOntology.AiSuggestion');
  const items = useVocabularyDraftStore((state) => state.items);
  const selectedRefs = useVocabularyDraftStore((state) => state.selectedRefs);
  const namingIssues = useVocabularyDraftStore((state) => state.namingIssues);
  const toggle = useVocabularyDraftStore((state) => state.toggle);
  const editItem = useVocabularyDraftStore((state) => state.editItem);
  const [isEditingClass, setIsEditingClass] = useState(false);

  const { item: classItem } = group;
  const isRegenerating = (ref: string) =>
    pendingJob?.op === 'regenerate' && pendingJob.targetRef === ref;
  const isExpanding = (kind: ExpandKind) =>
    pendingJob?.op === 'expand' &&
    pendingJob.kind === kind &&
    pendingJob.selectedClassId === classItem.ref;
  const isClassRegenerating = isRegenerating(classItem.ref);

  const renderGroup = (
    kind: ExpandKind,
    title: string,
    groupItems: DraftItem[],
  ) => (
    <TreeItem className="pl-8.5">
      <div className="text-base font-semibold">{title}</div>
      {groupItems.length > 0 || isExpanding(kind) ? (
        <TreeList rail="nested">
          {groupItems.map((item) => (
            <SuggestionItemRow
              key={item.ref}
              id={`${id}-${item.ref}`}
              item={item}
              checked={selectedRefs.includes(item.ref)}
              title={item.data.name?.cs ?? item.ref}
              subtitle={
                item.kind === 'relationship'
                  ? resolveTargetLabel(items, item.data.targetClass)
                  : undefined
              }
              issue={namingIssues[item.ref]}
              isRegenerating={isRegenerating(item.ref)}
              aiDisabled={aiDisabled}
              className="pl-6"
              onToggle={() => toggle(item.ref)}
              onEdit={(edit) => editItem(item.ref, edit)}
              onRegenerate={(contextText) =>
                onRegenerate(item.ref, contextText)
              }
            />
          ))}
          {isExpanding(kind) ? (
            <SuggestionItemRowSkeleton className="animate-pulse motion-reduce:animate-none" />
          ) : null}
        </TreeList>
      ) : null}
      <div className="pt-2 pl-12">
        <GovButton
          type="outlined"
          color="primary"
          size="s"
          nativeType="button"
          disabled={aiDisabled && !isExpanding(kind)}
          loading={isExpanding(kind) ? 'true' : undefined}
          aria-busy={isExpanding(kind)}
          iconEnd={<GovIcon type="components" name="chevron-down" />}
          onClick={() => onExpand(kind, classItem.ref)}
        >
          {t('GenerateMore')}
        </GovButton>
      </div>
    </TreeItem>
  );

  return (
    <FormSection
      icon={null}
      variant="primary"
      label={
        isEditingClass ? (
          <span className="text-base">{classItem.data.name?.cs}</span>
        ) : (
          <span className="flex items-center gap-4">
            <button
              type="button"
              aria-pressed={selectedRefs.includes(classItem.ref)}
              aria-busy={isClassRegenerating}
              className={clsx(
                'select-none min-w-0 flex items-start gap-2 text-lg text-blue-primary text-left',
                isClassRegenerating && 'opacity-60',
              )}
              onClick={() => toggle(classItem.ref)}
            >
              <span className="relative w-4 shrink-0 self-stretch after:absolute after:left-[7px] after:top-6 after:bottom-0 after:w-px after:bg-border-subtle">
                <span className="flex h-7 items-center">
                  <GovFormCheckbox
                    id={id}
                    checked={selectedRefs.includes(classItem.ref)}
                    readOnly
                    size="s"
                    aria-hidden="true"
                    className="pointer-events-none"
                  />
                </span>
              </span>
              <span className="min-w-0 flex flex-wrap items-start gap-x-3 gap-y-1">
                <span className="min-w-0">
                  {classItem.data.name?.cs ?? classItem.ref}
                </span>
                {classItem.data.type ? (
                  <span className="flex h-7 items-center">
                    <GovChip type="outlined" color="primary" size="xs">
                      {t(`ConceptType.${classItem.data.type}`)}
                    </GovChip>
                  </span>
                ) : null}
              </span>
            </button>
            <SuggestionActions
              aiDisabled={aiDisabled || isClassRegenerating}
              editDisabled={isClassRegenerating}
              isLoading={isClassRegenerating}
              onStartEdit={() => setIsEditingClass(true)}
              onRegenerate={(contextText) =>
                onRegenerate(classItem.ref, contextText)
              }
            />
          </span>
        )
      }
    >
      <div>
        <TreeStem rail="root" className="pl-8.5 pr-2.5">
          {isEditingClass ? (
            <SuggestionEditForm
              item={classItem}
              onCancel={() => setIsEditingClass(false)}
              onSave={(edit) => {
                editItem(classItem.ref, edit);
                setIsEditingClass(false);
              }}
            />
          ) : (
            <>
              <DefinitionLine
                text={classItem.data.definition?.cs}
                className={clsx(isClassRegenerating && 'opacity-60')}
              />
              {namingIssues[classItem.ref] ? (
                <GovFormMessage size="s" color="error">
                  {t(`NamingIssue.${namingIssues[classItem.ref]}`)}
                </GovFormMessage>
              ) : null}
            </>
          )}
        </TreeStem>
        <TreeList rail="root" className="pr-2.5">
          {renderGroup('properties', t('Properties'), group.attributes)}
          {renderGroup('relationships', t('Relations'), group.relationships)}
        </TreeList>
      </div>
    </FormSection>
  );
};
