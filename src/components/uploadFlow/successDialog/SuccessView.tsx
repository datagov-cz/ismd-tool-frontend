import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { OntologyMetadataModel, RejectedConceptDto } from '@/api/generated';

type RejectionReasonKey =
  | 'OutsideNamespace'
  | 'UndefinedProperty'
  | 'SchemaMismatch'
  | 'MissingField'
  | 'Other';

interface RejectionGroup {
  key: RejectionReasonKey;
  concepts: RejectedConceptDto[];
}

const groupRejectedConcepts = (
  concepts: RejectedConceptDto[],
): RejectionGroup[] => {
  const groups = new Map<RejectionReasonKey, RejectedConceptDto[]>();

  concepts.forEach((concept) => {
    const reason = concept.reason ?? '';
    const keys = new Set<RejectionReasonKey>();

    if (reason.includes('pojem neleží ve jmenném prostoru')) {
      keys.add('OutsideNamespace');
    }
    if (/vlastnost .+? není definována v kontextu OFN/.test(reason)) {
      keys.add('UndefinedProperty');
    }
    if (reason.includes('pojem nesplňuje OFN schéma')) {
      keys.add('SchemaMismatch');
    }
    if (reason.includes('chybí povinné pole')) {
      keys.add('MissingField');
    }
    if (keys.size === 0) keys.add('Other');

    keys.forEach((key) => {
      const group = groups.get(key) ?? [];
      group.push(concept);
      groups.set(key, group);
    });
  });

  return [...groups.entries()]
    .map(([key, groupedConcepts]) => ({ key, concepts: groupedConcepts }))
    .sort((a, b) => b.concepts.length - a.concepts.length);
};

const getConceptLabel = (iri?: string) => {
  if (!iri) return '';
  const lastSegment = iri.split(/[\/#]/).filter(Boolean).at(-1) ?? iri;

  try {
    return decodeURIComponent(lastSegment).replace(/[-_]/g, ' ');
  } catch {
    return lastSegment.replace(/[-_]/g, ' ');
  }
};

interface SuccessViewProps {
  onClose: () => void;
  ontologyData: OntologyMetadataModel;
}

export const SuccessView = ({ onClose, ontologyData }: SuccessViewProps) => {
  const { id, graphName, slug } = ontologyData;
  const t = useTranslations('UploadOntology');
  const rejectedConcepts = ontologyData.rejectedConcepts ?? [];
  const rejectionGroups = groupRejectedConcepts(rejectedConcepts);
  const rejectionLabels: Record<RejectionReasonKey, string> = {
    OutsideNamespace: t('SuccessDialog.RejectionReasons.OutsideNamespace'),
    UndefinedProperty: t('SuccessDialog.RejectionReasons.UndefinedProperty'),
    SchemaMismatch: t('SuccessDialog.RejectionReasons.SchemaMismatch'),
    MissingField: t('SuccessDialog.RejectionReasons.MissingField'),
    Other: t('SuccessDialog.RejectionReasons.Other'),
  };

  return (
    <div className="w-full max-w-250 mx-auto space-y-6 bg-surface-muted p-6 md:p-8 rounded-xl shadow-raised">
      <header className="flex items-start gap-3">
        <GovIcon
          type="components"
          name="check-circle"
          color="success"
          size="l"
          className="mt-0.5 shrink-0"
        />
        <h2 className="font-medium text-xl">{t('SuccessDialog.Title')}</h2>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface p-4">
          <p className="text-sm text-foreground-muted">ID</p>
          <p className="font-medium">{id}</p>
        </div>
        {graphName && (
          <div className="rounded-lg border border-border-default bg-surface p-4 min-w-0">
            <p className="text-sm text-foreground-muted">IRI</p>
            <Link
              href={graphName}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline break-all"
            >
              {graphName}
            </Link>
          </div>
        )}
      </div>

      {rejectedConcepts.length > 0 && (
        <section className="rounded-xl border border-status-warning-300 bg-status-warning-100 p-4 md:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <GovIcon
              type="components"
              name="exclamation-triangle"
              color="warning"
              className="mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-status-warning-700">
                {t('SuccessDialog.RejectedConcepts', {
                  count: rejectedConcepts.length,
                })}
              </h3>
              <p className="text-sm mt-1">
                {t('SuccessDialog.RejectedConceptsDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {rejectionGroups.map((group) => (
              <details
                key={group.key}
                className="group rounded-lg border border-status-warning-300 bg-surface overflow-hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 font-medium [&::-webkit-details-marker]:hidden">
                  <span>{rejectionLabels[group.key]}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-status-warning-100 px-2 py-0.5 text-sm">
                      {t('SuccessDialog.RejectedConceptCount', {
                        count: group.concepts.length,
                      })}
                    </span>
                    <GovIcon
                      type="components"
                      name="chevron-down"
                      size="s"
                      className="transition-transform group-open:rotate-180"
                    />
                  </span>
                </summary>
                <ul className="max-h-80 overflow-y-auto divide-y divide-border-default border-t border-border-default">
                  {group.concepts.map((concept, index) => (
                    <li
                      key={`${group.key}-${concept.iri ?? 'concept'}-${index}`}
                      className="px-3 py-2.5"
                    >
                      {concept.iri ? (
                        <span className="font-medium break-words">
                          {getConceptLabel(concept.iri)}
                        </span>
                      ) : (
                        <span className="font-medium">
                          {t('SuccessDialog.UnknownConcept')}
                        </span>
                      )}
                      {concept.reason && (
                        <details className="mt-1 text-sm text-foreground-muted">
                          <summary className="w-fit cursor-pointer hover:underline">
                            {t('SuccessDialog.TechnicalDetails')}
                          </summary>
                          <div className="mt-1 space-y-1">
                            {concept.iri && (
                              <p className="break-all">
                                {t('SuccessDialog.ConceptIri')}: {concept.iri}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap break-words">
                              {concept.reason}
                            </p>
                          </div>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          {rejectionGroups.length > 1 && (
            <p className="text-xs text-foreground-muted">
              {t('SuccessDialog.RejectedConceptsOverlapNote')}
            </p>
          )}
        </section>
      )}

      <div className="gap-2 flex justify-end w-full">
        <GovButton
          size="m"
          type="outlined"
          color="primary"
          nativeType="button"
          onClick={onClose}
        >
          {t('SuccessDialog.CloseDialog')}
        </GovButton>
        <GovButton
          size="m"
          type="solid"
          color="primary"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/${slug}`}
        >
          {t('SuccessDialog.ViewOntology')}
        </GovButton>
      </div>
    </div>
  );
};
