import { useCallback, useMemo, useRef, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';

import { SearchType, useSearch } from '@/api/generated';
import { Concept, getConceptId } from '../../model/concept';

import { DiagramPickerConcept } from './DiagramConceptPicker';
import { FilterCheckbox } from './FilterCheckbox';

export const ConceptPickerSearch = ({
  conceptsInDiagram,
  activeConceptIds,
  selectedConceptIds,
  onActiveConceptClick,
}: {
  conceptsInDiagram: Concept[];
  activeConceptIds: Set<string>;
  selectedConceptIds: Set<string>;
  onActiveConceptClick: (_conceptId: string) => void;
}) => {
  const [selectedKind, setSelectedKind] = useState<SearchType | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data } = useSearch(
    {
      q: query,
      type: selectedKind ?? 'CONCEPT',
      source: 'ISMD',
      limit: 20,
    },
    {
      query: {
        enabled: debouncedQuery.trim().length > 3,
      },
    },
  );

  const handleInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(value), 300);
  }, []);

  const toggleKind = (kind: SearchType) =>
    setSelectedKind((prev) => (prev === kind ? null : kind));

  const resultConcepts = useMemo(() => {
    const searchConcepts = (data?.data?.results ?? []).map(
      (item): Concept => ({
        iri: item.iri,
        slug: item.slug,
        název: item.label ? { cs: item.label } : undefined,
        metadata: item,
      }),
    );
    const conceptsById = new Map(
      [...conceptsInDiagram, ...searchConcepts].map((concept) => [
        getConceptId(concept),
        concept,
      ]),
    );

    return Array.from(conceptsById.values()).sort((a, b) => {
      const activeDifference =
        Number(activeConceptIds.has(getConceptId(b))) -
        Number(activeConceptIds.has(getConceptId(a)));
      if (activeDifference) return activeDifference;

      return (
        Number(selectedConceptIds.has(getConceptId(b))) -
        Number(selectedConceptIds.has(getConceptId(a)))
      );
    });
  }, [
    activeConceptIds,
    conceptsInDiagram,
    data?.data?.results,
    selectedConceptIds,
  ]);

  return (
    <div>
      <GovFormGroup>
        <GovFormInput
          placeholder="Hledat pojem v ostatních slovnících"
          size="s"
          value={query}
          onGovInput={handleInput}
        >
          <GovIcon name="search" size="s" slot="icon-start" />
        </GovFormInput>
      </GovFormGroup>

      <div className="flex gap-4 pt-2">
        <FilterCheckbox
          label="Třídy"
          checked={selectedKind === 'CLASS'}
          onToggle={() => toggleKind('CLASS')}
        />
        <FilterCheckbox
          label="Vlastnosti"
          checked={selectedKind === 'PROPERTY'}
          onToggle={() => toggleKind('PROPERTY')}
        />
        <FilterCheckbox
          label="Vztahy"
          checked={selectedKind === 'RELATIONSHIP'}
          onToggle={() => toggleKind('RELATIONSHIP')}
        />
      </div>
      {resultConcepts.some((concept) =>
        selectedConceptIds.has(getConceptId(concept)),
      ) && (
        <div className="z-10 flex flex-col gap-1.5 border-b mt-2 border-border-grey bg-white pb-1.5">
          {resultConcepts
            .filter((concept) => selectedConceptIds.has(getConceptId(concept)))
            .map((concept, index) => (
              <DiagramPickerConcept
                key={`${getConceptId(concept)}-selected-${index}`}
                concept={concept}
                active={activeConceptIds.has(getConceptId(concept))}
                selected
                onActiveClick={onActiveConceptClick}
              />
            ))}
        </div>
      )}
      <div className="flex flex-col gap-1.5 pt-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-1 bg-white">
        {resultConcepts
          .filter((concept) => !selectedConceptIds.has(getConceptId(concept)))
          .map((concept, index) => (
            <DiagramPickerConcept
              key={`${getConceptId(concept)}-${index}`}
              concept={concept}
              active={activeConceptIds.has(getConceptId(concept))}
              onActiveClick={onActiveConceptClick}
            />
          ))}

        {data?.data?.returnedCount === 0 && (
          <span className="text-xs text-card-description py-2">
            Žádný pojem neodpovídá filtru.
          </span>
        )}
      </div>
    </div>
  );
};
