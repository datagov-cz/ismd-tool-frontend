'use client';

import { useId, useState } from 'react';
import {
  GovButton,
  GovFormCheckbox,
  GovIcon,
  GovMessage,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  acceptSuggestions,
  dislikeSuggestions,
  likeSuggestions,
  useGetOntologyDetail,
  useGetOntologyList,
} from '@/api/generated';
import { SuggestionCard } from '@/components/conceptForm/components/SuggestionCard';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useConceptSuggestions } from '@/hooks/useConceptSuggestions';
import { dictionaryIriOfConcept } from '@/lib/conceptSuggestion/domainDictionary';
import type { ConceptSuggestion } from '@/lib/conceptSuggestion/types';

type LanguageEntry = { languageTag: string; name: string };

type LanguagePath =
  | 'nameModel.name'
  | 'definitionModel.definition'
  | 'descriptionModel.description';

type RangeRef = { iri: string; label: string; id?: number };

type FieldCard =
  | {
      key: 'name' | 'definition' | 'description';
      label: string;
      description: string;
      path: LanguagePath;
    }
  | { key: 'classType'; label: string; description: string; value: string }
  | { key: 'range'; label: string; description: string; value: RangeRef };

type FieldKey = FieldCard['key'];

type Vote = 'like' | 'dislike';

