'use client';

import { useTranslations } from 'next-intl';

import { ConceptDetailModel, useGetNkdOntologyDetail } from '@/api/generated';
import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { ControlPanelNKD } from '@/components/dictionaryDetail/ControlPanelNKD';
import { OntologyLayout } from '@/components/dictionaryDetail/OntologyLayout';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { PageLoader } from '@/components/shared/PageLoader';
import { useVisitedOntology } from '@/hooks/useVisitedOnotology';

interface Props {
  slug: string;
}

export const DictionaryContentNKD = ({ slug }: Props) => {
  const ontology = useGetNkdOntologyDetail({ iri: slug });
  const { user } = useCurrentUser();
  const t = useTranslations('DictionaryDetail');

  const ontologyDetail = ontology.data?.data?.ontologyDetail;

  useVisitedOntology(
    ontologyDetail ? { slug, source: 'NKD' } : null,
    user?.userId,
  );

  if (ontology.isPending) {
    return <PageLoader />;
  }

  if (!ontologyDetail) {
    return <NotFoundState title={t('NotFound')} backLabel={t('Back')} />;
  }

  const nkdSlug = (concept: ConceptDetailModel) => `/nkd?iri=${concept.iri}`;

  return (
    <OntologyLayout
      source="NKD"
      title={ontologyDetail.název}
      popis={ontologyDetail.popis}
      concepts={ontologyDetail.pojmy}
      statusLabel={t('Main.DictionaryStatus.Published')}
      conceptCount={ontologyDetail.pojmy?.length}
      isPublished={true}
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
