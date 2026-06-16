'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useGetConceptDetail } from '@/api/generated';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { OtherOntologyConcepts } from '@/components/conceptDetail/OtherOntologyConcepts';
import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { extractOntologyFromUrl } from '@/utils/conceptDetailUtils';

interface Props {
  slug: string;
}

export const ConceptContent = ({ slug }: Props) => {
  const concept = useGetConceptDetail(slug);
  const { user } = useCurrentUser();
  const t = useTranslations('ConceptDetail.Main.ControlPanel');

  const router = useRouter();

  if (concept.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );

  if (!concept.data)
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

  const conceptDetail = concept.data.data?.conceptDetail;
  const conceptMetadata = concept.data.data?.conceptMetadata;
  if (!conceptDetail || !conceptMetadata) return null;

  const ontology = extractOntologyFromUrl(conceptMetadata.graphName || '');
  const conceptType = conceptMetadata.conceptType as
    | 'TRIDA'
    | 'VLASTNOST'
    | 'VZTAH'
    | undefined;

  return (
    <>
      <ConceptHeader
        ontology={ontology}
        conceptDetail={conceptDetail}
        conceptId={conceptMetadata.id}
        isPublished={conceptMetadata.isPublished}
        commentsCount={conceptMetadata.comments?.length ?? 0}
        loggedIn={!!user?.userId}
        owner={conceptMetadata.user?.userId === user?.userId}
        source={'ISMD'}
        slug={slug}
      />

      <ConceptLayout
        conceptDetail={conceptDetail}
        conceptType={conceptType}
        source="ISMD"
        slug={slug}
        isOwnerLoggedIn={conceptMetadata.user?.userId === user?.userId}
      >
        <OtherOntologyConcepts
          ontology={conceptMetadata.graphName || ''}
          source="ISMD"
        />
      </ConceptLayout>

      {user?.userId && (
        <CommentSidebox
          conceptIRI={conceptDetail.iri}
          comments={conceptMetadata.comments}
          refetch={() => concept.refetch()}
          userId={user?.userId}
        />
      )}
    </>
  );
};
