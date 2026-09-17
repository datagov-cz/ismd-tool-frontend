import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { DiagramPendingEditEntry } from '@/api/generated';
import {
  Concept,
  getConceptIri,
  getConceptLabel,
  getDefinicniObor,
  getLabelFromConceptIri,
} from '../../model/concept';
import { getNadrazenaTrida, getOborHodnot } from '../../model/diagram';

const TYPE_ICONS: Record<string, string> = {
  TRIDA: 'card-heading',
  VLASTNOST: 'tag',
  VZTAH: 'diagram-3',
  KONCEPT: 'card-heading',
};

type EditDescription = {
  title: string;
  detail: string;
};

export const PendingEditsPanel = ({
  edits,
  concepts,
  open,
  onOpenChange,
}: {
  edits: DiagramPendingEditEntry[];
  concepts: Concept[];
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}) => {
  const t = useTranslations('DictionaryDiagram.PendingEdits');
  const [expandedIri, setExpandedIri] = useState<string | null>(null);

  const conceptName = (iri?: string) => {
    if (!iri) return t('UnknownConcept');

    const concept = concepts.find((item) => getConceptIri(item) === iri);
    return (
      (concept && getConceptLabel(concept)) ??
      getLabelFromConceptIri(iri) ??
      iri
    );
  };

  const conceptNames = (iris: string[]) =>
    `„${iris.map(conceptName).join('“, „')}“`;

  const describeEdit = (entry: DiagramPendingEditEntry): EditDescription[] => {
    const edit = entry.pendingEdit;
    if (!edit) {
      return [{ title: t('FallbackTitle'), detail: t('FallbackDetail') }];
    }

    const descriptions: EditDescription[] = [];
    if (edit.domain != null || edit.range != null) {
      const editedConcept = concepts.find(
        (concept) => getConceptIri(concept) === entry.iri,
      );
      const originalDomain = editedConcept && getDefinicniObor(editedConcept);
      const originalRange = editedConcept && getOborHodnot(editedConcept);
      const resultingDomain = edit.domain ?? originalDomain;
      const resultingRange = edit.range ?? originalRange;
      const directionWasReversed =
        originalDomain !== undefined &&
        originalRange !== undefined &&
        originalDomain === resultingRange &&
        originalRange === resultingDomain;

      if (entry.conceptType === 'VLASTNOST') {
        const originalParentName = conceptName(originalDomain);
        const resultingParentName = conceptName(resultingDomain);

        descriptions.push({
          title: t('PropertyTitle'),
          detail:
            originalDomain && originalDomain !== resultingDomain
              ? t('PropertyMoved', {
                  from: originalParentName,
                  to: resultingParentName,
                })
              : t('PropertyAssigned', { name: resultingParentName }),
        });
      } else {
        descriptions.push({
          title: t(
            directionWasReversed
              ? 'RelationshipDirectionTitle'
              : 'RelationshipPlacementTitle',
          ),
          detail: t('RelationshipResult', {
            change: t(
              directionWasReversed
                ? 'RelationshipReversed'
                : 'RelationshipChanged',
            ),
            domain: conceptName(resultingDomain),
            range: conceptName(resultingRange),
          }),
        });
      }
    }
    if (edit.broaderConcept != null) {
      const editedConcept = concepts.find(
        (concept) => getConceptIri(concept) === entry.iri,
      );
      const originalParents = editedConcept
        ? getNadrazenaTrida(editedConcept)
        : [];
      const resultingParents = edit.broaderConcept;
      const addedParents = resultingParents.filter(
        (iri) => !originalParents.includes(iri),
      );
      const removedParents = originalParents.filter(
        (iri) => !resultingParents.includes(iri),
      );
      const details = [
        removedParents.length > 0
          ? t('HierarchyRemoved', {
              count: removedParents.length,
              names: conceptNames(removedParents),
            })
          : undefined,
        addedParents.length > 0
          ? t('HierarchyAdded', {
              count: addedParents.length,
              names: conceptNames(addedParents),
            })
          : undefined,
      ].filter((detail): detail is string => detail !== undefined);

      if (details.length > 0) {
        descriptions.push({
          title: t('HierarchyTitle'),
          detail: t('HierarchyResult', { details: details.join(' ') }),
        });
      }
    }
    if (edit.exactMatch != null) {
      descriptions.push({
        title: t('EquivalentTitle'),
        detail: t('EquivalentDetail'),
      });
    }
    if (edit.convertToHierarchy != null) {
      descriptions.push({
        title: t('ConvertTitle'),
        detail: t('ConvertDetail'),
      });
    }

    return descriptions;
  };

  if (edits.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-status-warning-400 bg-status-warning-100 shadow-subtle">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between bg-status-warning-400 px-3 py-2 text-left text-sm font-bold text-black"
      >
        <span className="flex items-center gap-2">
          <GovIcon name="info-square" size="s" />
          {t('Title', { count: edits.length })}
        </span>
        <GovIcon
          name={open ? 'chevron-up' : 'chevron-down'}
          size="s"
          color="black"
        />
      </button>

      {open && (
        <div className="flex flex-col gap-2 py-3 px-2">
          <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
            {edits.map((entry, index) => {
              const id = entry.iri ?? entry.slug ?? String(index);
              const expanded = expandedIri === id;
              const descriptions = describeEdit(entry);

              return (
                <article
                  key={id}
                  className="rounded-sm border border-status-warning-400 bg-white px-3 py-2"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      descriptions.length > 0 &&
                      setExpandedIri(expanded ? null : id)
                    }
                    className="w-full text-left"
                  >
                    <span className="flex min-w-0 items-start gap-2">
                      <GovIcon
                        name={TYPE_ICONS[entry.conceptType ?? 'KONCEPT']}
                        size="m"
                        color="primary"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold leading-tight text-blue-primary">
                          {entry.label?.cs ?? entry.slug ?? entry.iri}
                        </span>
                        <span className="text-xs text-card-description font-semibold">
                          {t(`Types.${entry.conceptType ?? 'KONCEPT'}`)}
                          {entry.stale ? t('StaleSuffix') : ''}
                        </span>
                      </span>
                    </span>

                    {descriptions.length > 0 && (
                      <span className="mt-2 ml-7 flex items-start justify-between gap-2 border-t border-border-grey pt-2">
                        <span className="font-bold leading-tight text-dark-primary text-sm">
                          {descriptions.map(({ title }) => title).join(' ')}
                        </span>
                        <GovIcon
                          name={expanded ? 'chevron-up' : 'chevron-down'}
                          size="s"
                          className="shrink-0"
                        />
                      </span>
                    )}
                  </button>

                  {expanded && descriptions.length > 0 && (
                    <ul className="mt-2 ml-7 flex flex-col gap-2 text-sm text-dark-primary">
                      {descriptions.map(({ title, detail }) => (
                        <li key={title}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
