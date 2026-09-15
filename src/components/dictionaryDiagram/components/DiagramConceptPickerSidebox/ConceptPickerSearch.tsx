import { useMemo, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useDebounceValue } from 'usehooks-ts';

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
  const t = useTranslations('DictionaryDiagram.Picker');
  const [selectedKind, setSelectedKind] = useState<SearchType | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 300);

  const { data } = useSearch(
    {
      q: debouncedQuery,
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
          placeholder={t('SearchOther')}
          size="s"
          value={query}
          onGovInput={(event) => setQuery(event.detail.value)}
        >
          <GovIcon name="search" size="s" slot="icon-start" />
        </GovFormInput>
      </GovFormGroup>

      <div className="flex gap-4 pt-2">
        <FilterCheckbox
          label={t('Classes')}
          checked={selectedKind === 'CLASS'}
          onToggle={(checked) => setSelectedKind(checked ? 'CLASS' : null)}
        />
        <FilterCheckbox
          label={t('Properties')}
          checked={selectedKind === 'PROPERTY'}
          onToggle={(checked) => setSelectedKind(checked ? 'PROPERTY' : null)}
        />
        <FilterCheckbox
          label={t('Relationships')}
          checked={selectedKind === 'RELATIONSHIP'}
          onToggle={(checked) =>
            setSelectedKind(checked ? 'RELATIONSHIP' : null)
          }
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
            {t('NoMatches')}
          </span>
        )}
      </div>
    </div>
  );
};