const lastIriSegment = (iri: string) =>
  iri.split(/[/#]/).filter(Boolean).pop() ?? iri;

type SuggestionsListProps = {
  jobId: string;
  suggestions: ConceptSuggestion[];
  ontologySlug: string;
};

const SuggestionsList = ({
  jobId,
  suggestions,
  ontologySlug,
}: SuggestionsListProps) => {
  const id = useId();
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const tConcept = useTranslations('CreateConcept');
  const { control, getValues, setValue, trigger } =
    useFormContext<ConceptForm>();
  const conceptType = useWatch({ control, name: 'conceptTypeEnum' });
  const { data: ontologyDetail } = useGetOntologyDetail(ontologySlug);

  const [pickedId, setPickedId] = useState(suggestions[0]?.suggestionId);
  const [vote, setVote] = useState<Vote | null>(null);

  const picked =
    suggestions.find((suggestion) => suggestion.suggestionId === pickedId) ??
    suggestions[0];

  const concepts = ontologyDetail?.data?.ontologyMetadata?.concepts ?? [];
  const rangeConcept =
    conceptType === 'VZTAH' && picked?.targetIri
      ? concepts.find((concept) => concept.conceptIri === picked.targetIri)
      : undefined;

  const cards: FieldCard[] = [];
  if (picked?.name) {
    cards.push({
      key: 'name',
      label: tConcept('CommonConceptFields.Labels.Name'),
      description: picked.name,
      path: 'nameModel.name',
    });
  }
  if (
    conceptType === 'TRIDA' &&
    (picked?.classType === 'SUBJECT' || picked?.classType === 'OBJECT')
  ) {
    const isSubject = picked.classType === 'SUBJECT';
    cards.push({
      key: 'classType',
      label: tConcept('ClassCreateFields.Labels.ClassType'),
      description: tConcept(
        isSubject
          ? 'ClassCreateFields.Options.ClassType.SubjectOfLawType'
          : 'ClassCreateFields.Options.ClassType.ObjectOfLawType',
      ),
      value: isSubject ? 'Subjekt' : 'Objekt',
    });
  }
  if (picked?.definition) {
    cards.push({
      key: 'definition',
      label: tConcept('CommonConceptFields.Labels.Definition'),
      description: picked.definition,
      path: 'definitionModel.definition',
    });
  }
  if (picked?.explanation) {
    cards.push({
      key: 'description',
      label: tConcept('CommonConceptFields.Labels.Description'),
      description: picked.explanation,
      path: 'descriptionModel.description',
    });
  }
  if (rangeConcept?.conceptIri && rangeConcept.conceptName) {
    cards.push({
      key: 'range',
      label: tConcept('TypesSection.RelationRangeLabel'),
      description: rangeConcept.conceptName,
      value: {
        iri: rangeConcept.conceptIri,
        label: rangeConcept.conceptName,
        id: rangeConcept.id,
      },
    });
  }

  const cardKeys = cards.map((card) => card.key);
  const [selectedKeys, setSelectedKeys] = useState<FieldKey[] | null>(null);
  const selected = selectedKeys
    ? selectedKeys.filter((key) => cardKeys.includes(key))
    : cardKeys;

  const allSelected = selected.length === cards.length;

  const pickSuggestion = (suggestionId: string) => {
    setPickedId(suggestionId);
    setSelectedKeys(null);
  };

  const toggleCard = (key: FieldKey) =>
    setSelectedKeys(
      selected.includes(key)
        ? selected.filter((item) => item !== key)
        : [...selected, key],
    );

  const toggleAll = () => setSelectedKeys(allSelected ? [] : cardKeys);

  const setCsEntry = (path: LanguagePath, value: string) => {
    const entries = (getValues(path) ?? []) as LanguageEntry[];
    const index = entries.findIndex((entry) => entry.languageTag === 'cs');
    const next =
      index === -1
        ? [...entries, { languageTag: 'cs', name: value }]
        : entries.map((entry, i) =>
            i === index ? { ...entry, name: value } : entry,
          );
    setValue(path, next, { shouldDirty: true });
    void trigger(path);
  };

  const applySelected = () => {
    if (!picked) {
      return;
    }
    cards
      .filter((card) => selected.includes(card.key))
      .forEach((card) => {
        if (card.key === 'classType') {
          setValue('type', card.value, { shouldDirty: true });
          return;
        }
        if (card.key === 'range') {
          setValue('range', card.value, { shouldDirty: true });
          void trigger('range');
          return;
        }
        setCsEntry(card.path, card.description);
      });
    toast.success(t('Ai.Applied'));
    acceptSuggestions([{ jobId, suggestionIds: [picked.suggestionId] }]).catch(
      () => undefined,
    );
  };

  const sendVote = (value: Vote) => {
    setVote(value);
    const send = value === 'like' ? likeSuggestions : dislikeSuggestions;
    send([
      {
        jobId,
        suggestionIds: suggestions.map((suggestion) => suggestion.suggestionId),
      },
    ]).catch(() => undefined);
  };

  return (
    <div className="space-y-2">
      <SectionTitle icon="cpu" label={t('AIAssistTitle')} size="md" />
      <div className="text-base">{t('AIAssistDetail')}</div>
      <ul
        role="radiogroup"
        aria-label={t('Ai.CandidatesLabel')}
        className="flex flex-col gap-2"
      >
        {suggestions.map((suggestion) => {
          const isPicked = suggestion.suggestionId === picked?.suggestionId;
          return (
            <li key={suggestion.suggestionId} role="presentation">
              <button
                type="button"
                role="radio"
                aria-checked={isPicked}
                className={clsx(
                  'flex w-full min-w-0 cursor-pointer flex-col items-start rounded-lg border px-2.5 py-2 text-left',
                  isPicked
                    ? 'border-border-primary bg-blue-subtle'
                    : 'border-border-subtle',
                )}
                onClick={() => pickSuggestion(suggestion.suggestionId)}
              >
                <span className="font-bold text-accent">{suggestion.name}</span>
                {suggestion.definition ? (
                  <span className="block w-full truncate text-sm text-muted">
                    {suggestion.definition}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {cards.length > 0 ? (
        <div className="flex items-center justify-between gap-2 pt-2">
          <GovButton
            type="outlined"
            color="primary"
            size="s"
            nativeType="button"
            aria-pressed={allSelected}
            onClick={toggleAll}
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
              selected: selected.length,
              total: cards.length,
            })}
          </span>
        </div>
      ) : null}
      {cards.map((card) => (
        <SuggestionCard
          key={card.key}
          id={`${id}-${card.key}`}
          label={card.label}
          description={card.description}
          checked={selected.includes(card.key)}
          onToggle={() => toggleCard(card.key)}
        />
      ))}
      {conceptType === 'VZTAH' && picked?.targetIri && !rangeConcept ? (
        <div className="text-sm text-muted">
          {t('Ai.TargetNotInDictionary', {
            target: lastIriSegment(picked.targetIri),
          })}
        </div>
      ) : null}
      <div className="flex items-center justify-center gap-2">
        {vote ? (
          <span className="text-sm text-muted">{t('Ai.FeedbackThanks')}</span>
        ) : (
          <>
            <span className="text-sm text-muted">{t('SuggestionUseful')}</span>
            <GovButton
              type="base"
              color="primary"
              size="s"
              nativeType="button"
              aria-label={t('SuggestionUsefulYes')}
              onClick={() => sendVote('like')}
            >
              <GovIcon
                slot="icon-start"
                type="components"
                name="hand-thumbs-up"
              />
            </GovButton>
            <GovButton
              type="base"
              color="primary"
              size="s"
              nativeType="button"
              aria-label={t('SuggestionUsefulNo')}
              onClick={() => sendVote('dislike')}
            >
              <GovIcon
                slot="icon-start"
                type="components"
                name="hand-thumbs-down"
              />
            </GovButton>
          </>
        )}
      </div>
      <div className="flex justify-center">
        <GovButton
          type="solid"
          color="primary"
          nativeType="button"
          disabled={selected.length === 0}
          onClick={applySelected}
        >
          {t('ApplySelected')}
        </GovButton>
      </div>
    </div>
  );
};

type RetryProps = {
  message: string;
  onRetry: () => void;
};

const RetryLine = ({ message, onRetry }: RetryProps) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">{message}</span>
      <GovButton
        type="outlined"
        color="primary"
        size="s"
        nativeType="button"
        onClick={onRetry}
      >
        {t('Retry')}
      </GovButton>
    </div>
  );
};

type Props = {
  fragmentIri: string | null;
  ontologySlug: string;
};

export const ConceptAiSuggestions = ({ fragmentIri, ontologySlug }: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const { control } = useFormContext<ConceptForm>();
  const conceptType = useWatch({ control, name: 'conceptTypeEnum' });
  const domain = useWatch({ control, name: 'domain' });

  const domainIri = conceptType === 'TRIDA' ? undefined : domain?.iri;
  const needsDomainDictionary = !!domainIri;
  const ontologyList = useGetOntologyList(undefined, {
    query: { enabled: needsDomainDictionary },
  });
  const domainDictionaryIri = domainIri
    ? dictionaryIriOfConcept(domainIri)
    : null;
  const domainSlug = domainDictionaryIri
    ? ontologyList.data?.data?.find(
        (ontology) => ontology.graphName === domainDictionaryIri,
      )?.slug
    : undefined;
  const knownSlugs = Array.from(
    new Set(domainSlug ? [ontologySlug, domainSlug] : [ontologySlug]),
  );

  const { state, isReconnecting, retry } = useConceptSuggestions({
    kind: conceptType,
    fragmentIri,
    domainIri,
    knownSlugs,
    ready: !needsDomainDictionary || !ontologyList.isLoading,
  });

  if (state.status === 'idle') {
    return null;
  }

  if (state.status === 'unsupported' || state.status === 'offline') {
    return (
      <div className="text-sm text-muted">
        {t(state.status === 'unsupported' ? 'Unsupported' : 'Offline')}
      </div>
    );
  }

  if (state.status === 'needsDomain') {
    return (
      <GovMessage
        color="primary"
        type="subtle"
        icon={<GovIcon type="components" name="info-circle" />}
      >
        {t('NeedsDomain')}
      </GovMessage>
    );
  }

  if (state.status === 'loading') {
    return (
      <div aria-live="polite">
        <GovMessage
          color="primary"
          type="subtle"
          icon={
            <GovIcon
              type="components"
              name="loader"
              size="s"
              className="animate-spin motion-reduce:animate-none"
            />
          }
        >
          <div className="font-bold">{t('LoadingTitle')}</div>
          <div className="text-sm text-muted">{t('LoadingHint')}</div>
          {isReconnecting ? (
            <div className="text-sm text-muted">{t('Reconnecting')}</div>
          ) : null}
        </GovMessage>
      </div>
    );
  }

  if (state.status === 'failed') {
    return <RetryLine message={t('Failed')} onRetry={retry} />;
  }

  if (state.result.suggestions.length === 0) {
    return <RetryLine message={t('Empty')} onRetry={retry} />;
  }

  return (
    <SuggestionsList
      key={state.result.jobId}
      jobId={state.result.jobId}
      suggestions={state.result.suggestions}
      ontologySlug={ontologySlug}
    />
  );
};
