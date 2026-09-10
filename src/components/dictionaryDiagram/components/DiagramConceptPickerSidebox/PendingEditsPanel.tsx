import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';

import { DiagramPendingEditEntry } from '@/api/generated';
import { Concept, getConceptIri, getDefinicniObor } from '../../model/concept';
import { getNadrazenaTrida, getOborHodnot } from '../../model/diagram';

const TYPE_LABELS: Record<string, string> = {
  TRIDA: 'Třída / Objekt',
  VLASTNOST: 'Vlastnost',
  VZTAH: 'Vztah',
  KONCEPT: 'Pojem',
};

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

const conceptName = (iri: string | undefined, concepts: Concept[]) => {
  if (!iri) return 'neurčený pojem';

  const concept = concepts.find((item) => getConceptIri(item) === iri);
  const metadataLabel =
    concept?.metadata && 'label' in concept.metadata
      ? concept.metadata.label
      : undefined;
  return (
    concept?.název?.cs ??
    metadataLabel ??
    decodeURIComponent(iri.split('/').pop() ?? iri).replaceAll('-', ' ')
  );
};

const conceptNames = (iris: string[], concepts: Concept[]) =>
  `„${iris.map((iri) => conceptName(iri, concepts)).join('“, „')}“`;

const describeEdit = (
  entry: DiagramPendingEditEntry,
  concepts: Concept[],
): EditDescription[] => {
  const edit = entry.pendingEdit;
  if (!edit) {
    return [
      {
        title: 'Změna pojmu čeká na promítnutí do slovníku.',
        detail:
          'Podrobnosti změny nejsou k dispozici. Změna bude použita při promítnutí diagramu.',
      },
    ];
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
      const originalParentName = conceptName(originalDomain, concepts);
      const resultingParentName = conceptName(resultingDomain, concepts);

      descriptions.push({
        title: 'Změna zařazení vlastnosti',
        detail:
          originalDomain && originalDomain !== resultingDomain
            ? `Vlastnost byla v diagramu přesunuta z pojmu „${originalParentName}“ pod pojem „${resultingParentName}“. Po promítnutí se nové zařazení projeví ve slovníku.`
            : `Po promítnutí bude vlastnost zařazena pod pojem „${resultingParentName}“.`,
      });
    } else {
      descriptions.push({
        title: directionWasReversed
          ? 'Změna směru vztahu'
          : 'Změna zařazení vztahu',
        detail: `${
          directionWasReversed
            ? 'Směr vztahu byl v diagramu otočen.'
            : 'Začátek nebo konec vztahu byl v diagramu změněn.'
        } Po promítnutí povede vztah z pojmu „${conceptName(
          resultingDomain,
          concepts,
        )}“ na pojem „${conceptName(resultingRange, concepts)}“.`,
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
        ? `Byla odstraněna hierarchická vazba na ${
            removedParents.length === 1 ? 'nadřazený pojem' : 'nadřazené pojmy'
          } ${conceptNames(removedParents, concepts)}.`
        : undefined,
      addedParents.length > 0
        ? `Byla přidána hierarchická vazba na ${
            addedParents.length === 1 ? 'nadřazený pojem' : 'nadřazené pojmy'
          } ${conceptNames(addedParents, concepts)}.`
        : undefined,
    ].filter((detail): detail is string => detail !== undefined);

    if (details.length > 0) {
      descriptions.push({
        title: 'Změna hierarchické vazby',
        detail: `${details.join(' ')} Po promítnutí se tato změna projeví ve slovníku.`,
      });
    }
  }
  if (edit.exactMatch != null) {
    descriptions.push({
      title: 'Změna ekvivalentní vazby',
      detail:
        'Ekvivalentní vazba pojmu byla v diagramu změněna. Po promítnutí se změna projeví ve slovníku.',
    });
  }
  if (edit.convertToHierarchy != null) {
    descriptions.push({
      title: 'Změna vztahu na hierarchickou vazbu',
      detail:
        'Vztah byl v diagramu převeden na hierarchickou vazbu. Po promítnutí se původní vztah nahradí hierarchií.',
    });
  }

  return descriptions;
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
  const [expandedIri, setExpandedIri] = useState<string | null>(null);

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
          Změny k promítnutí [{edits.length}]
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
              const descriptions = describeEdit(entry, concepts);

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
                          {TYPE_LABELS[entry.conceptType ?? 'KONCEPT']}
                          {entry.stale ? ' · Zastaralá změna' : ''}
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
