import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
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
} from '../../model/concept';
import { onConceptDragStart } from '../../model/conceptDrag';

import { ConceptPickerSearch } from './ConceptPickerSearch';
import { FilterCheckbox } from './FilterCheckbox';
import { PendingEditsPanel } from './PendingEditsPanel';

const PickerTabs = ({
  items,
}: {
  items: { label: string; children: ReactNode }[];
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId().replaceAll(':', '');

  const selectTab = (index: number, focus = false) => {
    setActiveTab(index);
    if (focus) requestAnimationFrame(() => buttonRefs.current[index]?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).getAttribute('role') !== 'tab') return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowRight'
            ? (activeTab + 1) % items.length
            : (activeTab - 1 + items.length) % items.length;
    selectTab(nextIndex, true);
  };

  return (
    <div
      className="gov-tabs hydrated"
      data-size="m"
      {...({ color: 'primary', type: 'text' } as Record<string, string>)}
      onKeyDown={handleKeyDown}
    >
      <div className="gov-tabs__tabs" role="tablist">
        <ul className="gov-tabs__list" role="presentation">
          {items.map((item, index) => {
            const selected = activeTab === index;
            const triggerId = `${baseId}-trigger-${index}`;
            const contentId = `${baseId}-content-${index}`;

            return (
              <li
                className="gov-tabs__item"
                role="presentation"
                key={triggerId}
              >
                <button
                  ref={(button) => {
                    buttonRefs.current[index] = button;
                  }}
                  className="gov-tabs__btn"
                  id={triggerId}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={contentId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(index)}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {items.map((item, index) => {
        const selected = activeTab === index;
        const triggerId = `${baseId}-trigger-${index}`;
        const contentId = `${baseId}-content-${index}`;

        return (
          <div className="gov-tabs-item hydrated" key={contentId}>
            <div
              className="gov-tabs-item__inner"
              role="tabpanel"
              id={contentId}
              hidden={!selected}
              aria-labelledby={triggerId}
              aria-hidden={!selected}
            >
              {item.children}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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

  const setKindEnabled = (kind: ConceptKind, checked: boolean) =>
    setKinds((prev) =>
      prev[kind] === checked ? prev : { ...prev, [kind]: checked },
    );

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
        <PickerTabs
          items={[
            {
              label: t('ThisDictionary'),
              children: (
                <div>
                  <GovFormGroup>
                    <GovFormInput
                      placeholder={t('SearchThis')}
                      size="s"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      iconStart={<GovIcon name="search" size="s" />}
                    ></GovFormInput>
                  </GovFormGroup>

                  <div className="flex gap-4 pt-2">
                    <FilterCheckbox
                      label={t('Classes')}
                      checked={kinds.trida}
                      onToggle={(checked) => setKindEnabled('trida', checked)}
                    />
                    <FilterCheckbox
                      label={t('Properties')}
                      checked={kinds.vlastnost}
                      onToggle={(checked) =>
                        setKindEnabled('vlastnost', checked)
                      }
                    />
                    <FilterCheckbox
                      label={t('Relationships')}
                      checked={kinds.vztah}
                      onToggle={(checked) => setKindEnabled('vztah', checked)}
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
                          selected={selectedConceptIds.has(
                            getConceptId(concept),
                          )}
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
                                  active={activeConceptIds.has(
                                    getConceptId(child),
                                  )}
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
                </div>
              ),
            },
            {
              label: t('OtherDictionaries'),
              children: (
                <div>
                  <ConceptPickerSearch
                    conceptsInDiagram={otherOntologyConceptsInDiagram}
                    activeConceptIds={activeConceptIds}
                    selectedConceptIds={selectedConceptIds}
                    onActiveConceptClick={onActiveConceptClick}
                  />
                </div>
              ),
            },
          ]}
        />
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
  const t = useTranslations('DictionaryDiagram.Node');

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
            : 'border-gray-border/50 bg-white',
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
            {t(
              kind === 'trida'
                ? 'Class'
                : kind === 'vlastnost'
                  ? 'Property'
                  : 'Relationship',
            )}
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
