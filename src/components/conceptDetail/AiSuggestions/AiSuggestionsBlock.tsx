'use client';

import { useId, useMemo, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  acceptSuggestions,
  type AiRelationshipSuggestionDto,
  ConceptCreateModelConceptTypeEnum,
  type PropertyConceptModel,
  type RelationshipConceptModel,
  type ResolvedLegalSourceDto,
  ResolvedLegalSourceDtoEnrichmentStatus,
  resolveLegalSource,
  useCreateConcept,
  useDislikeSuggestions,
  useGetOntologyDetail,
  useLikeSuggestions,
} from '@/api/generated';
import { SuggestionCard } from '@/components/conceptForm/components/SuggestionCard';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { localizedText, PROXY_HANDLED_JWT } from '@/lib/aiSuggestionJobs';

import {
  type AiSuggestionKind,
  type LegalActRef,
  useAiClassSuggestions,
} from './useAiClassSuggestions';

type Props = {
  kind: AiSuggestionKind;
  classIri: string;
  classSlug: string;
  ontologyGraphName?: string;
  ontologySlug?: string;
  definingLegalSources?: ResolvedLegalSourceDto[];
  enabled?: boolean;
  onCreated?: () => void;
};

type TargetsForm = {
  targets: Record<string, { iri: string; label: string } | null>;
};

const toLegalActRef = (resolved: ResolvedLegalSourceDto): LegalActRef | null =>
  resolved.lawYear &&
  resolved.lawNumber &&
  resolved.versionDate &&
  resolved.fragmentIri
    ? {
        year: resolved.lawYear,
        number: Number(resolved.lawNumber),
        date: resolved.versionDate,
        fragmentIri: resolved.fragmentIri,
      }
    : null;

const targetFieldName = (suggestionId: string) =>
  `targets.${suggestionId.replace(/\./g, '-')}`;

