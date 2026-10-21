import { useQueries } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { getGetOntologyDetailQueryOptions } from '@/api/generated';
import { CLASS_TYPE } from '@/components/conceptForm/classType';
import type {
  ConceptSuggestion,
  ConceptSuggestionKind,
} from '@/lib/conceptSuggestion/types';

type LanguagePath =
  | 'nameModel.name'
  | 'definitionModel.definition'
  | 'descriptionModel.description';

type RangeRef = { iri: string; label: string; id?: number };

export type FieldCard = { label: string; description: string } & (
  | { key: 'name' | 'definition' | 'description'; path: LanguagePath }
  | { key: 'classType'; path: 'type'; value: string }
  | { key: 'range'; path: 'range'; value: RangeRef }
);

export type FieldKey = FieldCard['key'];

type Input = {
  kind: ConceptSuggestionKind;
  suggestion: ConceptSuggestion;
  knownSlugs: string[];
};

const useKnownConcepts = (slugs: string[], enabled: boolean) =>
  useQueries({
    queries: slugs.map((slug) =>
      getGetOntologyDetailQueryOptions(slug, { query: { enabled } }),
    ),
    combine: (results) => ({
      concepts: results.flatMap(
        (result) => result.data?.data?.ontologyMetadata?.concepts ?? [],
      ),
      isLoading: results.some((result) => result.isLoading),
    }),
  });

export const useSuggestionFieldCards = ({
  kind,
  suggestion,
  knownSlugs,
}: Input) => {
  const t = useTranslations('CreateConcept');
  const known = useKnownConcepts(knownSlugs, kind === 'VZTAH');

  const targetIri = kind === 'VZTAH' ? suggestion.targetIri : undefined;
  const rangeConcept = targetIri
    ? known.concepts.find((concept) => concept.conceptIri === targetIri)
    : undefined;

  const cards: FieldCard[] = [
    {
      key: 'name',
      label: t('CommonConceptFields.Labels.Name'),
      description: suggestion.name,
      path: 'nameModel.name',
    },
  ];
  if (
    kind === 'TRIDA' &&
    (suggestion.classType === 'SUBJECT' || suggestion.classType === 'OBJECT')
  ) {
    const isSubject = suggestion.classType === 'SUBJECT';
    cards.push({
      key: 'classType',
      label: t('ClassCreateFields.Labels.ClassType'),
      description: t(
        isSubject
          ? 'ClassCreateFields.Options.ClassType.SubjectOfLawType'
          : 'ClassCreateFields.Options.ClassType.ObjectOfLawType',
      ),
      path: 'type',
      value: isSubject ? CLASS_TYPE.subject : CLASS_TYPE.object,
    });
  }
  if (suggestion.definition) {
    cards.push({
      key: 'definition',
      label: t('CommonConceptFields.Labels.Definition'),
      description: suggestion.definition,
      path: 'definitionModel.definition',
    });
  }
  if (suggestion.explanation) {
    cards.push({
      key: 'description',
      label: t('CommonConceptFields.Labels.Description'),
      description: suggestion.explanation,
      path: 'descriptionModel.description',
    });
  }
  if (rangeConcept?.conceptIri && rangeConcept.conceptName) {
    cards.push({
      key: 'range',
      label: t('TypesSection.RelationRangeLabel'),
      description: rangeConcept.conceptName,
      path: 'range',
      value: {
        iri: rangeConcept.conceptIri,
        label: rangeConcept.conceptName,
        id: rangeConcept.id,
      },
    });
  }

  const missingTargetIri =
    targetIri && !rangeConcept && !known.isLoading ? targetIri : undefined;

  return { cards, missingTargetIri };
};
