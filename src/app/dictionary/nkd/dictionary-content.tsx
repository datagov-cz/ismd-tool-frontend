'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel, useGetNkdOntologyDetail } from '@/api/generated';
import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { ControlPanelNKD } from '@/components/dictionaryDetail/ControlPanelNKD';
import { OntologyLayout } from '@/components/dictionaryDetail/OntologyLayout';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { useVisitedOntology } from '@/hooks/useVisitedOnotology';

interface Props {
  slug: string;
}

export const DictionaryContentNKD = ({ slug }: Props) => {
  const ontology = useGetNkdOntologyDetail({ iri: slug });
  const { user } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations('DictionaryDetail');

  const ontologyDetail = ontology.data?.data?.ontologyDetail;

  useVisitedOntology(
    ontologyDetail ? { slug, source: 'NKD' } : null,
    user?.userId,
  );
  if (ontology.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );
  if (!ontologyDetail)
    return (
      <div className="w-full h-full flex items-center justify-center flex-1 flex-col gap-2">
        <h1 className="text-2xl">{t('NotFound')}</h1>
        <GovButton
          type="solid"
          color="primary"
          onGovClick={() => router.back()}
        >
          {t('Back')}
        </GovButton>
      </div>
    );

  const nkdSlug = (concept: ConceptDetailModel) => `/nkd?iri=${concept.iri}`;

  return (
    <OntologyLayout
      source="NKD"
      title={ontologyDetail.název}
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
