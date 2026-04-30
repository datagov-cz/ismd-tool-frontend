'use client';

import {
  ConceptDetailModel,
  useGetCurrentUser,
  useGetNkdOntologyDetail,
} from '@/api/generated';
import { OntologyLayout } from '@/components/dictionaryDetail/OntologyLayout';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { useVisitedOntology } from '@/hooks/useVisitedOnotology';

interface Props {
  slug: string;
}

export const DictionaryContentNKD = ({ slug }: Props) => {
  const ontology = useGetNkdOntologyDetail({ iri: slug });
  const { data } = useGetCurrentUser();
  const user = data?.data;
  const ontologyDetail = ontology.data?.data?.ontologyDetail;

  const sortedParentTerms = ontologyDetail?.pojmy
    ?.filter((item) => item.název)
    ?.filter((item) => !item['definiční-obor'])
    .sort((a, b) => (a.název?.cs ?? '').localeCompare(b.název?.cs ?? ''));

  useVisitedOntology(
    ontologyDetail
      ? { slug, source: 'NKD', iri: slug, name: ontologyDetail.název?.cs }
      : null,
    user?.userId,
  );

  if (ontology.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );
  if (!ontologyDetail) return null;

  const nkdSlug = (concept: ConceptDetailModel) => `/nkd?iri=${concept.iri}`;

  return (
    <OntologyLayout
      title={ontologyDetail.název?.cs ?? ''}
      popis={ontologyDetail.popis}
      sortedParentTerms={sortedParentTerms ?? []}
      getConceptSlug={nkdSlug}
      getRelatedTerms={(parent) =>
        ontologyDetail.pojmy
          ?.filter((item) => item.iri && item['definiční-obor'] === parent.iri)
          .map((item) => ({ data: item, slug: `/nkd?iri=${item.iri}` })) || []
      }
    />
  );
};
