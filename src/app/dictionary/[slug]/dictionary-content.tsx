'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  OntologyDetailModel,
  useGetCurrentUser,
  useGetOntologyDetail,
} from '@/api/generated';
import { CreateConceptSideBox } from '@/components/conceptCreate/CreateConceptSidebox';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
import { EditSideBox } from '@/components/dictionaryDetail/EditSideBox';
import { GridContainer } from '@/components/dictionaryDetail/GridContainer';
import { Term } from '@/components/dictionaryDetail/Term';

interface Props {
  slug: string;
}

export const DictionaryContent = ({ slug }: Props) => {
  const t = useTranslations('DictionaryDetail');

  const ontology = useGetOntologyDetail(slug);
  const { data } = useGetCurrentUser();
  const user = data?.data;

  useEffect(() => {
    if (slug && user?.userId) {
      const storageKey = `dictionarySlugs_${user?.userId}`;
      const stored = localStorage.getItem(storageKey);

      let slugs: string[] = stored ? JSON.parse(stored) : [];

      slugs = [slug, ...slugs.filter((s) => s !== slug)];

      if (slugs.length > 6) {
        slugs = slugs.slice(0, 6);
      }

      localStorage.setItem(storageKey, JSON.stringify(slugs));
    }
  }, [slug, user?.userId]);

  if (ontology.data) {
    const { ontologyMetadata, ontologyDetail } = ontology.data;
    const sortedParentTerms = ontologyDetail?.pojmy
      ?.filter((item) => item.název)
      .filter((item) => !item['definiční-obor'])
      .sort((a, b) => (a.název?.cs ?? '').localeCompare(b.název?.cs ?? ''));

    const getRelatedTerms = (parentTerm: ConceptDetailModel) => {
      return ontologyDetail?.pojmy?.filter(
        (item) =>
          item['definiční-obor'] && item['definiční-obor'] === parentTerm.iri,
      );
    };

    const transformToArrayFormat = ({
      data,
    }: {
      data: OntologyDetailModel;
    }) => {
      const nameModel = data.název?.cs;
      const descriptionModel = data.popis
        ? Object.entries(data.popis)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, value]) => value !== undefined && value !== '')
            .map(([languageTag, description]) => ({
              languageTag: languageTag,
              name: description as string,
            }))
        : [{ name: '', languageTag: 'cs' }];
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
                    {ontologyDetail.název?.cs}
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
                {ontologyDetail.popis?.cs && (
                  <p className="col-span-4">{ontologyDetail.popis?.cs}</p>
                )}
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Main.Sections.Terms')}
                </p>
                <div className="col-span-4">
                  {sortedParentTerms?.map((item, index) => (
                    <Term
                      data={item}
                      subterms={getRelatedTerms(item)}
                      key={item.iri || index}
                    />
                  ))}
                </div>
              </GridContainer>
            </div>
            <ControlPanel
              ontologyID={ontologyMetadata?.id || 0}
              isPublished={ontologyMetadata.isPublished || false}
              name={ontologyDetail.název?.cs || ''}
              ownerId={ontologyMetadata.user?.userId}
              // validationReport={ontology}
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
                namespace={ontologyDetail.iri}
                concepts={ontologyDetail.pojmy}
              />
            )}
            {ontologyMetadata.id && (
              <EditSideBox
                ontologySlug={slug}
                ontologyID={ontologyMetadata.id}
                defaultValues={transformToArrayFormat({ data: ontologyDetail })}
              />
            )}
          </div>
        </>
      );
    }
  }
};
