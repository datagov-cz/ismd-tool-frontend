import { useMemo, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
  GovTabs,
  GovTabsItem,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { DiagramPendingEditEntry } from '@/api/generated';
import {
  type Concept,
  type ConceptKind,
  getConceptId,
  getConceptKind,
  KIND_ICON,
  KIND_LABEL,
} from '../../model/concept';
import { onConceptDragStart } from '../../model/conceptDrag';

import { ConceptPickerSearch } from './ConceptPickerSearch';
import { FilterCheckbox } from './FilterCheckbox';
import { PendingEditsPanel } from './PendingEditsPanel';

export const DiagramConceptPicker = ({
  concepts,
  otherOntologyConceptsInDiagram,
  activeConceptIds,
  selectedConceptIds,
  diagramParentByConceptId,
  onActiveConceptClick,
  pendingEdits,
  pendingEditsOpen,
  onPendingEditsOpenChange,
}: {
  concepts: Concept[];
  otherOntologyConceptsInDiagram: Concept[];
  activeConceptIds: Set<string>;
  selectedConceptIds: Set<string>;
  diagramParentByConceptId: Map<string, string>;
  onActiveConceptClick: (_conceptId: string) => void;
  pendingEdits: DiagramPendingEditEntry[];
  pendingEditsOpen: boolean;
  onPendingEditsOpenChange: (_open: boolean) => void;
}) => {
  const t = useTranslations('DictionaryDiagram.Picker');
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<Record<ConceptKind, boolean>>({
    trida: false,
    vlastnost: false,
    vztah: false,
  });

  const toggleKind = (kind: ConceptKind) =>
    setKinds((prev) => ({ ...prev, [kind]: !prev[kind] }));

  const filteredHierarchy = useMemo(() => {
    const query = search.trim().toLowerCase();
    const noKindFilter = !kinds.trida && !kinds.vlastnost && !kinds.vztah;
    const matchesDomain = (concept: Concept, parent: Concept) => {
      const diagramParent = diagramParentByConceptId.get(getConceptId(concept));
      if (diagramParent) {
        return diagramParent === getConceptId(parent);
      }

      if (getConceptKind(concept) === 'vlastnost') {
        return false;
      }

      const domain = concept['definiční-obor'];
      if (!domain || !parent.iri) return false;
      if (domain === parent.iri) return true;

      return domain.split('/').pop() === parent.iri.split('/').pop();
    };

    const matchesKind = (concept: Concept) =>
      noKindFilter || kinds[getConceptKind(concept)];
    const matchesName = (concept: Concept) =>
      !query || !!concept.název?.cs?.toLowerCase().includes(query);

    const parents = concepts
      .filter(
        (concept) => !concepts.some((parent) => matchesDomain(concept, parent)),
      )
      .sort((a, b) =>
        (a.název?.cs ?? '').localeCompare(b.název?.cs ?? '', 'cs'),
      );

    return parents
      .map((concept) => {
        const children = concepts
          .filter((candidate) => matchesDomain(candidate, concept))
          .filter(matchesKind)
          .sort((a, b) =>
            (a.název?.cs ?? '').localeCompare(b.název?.cs ?? '', 'cs'),
          );
        const parentMatches = matchesKind(concept) && matchesName(concept);
        const matchingChildren = children.filter(matchesName);

        return {
          concept,
          children: parentMatches ? children : matchingChildren,
          showParent: parentMatches || matchingChildren.length > 0,
        };
      })
      .filter(({ showParent }) => showParent)
      .sort(
        (a, b) =>
          Number(
            selectedConceptIds.has(getConceptId(b.concept)) ||
              b.children.some((child) =>
                selectedConceptIds.has(getConceptId(child)),
              ),
          ) -
          Number(
            selectedConceptIds.has(getConceptId(a.concept)) ||
              a.children.some((child) =>
                selectedConceptIds.has(getConceptId(child)),
              ),
          ),
      );
  }, [concepts, search, kinds, selectedConceptIds, diagramParentByConceptId]);

  return (
    <aside className="flex-300 flex min-h-0 flex-col gap-2">
      <PendingEditsPanel
        edits={pendingEdits}
        concepts={concepts}
        open={pendingEditsOpen}
        onOpenChange={onPendingEditsOpenChange}
      />
      <div className="min-h-0 bg-white shadow-subtle rounded-md py-2 px-4">
        <GovTabs>
          <GovTabsItem label={t('ThisDictionary')}>
            <GovFormGroup>
              <GovFormInput
                placeholder={t('SearchThis')}
                size="s"
                value={search}
                onGovInput={(e) => setSearch(e.detail.value)}
              >
                <GovIcon name="search" size="s" slot="icon-start" />
              </GovFormInput>
            </GovFormGroup>

            <div className="flex gap-4 pt-2">
              <FilterCheckbox
                label={t('Classes')}
                checked={kinds.trida}
                onToggle={() => toggleKind('trida')}
              />
              <FilterCheckbox
                label={t('Properties')}
                checked={kinds.vlastnost}
                onToggle={() => toggleKind('vlastnost')}
              />
              <FilterCheckbox
                label={t('Relationships')}
                checked={kinds.vztah}
                onToggle={() => toggleKind('vztah')}
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
              {filteredHierarchy.map(({ concept, children }, index) => (
                <div
                  className="flex flex-col gap-1.5"
                  key={`${getConceptId(concept)}-${index}`}
                >
                  <DiagramPickerConcept
                    concept={concept}
                    active={activeConceptIds.has(getConceptId(concept))}
                    selected={selectedConceptIds.has(getConceptId(concept))}
                    onActiveClick={onActiveConceptClick}
                  />
                  {children.length > 0 && (
                    <div className="relative ml-3 flex flex-col gap-1.5 pl-3">
                      {children.map((child, childIndex) => (
                        <div
                          className="relative before:absolute before:-left-3 before:top-1/2 before:w-3 before:border-t before:border-blue-primary/30 after:absolute after:-left-3 after:-top-1.5 after:-bottom-1.5 after:border-l after:border-blue-primary/30 last:after:bottom-1/2"
                          key={`${getConceptId(child)}-${childIndex}`}
                        >
                          <DiagramPickerConcept
                            concept={child}
                            active={activeConceptIds.has(getConceptId(child))}
                            selected={selectedConceptIds.has(
                              getConceptId(child),
                            )}
                            onActiveClick={onActiveConceptClick}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredHierarchy.length === 0 && (
                <span className="text-xs text-card-description py-2">
                  {t('NoMatches')}
                </span>
              )}
            </div>
          </GovTabsItem>
          <GovTabsItem label={t('OtherDictionaries')}>
            <ConceptPickerSearch
              conceptsInDiagram={otherOntologyConceptsInDiagram}
              activeConceptIds={activeConceptIds}
              selectedConceptIds={selectedConceptIds}
              onActiveConceptClick={onActiveConceptClick}
            />
          </GovTabsItem>
        </GovTabs>
      </div>
    </aside>
  );
};

export const DiagramPickerConcept = ({
  concept,
  active,
  selected,
  onActiveClick,
}: {
  concept: Concept;
  active?: boolean;
  selected?: boolean;
  onActiveClick?: (_conceptId: string) => void;
}) => {
  const kind = getConceptKind(concept);

  const draggable = !active;

  return (
    <div
      draggable={draggable}
      onDragStart={
        draggable ? (e) => onConceptDragStart(e, concept) : undefined
      }
      onClick={
        active ? () => onActiveClick?.(getConceptId(concept)) : undefined
      }
      onKeyDown={
        active
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActiveClick?.(getConceptId(concept));
              }
            }
          : undefined
      }
      role={active ? 'button' : undefined}
      tabIndex={active ? 0 : undefined}
      className={clsx(
        'border rounded-sm py-1.5 px-2 flex justify-between items-center',
        draggable && 'cursor-grab active:cursor-grabbing',
        !active && !draggable && 'opacity-60',
        selected
          ? 'cursor-pointer border-blue-primary bg-primary-subtlest ring-1 ring-blue-primary'
          : active
            ? 'cursor-pointer bg-status-success-100 border-status-success-200'
            : 'border-border-grey bg-white',
      )}
    >
      <div className="flex items-center gap-1.5">
        <GovIcon name={KIND_ICON[kind]} size="m" color="primary" />
        <div className="flex flex-col gap-0.5">
          <span className="text-dark-blue-subtle font-medium text-sm leading-none">
            {concept.název?.cs ??
              (concept.metadata &&
                'label' in concept.metadata &&
                concept.metadata?.label)}
          </span>
          <span className="text-xs font-medium text-card-description leading-none">
            {KIND_LABEL[kind]}
          </span>
        </div>
      </div>
      {selected ? (
        <GovIcon name="check2-circle" size="l" color="primary" />
      ) : active ? (
        <GovIcon name="check2-circle" size="l" color="success" />
      ) : draggable ? (
        <GovIcon name="arrows-move" size="l" color="primary" />
      ) : null}
    </div>
  );
};
