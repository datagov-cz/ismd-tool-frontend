'use client';

import { useEffect, useId, useMemo } from 'react';
import {
  GovButton,
  GovChip,
  GovFormCheckbox,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { FormSection } from '@/components/conceptForm/components/FormSection';
import { AiFeedback } from '@/components/dictionaryCreate/AiFeedback';
import { AiProgress } from '@/components/dictionaryCreate/AiProgress';
import { DictionarySuggestionCard } from '@/components/dictionaryCreate/DictionarySuggestionCard';
import { IriStatus } from '@/components/dictionaryCreate/IriStatus';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';
import type { IriStatus as IriStatusType } from '@/hooks/useIriCheck';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useVocabularyAi } from '@/hooks/useVocabularyAi';
import { useVocabularyJob } from '@/hooks/useVocabularyJob';
import { displayedRefs, groupForDisplay } from '@/lib/vocabularyDraft/grouping';
import { parseLegalActIri } from '@/lib/vocabularyDraft/legalAct';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

type Props = {
  iriStatus: IriStatusType;
  iri?: string;
};

export const AiSuggestionSection = ({ iriStatus, iri }: Props) => {
  const id = useId();
  const t = useTranslations('CreateOntology.AiSuggestion');
  const isOnline = useIsOnline();

  const legalAct = useVocabularyDraftStore((state) => state.legalAct);
  const items = useVocabularyDraftStore((state) => state.items);
  const selectedRefs = useVocabularyDraftStore((state) => state.selectedRefs);
  const activeJob = useVocabularyDraftStore((state) => state.activeJob);
  const initialFailed = useVocabularyDraftStore((state) => state.initialFailed);
  const setLegalAct = useVocabularyDraftStore((state) => state.setLegalAct);
  const toggleAll = useVocabularyDraftStore((state) => state.toggleAll);

  const { isReconnecting } = useVocabularyJob();
  const { canRun, generate, expand, regenerate } = useVocabularyAi();

  useEffect(() => {
    void useVocabularyDraftStore.persist.rehydrate();
  }, []);

  const enabled = iriStatus === 'ok';
  const groups = useMemo(() => groupForDisplay(items), [items]);
  const visibleRefs = useMemo(() => displayedRefs(groups), [groups]);
  const selectedVisibleCount = visibleRefs.filter((ref) =>
    selectedRefs.includes(ref),
  ).length;
  const allSelected =
    visibleRefs.length > 0 && selectedVisibleCount === visibleRefs.length;
  const hasDraft = items.length > 0;
  const isStarting = activeJob?.jobId === null;
  const isRunning = !!activeJob?.jobId;
  const isInitialRunning = isRunning && activeJob?.op === 'initial';
  const isExpandingClasses =
    activeJob?.op === 'expand' && activeJob.kind === 'classes';
  const aiDisabled = !enabled || !canRun;
  const pickerLocked = Boolean(activeJob || !enabled);
  const showPicker = enabled || !!legalAct || hasDraft;

  const handleIncompleteRetry = () => {
    void generate();
  };

  const handleLegalSourceChange = (iri: string) => {
    if (iri === (legalAct?.iri ?? '')) {
      return;
    }
    if (!iri) {
      setLegalAct(null);
      return;
    }
    const parsed = parseLegalActIri(iri);
    if (!parsed) {
      toast.error(t('LegalAct.Unsupported'));
      return;
    }
    setLegalAct(parsed);
    if (enabled) {
      void generate();
    }
  };

  return (
    <FormSection
      icon="cpu"
      label={
        <div className="flex items-center gap-x-2">
          {t('SectionLabel')}
          <GovChip type="outlined" color="primary" size="xs">
            {t('Optional')}
          </GovChip>
        </div>
      }
    >
      <div className="px-2.5">{t('SectionDescription')}</div>
      <IriStatus status={iriStatus} iri={iri} />
      {enabled && !isOnline ? (
        <div className="px-2.5 text-sm text-muted">{t('OfflineHint')}</div>
      ) : null}
      {showPicker ? (
        <>
          <div className="px-2.5">
            <div
              inert={pickerLocked}
              className={
                pickerLocked ? 'pointer-events-none opacity-60' : undefined
              }
            >
              <LegislativeSourcePicker
                id={id}
                value={legalAct?.iri ?? null}
                onChange={handleLegalSourceChange}
                allowManualEntry={false}
              />
            </div>
          </div>

          {legalAct && !hasDraft && !activeJob ? (
            <div className="px-2.5 flex items-center justify-between gap-2 text-sm text-muted">
              {t('RetryHint')}
              <GovButton
                type="outlined"
                color="primary"
                size="s"
                nativeType="button"
                disabled={aiDisabled}
                onClick={generate}
              >
                {t('Retry')}
              </GovButton>
            </div>
          ) : null}

          {isInitialRunning || (isStarting && !hasDraft) ? (
            <div className="px-2.5">
              <AiProgress isReconnecting={isInitialRunning && isReconnecting} />
            </div>
          ) : null}

          {hasDraft && !isInitialRunning ? (
            <div className="px-2.5 space-y-2">
              {initialFailed ? (
                <div
                  className="flex items-center justify-between gap-2 rounded-lg border border-status-warning-700 p-3 text-sm"
                  role="alert"
                >
                  <span className="flex items-center gap-2">
                    <GovIcon
                      type="components"
                      name="exclamation-triangle"
                      size="s"
                    />
                    {t('IncompleteDraft')}
                  </span>
                  <GovButton
                    type="outlined"
                    color="primary"
                    size="s"
                    nativeType="button"
                    disabled={aiDisabled}
                    onClick={handleIncompleteRetry}
                  >
                    {t('Retry')}
                  </GovButton>
                </div>
              ) : (
                <div className="text-base">{t('AIAssistDetail')}</div>
              )}

              {isRunning && isReconnecting ? (
                <div className="text-sm text-muted" aria-live="polite">
                  {t('Progress.Reconnecting')}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-2 pt-2">
                <GovButton
                  type="outlined"
                  color="primary"
                  size="s"
                  nativeType="button"
                  aria-pressed={allSelected}
                  onClick={() => toggleAll(visibleRefs)}
                >
                  <span className="flex items-center gap-2">
                    <GovFormCheckbox
                      id={`${id}-select-all`}
                      checked={allSelected}
                      readOnly
                      size="s"
                      aria-hidden="true"
                      className="pointer-events-none"
                    />
                    {t('SelectAll')}
                  </span>
                </GovButton>
                <span className="text-sm text-muted">
                  {t('SelectedCount', {
                    selected: selectedVisibleCount,
                    total: visibleRefs.length,
                  })}
                </span>
              </div>

              {groups.map((group) => (
                <DictionarySuggestionCard
                  key={group.item.ref}
                  id={`${id}-${group.item.ref}`}
                  group={group}
                  activeJob={activeJob}
                  aiDisabled={aiDisabled}
                  onExpand={(kind, classRef) =>
                    expand({
                      kind,
                      count: 1,
                      contextText: '',
                      selectedClassId: classRef,
                    })
                  }
                  onRegenerate={regenerate}
                />
              ))}

              <div className="flex justify-center">
                <GovButton
                  type="outlined"
                  color="primary"
                  size="s"
                  nativeType="button"
                  disabled={aiDisabled && !isExpandingClasses}
                  loading={isExpandingClasses ? 'true' : undefined}
                  aria-busy={isExpandingClasses}
                  iconEnd={<GovIcon type="components" name="chevron-down" />}
                  onClick={() =>
                    expand({ kind: 'classes', count: 1, contextText: '' })
                  }
                >
                  {t('MoreClasses')}
                </GovButton>
              </div>

              <AiFeedback key={items.length} />
            </div>
          ) : null}
        </>
      ) : null}
    </FormSection>
  );
};
