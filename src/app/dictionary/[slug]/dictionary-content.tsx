'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel, useGetOntologyDetail } from '@/api/generated';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
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
              metadata={ontologyMetadata}
            />
            <CommentSidebox
              ontologyIRI={ontologyDetail.iri}
              comments={ontologyMetadata.comments}
              refetch={() => ontology.refetch()}
              userId={userId}
            />
          </div>
        </>
      );
    }
  }
};
