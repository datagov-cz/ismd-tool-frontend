'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel, useGetOntologyDetail } from '@/api/generated';
import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
import { OntologyLayout } from '@/components/dictionaryDetail/OntologyLayout';
import { ValidationSidebox } from '@/components/dictionaryDetail/validation/ValidationSidebox';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { useVisitedOntology } from '@/hooks/useVisitedOnotology';

interface Props {
  slug: string;
}

export const DictionaryContent = ({ slug }: Props) => {
  const t = useTranslations('DictionaryDetail');
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));
  const { user } = useCurrentUser();
  const ontologyDetail = ontology.data?.data?.ontologyDetail;
  const ontologyMetadata = ontology.data?.data?.ontologyMetadata;
  const router = useRouter();
  useVisitedOntology(
    {
      slug,
      source: 'ISMD',
    },
    user?.userId,
  );

  if (ontology.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );

  if (!ontologyDetail || !ontologyMetadata)
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

  const getRelatedTerms = (parentTerm: ConceptDetailModel) => {
    const parentLocalName = parentTerm.iri?.split('/').pop();

    return (
      ontologyDetail?.pojmy
        ?.filter((item) => {
          if (!item['definiční-obor']) return false;
          if (item['definiční-obor'] === parentTerm.iri) return true;
          const domainLocalName = item['definiční-obor'].split('/').pop();
          return domainLocalName === parentLocalName;
        })
        .map((item) => ({
          data: item,
          slug:
            ontologyMetadata?.concepts?.find(
              (meta) => meta.conceptIri === item.iri,
            )?.slug || '',
        })) || []
    );
  };

  const getConceptSlug = (concept: ConceptDetailModel) =>
    ontologyMetadata.concepts?.find((m) => m.conceptIri === concept.iri)
      ?.slug || '';

  return (
    <OntologyLayout
      source="ISMD"
      title={ontologyDetail.název}
      popis={ontologyDetail.popis}
      fallbackPopis={ontologyMetadata.popis}
      statusLabel={
        ontologyMetadata.isPublished
          ? t('Main.DictionaryStatus.Published')
          : t('Main.DictionaryStatus.Draft')
      }
      concepts={ontologyDetail.pojmy}
      getConceptSlug={getConceptSlug}
      getRelatedTerms={getRelatedTerms}
      conceptCount={ontologyDetail.pojmy?.length}
      metaData={ontologyMetadata}
      slug={slug}
    >
      <ControlPanel
        ontologyID={ontologyMetadata?.id || 0}
        name={ontologyDetail.název?.cs || ''}
        user={ontologyMetadata.user}
        commentsCount={ontologyMetadata.comments?.length}
        slug={slug}
        updatedAt={
          ontologyDetail['časový-okamžik-poslední-změny'] ||
          ontologyMetadata.updatedAt
        }
        iri={ontologyDetail.iri}
      />
      {user?.userId && (
        <CommentSidebox
          ontologyIRI={ontologyDetail.iri}
          comments={ontologyMetadata.comments}
          refetch={() => ontology.refetch()}
          userId={user.userId}
        />
      )}
      <ValidationSidebox />
    </OntologyLayout>
  );
};
