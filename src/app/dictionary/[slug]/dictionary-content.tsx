'use client';

import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  OntologyDetailModel,
  OntologyMetadataModel,
  useGetCurrentUser,
  useGetOntologyDetail,
} from '@/api/generated';
import { CreateConceptSideBox } from '@/components/conceptCreate/CreateConceptSidebox';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
import { EditSideBox } from '@/components/dictionaryDetail/EditSideBox';
import { OntologyLayout } from '@/components/dictionaryDetail/OntologyLayout';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { useVisitedOntology } from '@/hooks/useVisitedOnotology';

interface Props {
  slug: string;
}

export const DictionaryContent = ({ slug }: Props) => {
  const t = useTranslations('DictionaryDetail');
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));
  const { data } = useGetCurrentUser();
  const user = data?.data;
  const ontologyDetail = ontology.data?.data?.ontologyDetail;
  const ontologyMetadata = ontology.data?.data?.ontologyMetadata;
  const conceptMetadataModelList =
    ontology.data?.data?.conceptMetadataModelList;

  useVisitedOntology(
    ontologyDetail && ontologyMetadata
      ? {
          slug,
          source: 'ISMD',
          name: ontologyDetail.název?.cs || ontologyMetadata.name,
        }
      : null,
    user?.userId,
  );

  if (ontology.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );
  if (!ontologyDetail || !ontologyMetadata) return null;

  const sortedParentTerms = ontologyDetail?.pojmy
    ?.filter((item) => item.název)
    ?.filter((item) => !item['definiční-obor'])
    .sort((a, b) => (a.název?.cs ?? '').localeCompare(b.název?.cs ?? ''));

  const getRelatedTerms = (parentTerm: ConceptDetailModel) => {
    return (
      ontologyDetail?.pojmy
        ?.filter(
          (item) =>
            item['definiční-obor'] && item['definiční-obor'] === parentTerm.iri,
        )
        .map((item) => {
          return {
            data: item,
            slug:
              conceptMetadataModelList?.find(
                (meta) => meta.conceptIri === item.iri,
              )?.slug || '',
          };
        }) || []
    );
  };

  const getConceptSlug = (concept: ConceptDetailModel) =>
    conceptMetadataModelList?.find((m) => m.conceptIri === concept.iri)?.slug ||
    '';

  const transformToArrayFormat = ({
    data,
    meta,
  }: {
    data: OntologyDetailModel;
    meta: OntologyMetadataModel;
  }) => {
    const nameModel = data.název?.cs || meta?.name || '';
    const descriptionModel = data.popis
      ? Object.entries(data.popis)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, value]) => value !== undefined && value !== '')
          .map(([languageTag, description]) => ({
            languageTag: languageTag,
            name: description as string,
          }))
      : [{ name: meta.popis || '', languageTag: 'cs' }];
    return { nameModel, descriptionModel };
  };

  return (
    <OntologyLayout
      title={ontologyDetail.název?.cs || ontologyMetadata.name || ''}
      popis={ontologyDetail.popis}
      fallbackPopis={ontologyMetadata.popis}
      statusLabel={
        ontologyMetadata.isPublished
          ? t('Main.DictionaryStatus.Published')
          : t('Main.DictionaryStatus.Draft')
      }
      sortedParentTerms={sortedParentTerms ?? []}
      getConceptSlug={getConceptSlug}
      getRelatedTerms={getRelatedTerms}
    >
      <ControlPanel
        ontologyID={ontologyMetadata?.id || 0}
        isPublished={ontologyMetadata.isPublished || false}
        name={ontologyDetail.název?.cs || ''}
      />
      {user?.userId && (
        <CommentSidebox
          ontologyIRI={ontologyDetail.iri}
          comments={ontologyMetadata.comments}
          refetch={() => ontology.refetch()}
          userId={user.userId}
        />
      )}
      {ontologyDetail.iri && (
        <CreateConceptSideBox
          slug={slug}
          namespace={ontologyDetail.iri || ontologyMetadata.graphName || ''}
          action="create"
          sideboxId="create"
        />
      )}
      {ontologyMetadata.id && (
        <EditSideBox
          ontologySlug={slug}
          ontologyID={ontologyMetadata.id}
          defaultValues={transformToArrayFormat({
            data: ontologyDetail,
            meta: ontologyMetadata,
          })}
        />
      )}
    </OntologyLayout>
  );
};