export const AiSuggestionsBlock = ({
  kind,
  classIri,
  classSlug,
  ontologyGraphName,
  ontologySlug,
  definingLegalSources,
  enabled = true,
  onCreated,
}: Props) => {
  const id = useId();
  const t = useTranslations('ConceptDetail.AiSuggestions');
  const queryInvalidate = useQueryInvalidator();

  const [legalSourceIri, setLegalSourceIri] = useState<string | null>(null);
  const [pickedAct, setPickedAct] = useState<LegalActRef | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [creating, setCreating] = useState(false);

  const conceptSource = useMemo(
    () => definingLegalSources?.find((item) => toLegalActRef(item)) ?? null,
    [definingLegalSources],
  );

  const conceptAct = useMemo(
    () => (conceptSource ? toLegalActRef(conceptSource) : null),
    [conceptSource],
  );

  const legalAct = conceptAct ?? pickedAct;

  const form = useForm<TargetsForm>({ defaultValues: { targets: {} } });
  const targets = useWatch({ control: form.control, name: 'targets' });

  const { status, properties, relationships, jobId, retry } =
    useAiClassSuggestions(
      kind,
      legalAct,
      classIri,
      ontologySlug ?? null,
      enabled,
    );

  const ontologyDetail = useGetOntologyDetail(ontologySlug ?? '', {
    query: { enabled: !!ontologySlug && kind === 'relationship' },
  });

  const knownClasses = useMemo(() => {
    const map = new Map<string, string>();

    ontologyDetail.data?.data?.ontologyDetail?.['pojmy']?.forEach((concept) => {
      if (concept.iri && concept['typ']?.includes('Třída')) {
        map.set(concept.iri, concept['název']?.cs ?? concept.iri);
      }
    });

    return map;
  }, [ontologyDetail.data]);

  const { mutateAsync: createConcept } = useCreateConcept();
  const { mutate: likeSuggestions, isPending: likePending } =
    useLikeSuggestions();
  const { mutate: dislikeSuggestions, isPending: dislikePending } =
    useDislikeSuggestions();

  const suggestions = kind === 'property' ? properties : relationships;

  const suggestedTargetOf = (suggestion: AiRelationshipSuggestionDto) => {
    const target = suggestion.targetClass?.id;
    return target && knownClasses.has(target) ? target : null;
  };

  const targetIriOf = (suggestion: AiRelationshipSuggestionDto) =>
    suggestedTargetOf(suggestion) ??
    targets?.[suggestion.suggestionId.replace(/\./g, '-')]?.iri ??
    null;

  const toggle = (suggestionId: string) =>
    setSelected((current) =>
      current.includes(suggestionId)
        ? current.filter((item) => item !== suggestionId)
        : [...current, suggestionId],
    );

  const handleSourceChange = async (value: string) => {
    setLegalSourceIri(value);
    setPickedAct(null);
    setSelected([]);
    form.reset({ targets: {} });

    if (!value) {
      return;
    }

    let resolved;
    try {
      resolved = (await resolveLegalSource({ iri: value })).data;
    } catch {
      setLegalSourceIri(null);
      toast.error(t('LoadError'));
      return;
    }

    const isProvision =
      !!resolved?.fragmentIri &&
      resolved.enrichmentStatus !==
        ResolvedLegalSourceDtoEnrichmentStatus.INVALID_IRI &&
      resolved.enrichmentStatus !==
        ResolvedLegalSourceDtoEnrichmentStatus.SKIPPED_NON_FRAGMENT;

    if (!resolved || !isProvision) {
      setLegalSourceIri(null);
      toast.error(t('NotProvision'));
      return;
    }

    const act = toLegalActRef(resolved);

    if (!act) {
      setLegalSourceIri(null);
      toast.error(t('NotFound'));
      return;
    }

    setPickedAct(act);
  };

  const groupByJob = (suggestionIds: string[]) =>
    jobId && suggestionIds.length ? [{ jobId, suggestionIds }] : [];

  const sendFeedback = (kind: 'like' | 'dislike') => {
    const data = groupByJob(
      selected.length ? selected : suggestions.map((item) => item.suggestionId),
    );

    if (!data.length) {
      return;
    }

    const variables = { data, params: PROXY_HANDLED_JWT };

    const handlers = {
      onSuccess: () => {
        setFeedback(kind);
        toast.success(t('FeedbackSaved'));
      },
      onError: () => toast.error(t('FeedbackError')),
    };

    if (kind === 'like') {
      likeSuggestions(variables, handlers);
      return;
    }

    dislikeSuggestions(variables, handlers);
  };

  const creatable =
    kind === 'property'
      ? properties.filter((item) => selected.includes(item.suggestionId))
      : relationships.filter(
          (item) => selected.includes(item.suggestionId) && !!targetIriOf(item),
        );

  const createSelected = async () => {
    if (!ontologySlug || !ontologyGraphName || !legalAct || !creatable.length) {
      return;
    }

    const base = {
      ontologyGraphName,
      definingLegalSource: [legalAct.fragmentIri],
    };

    const bodies: (PropertyConceptModel | RelationshipConceptModel)[] =
      kind === 'property'
        ? properties
            .filter((item) => selected.includes(item.suggestionId))
            .map((item) => ({
              ...base,
              conceptType: ConceptCreateModelConceptTypeEnum.VLASTNOST,
              conceptTypeEnum: ConceptCreateModelConceptTypeEnum.VLASTNOST,
              nameModel: { name: item.name },
              definitionModel: { definition: item.definition },
              domain: classIri,
            }))
        : relationships
            .filter(
              (item) =>
                selected.includes(item.suggestionId) && !!targetIriOf(item),
            )
            .map((item) => ({
              ...base,
              conceptType: ConceptCreateModelConceptTypeEnum.VZTAH,
              conceptTypeEnum: ConceptCreateModelConceptTypeEnum.VZTAH,
              nameModel: { name: item.name },
              definitionModel: { definition: item.definition },
              domain: classIri,
              range: targetIriOf(item) ?? undefined,
            }));

    setCreating(true);

    try {
      for (const data of bodies) {
        await createConcept({ slug: ontologySlug, data });
      }

      const accepted = groupByJob(selected);

      if (accepted.length) {
        await acceptSuggestions(accepted, PROXY_HANDLED_JWT).catch(
          () => undefined,
        );
      }

      await queryInvalidate.invalidateConcept(decodeURIComponent(classSlug));
      await queryInvalidate.invalidateOntology(ontologySlug);

      setSelected([]);
      form.reset({ targets: {} });
      toast.success(t('Created', { count: bodies.length }));
      onCreated?.();
    } catch {
      toast.error(t('CreateError'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-2 border-t border-border-subtle pt-3">
        <SectionTitle
          icon="cpu"
          label={
            kind === 'property' ? t('TitleProperties') : t('TitleRelations')
          }
          size="md"
        />

        {conceptAct ? (
          <div className="text-sm text-muted">
            {t('UsingConceptSource', {
              source: conceptSource?.displayLabel ?? '',
            })}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted">{t('PickSource')}</div>
            <LegislativeSourcePicker
              id={id}
              onChange={handleSourceChange}
              value={legalSourceIri}
            />
          </>
        )}

        {status === 'loading' ? (
          <div className="text-sm">{t('Loading')}</div>
        ) : null}

        {status === 'failed' ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('Failed')}</span>
            <GovButton
              type="outlined"
              color="primary"
              size="s"
              onGovClick={retry}
            >
              {t('Retry')}
            </GovButton>
          </div>
        ) : null}

        {status === 'ready' && !suggestions.length ? (
          <div className="text-sm">{t('Empty')}</div>
        ) : null}

        {status === 'ready' && suggestions.length ? (
          <div className="space-y-2">
            <div className="flex justify-end">
              <span className="text-sm text-muted">
                {t('SelectedCount', {
                  selected: selected.length,
                  total: suggestions.length,
                })}
              </span>
            </div>

            {kind === 'property'
              ? properties.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.suggestionId}
                    id={`${id}-${suggestion.suggestionId}`}
                    label={localizedText(suggestion.name)}
                    description={localizedText(suggestion.definition)}
                    checked={selected.includes(suggestion.suggestionId)}
                    onToggle={() => toggle(suggestion.suggestionId)}
                  />
                ))
              : relationships.map((suggestion) => (
                  <div key={suggestion.suggestionId} className="space-y-1">
                    <SuggestionCard
                      id={`${id}-${suggestion.suggestionId}`}
                      label={localizedText(suggestion.name)}
                      description={localizedText(suggestion.definition)}
                      checked={selected.includes(suggestion.suggestionId)}
                      onToggle={() => toggle(suggestion.suggestionId)}
                    />
                    <div className="px-2.5">
                      {suggestedTargetOf(suggestion) ? (
                        <span className="text-sm text-muted">
                          {t('RelationTargetResolved', {
                            target:
                              knownClasses.get(
                                suggestedTargetOf(suggestion) ?? '',
                              ) ?? '',
                          })}
                        </span>
                      ) : (
                        <>
                          <span className="text-sm text-muted">
                            {t('RelationTargetUnknown')}
                          </span>
                          <ConceptInput
                            name={targetFieldName(suggestion.suggestionId)}
                            label={t('RelationTargetLabel')}
                            placeholder={t('RelationTargetPlaceholder')}
                            searchType="CLASS"
                            searchSource="ISMD"
                            nonFloatingDropDown
                            layout="flex"
                            single
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted">{t('Useful')}</span>
              <GovButton
                type={feedback === 'like' ? 'solid' : 'base'}
                color="primary"
                size="s"
                aria-label={t('UsefulYes')}
                aria-pressed={feedback === 'like'}
                disabled={likePending || dislikePending}
                onGovClick={() => sendFeedback('like')}
              >
                <GovIcon
                  slot="icon-start"
                  type="components"
                  name="hand-thumbs-up"
                />
              </GovButton>
              <GovButton
                type={feedback === 'dislike' ? 'solid' : 'base'}
                color="primary"
                size="s"
                aria-label={t('UsefulNo')}
                aria-pressed={feedback === 'dislike'}
                disabled={likePending || dislikePending}
                onGovClick={() => sendFeedback('dislike')}
              >
                <GovIcon
                  slot="icon-start"
                  type="components"
                  name="hand-thumbs-down"
                />
              </GovButton>
            </div>

            <div className="flex justify-center">
              <GovButton
                type="solid"
                color="primary"
                size="s"
                disabled={!creatable.length || creating}
                onGovClick={createSelected}
              >
                {creating
                  ? t('Creating')
                  : t('CreateSelected', { count: creatable.length })}
              </GovButton>
            </div>
          </div>
        ) : null}
      </div>
    </FormProvider>
  );
};
