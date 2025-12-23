'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  OntologyDetailModel,
  OntologyMetadataModel,
  useGetOntologyDetail,
} from '@/api/generated';
import { CreateConceptSideBox } from '@/components/conceptCreate/CreateConceptSidebox';
import { LanguageSwitcher } from '@/components/conceptDetail/LanguageSwitcher';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
import { EditSideBox } from '@/components/dictionaryDetail/EditSideBox';
import { GridContainer } from '@/components/dictionaryDetail/GridContainer';
import { Term } from '@/components/dictionaryDetail/Term';

interface Props {
  slug: string;
  userId: string;
}

export const DictionaryContent = ({ slug, userId }: Props) => {
  const t = useTranslations('DictionaryDetail');

  const ontology = useGetOntologyDetail(slug);

  useEffect(() => {
    if (slug) {
      const storageKey = `dictionarySlugs_${userId}`;
      const stored = localStorage.getItem(storageKey);

      let slugs: string[] = stored ? JSON.parse(stored) : [];

      slugs = [slug, ...slugs.filter((s) => s !== slug)];

      if (slugs.length > 6) {
        slugs = slugs.slice(0, 6);
      }

      localStorage.setItem(storageKey, JSON.stringify(slugs));
    }
  }, [slug, userId]);

  if (ontology.data) {
    const { ontologyMetadata, ontologyDetail, conceptMetadataModelList } =
      ontology.data;
    const sortedParentTerms = ontologyDetail?.pojmy
      ?.filter((item) => item.název)
      ?.filter((item) => !item['definiční-obor'])
      .sort((a, b) => (a.název?.cs ?? '').localeCompare(b.název?.cs ?? ''));

    const getRelatedTerms = (parentTerm: ConceptDetailModel) => {
      return (
        ontologyDetail?.pojmy
          ?.filter(
            (item) =>
              item['definiční-obor'] &&
              item['definiční-obor'] === parentTerm.iri,
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

    if (ontologyDetail && ontologyMetadata) {
      return (
        <>
          <div className="w-full relative flex">
            <div className="w-full pl-2 pr-8 space-y-6 relative">
              <GridContainer>
                <div className="space-y-2 col-span-4 col-start-2">
                  <h1 className="text-xl lg:text-3xl font-bold">
                    {ontologyDetail.název?.cs || ontologyMetadata.name}
                  </h1>
                  <p className="text-sm text-dark-secondary">
                    {ontologyMetadata?.isPublished
                      ? t('Main.DictionaryStatus.Published')
                      : t('Main.DictionaryStatus.Draft')}
                  </p>
                </div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Main.Sections.Description')}
                </p>
                {ontologyDetail.popis ? (
                  <div className="col-span-4">
                    <LanguageSwitcher item={ontologyDetail.popis} />
                  </div>
                ) : (
                  <p className="col-span-4">{ontologyMetadata.popis}</p>
                )}
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Main.Sections.Terms')}
                </p>
                <div className="col-span-4">
                  {sortedParentTerms?.map((concept, index) => (
                    <Term
                      data={concept}
                      subterms={getRelatedTerms(concept)}
                      key={concept.iri || index}
                      slug={
                        conceptMetadataModelList?.find(
                          (item) => concept.iri === item.conceptIri,
                        )?.slug || ''
                      }
                    />
                  ))}
                </div>
              </GridContainer>
            </div>
            <ControlPanel
              ontologyID={ontologyMetadata?.id || 0}
              isPublished={ontologyMetadata.isPublished || false}
              name={ontologyDetail.název?.cs || ''}
            />
            <CommentSidebox
              ontologyIRI={ontologyDetail.iri}
              comments={ontologyMetadata.comments}
              refetch={() => ontology.refetch()}
              userId={userId}
            />
            {(ontologyDetail.iri || ontologyMetadata.graphName) && (
              <CreateConceptSideBox
                slug={slug}
                namespace={
                  ontologyDetail.iri || ontologyMetadata.graphName || ''
                }
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
          </div>
        </>
      );
    }
  }
};
