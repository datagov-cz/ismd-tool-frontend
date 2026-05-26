'use client';

import {
  ConceptDetailModel,
  useGetCurrentUser,
  useGetNkdOntologyDetail,
} from '@/api/generated';
import { ControlPanelNKD } from '@/components/dictionaryDetail/ControlPanelNKD';
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

  useVisitedOntology(
    ontologyDetail ? { slug, source: 'NKD' } : null,
    user?.userId,
  );
  console.log(ontology.data, 'test');
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
      source="NKD"
      title={ontologyDetail.název?.cs ?? ''}
      popis={ontologyDetail.popis}
      concepts={ontologyDetail.pojmy}
      conceptCount={ontologyDetail.pojmy?.length}
      getConceptSlug={nkdSlug}
      getRelatedTerms={(parent) =>
        ontologyDetail.pojmy
          ?.filter((item) => item.iri && item['definiční-obor'] === parent.iri)
          ?.map((item) => ({ data: item, slug: `/nkd?iri=${item.iri}` })) || []
      }
    >
      <ControlPanelNKD ontologyIRI={ontologyDetail.iri || ''} />
    </OntologyLayout>
  );
};
