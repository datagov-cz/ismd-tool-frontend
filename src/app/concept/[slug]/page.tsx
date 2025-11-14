'use client';

import { GovTag } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetConceptDetail } from '@/api/generated';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanelConcept } from '@/components/dictionaryDetail/ControlPanelConcept';
import { GridContainer } from '@/components/dictionaryDetail/GridContainer';
import { Term } from '@/components/dictionaryDetail/Term';

interface Props {
  params: {
    slug: string;
  };
}

const ConceptDetail = ({ params }: Props) => {
  const t = useTranslations('ConceptDetail');
  const concept = useGetConceptDetail(params.slug);

  if (concept.data) {
    const { conceptDetail, conceptMetadata } = concept.data;

    if (conceptDetail && conceptMetadata) {
      const url = new URL(conceptMetadata.graphName || '');
      const pathname = url.pathname;

      const ontology = decodeURIComponent(pathname)
        .replace(/^\/|\/$/g, '')
        .replace(/-/g, ' ');
      return (
        <>
          <div className="w-full relative flex">
            <div className="w-full pl-2 pr-8 space-y-6 relative">
              <GridContainer>
                <div className="space-y-2 col-span-4 col-start-2">
                  <p>{ontology.charAt(0).toUpperCase() + ontology.slice(1)}</p>
                  <h1 className="text-xl lg:text-3xl font-bold">
                    {conceptDetail.název?.cs}
                  </h1>
                  <div className="flex flex-wrap gap-1">
                    {conceptDetail.typ?.map((item) => (
                      <GovTag
                        key={item}
                        color="primary"
                        type="subtle"
                        size="xs"
                      >
                        {item}
                      </GovTag>
                    ))}
                  </div>
                </div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.AlternativeName')}
                </p>
                <p className="col-span-4">
                  {conceptDetail['alternativní-název']?.cs}
                </p>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.Definition')}
                </p>
                {conceptDetail.definice?.cs && (
                  <p className="col-span-4">{conceptDetail.definice?.cs}</p>
                )}
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">{t('Sections.Resource')}</p>
                <div className="col-span-4"></div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.Description')}
                </p>
                {conceptDetail.popis?.cs && (
                  <p className="col-span-4">{conceptDetail.popis?.cs}</p>
                )}
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.RelatedResources')}
                </p>
                <div className="col-span-4"></div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.SupersededConcepts')}
                </p>
                <div className="col-span-4">
                  {conceptDetail['definiční-obor']?.split('/pojem/')[1] && (
                    <Term
                      data={{
                        název: {
                          cs: conceptDetail['definiční-obor']
                            ?.split('/pojem/')[1]
                            .replace(/-/g, ' '),
                        },
                      }}
                      slug={
                        pathname.replace(/^\/|\/$/g, '') +
                        '-' +
                        conceptDetail['definiční-obor']?.split('/pojem/')[1]
                      }
                      subterms={[]}
                    />
                  )}
                </div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.SubordinateConcepts')}
                </p>
                <div className="col-span-4"></div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">
                  {t('Sections.Properties')}
                </p>
                <div className="col-span-4"></div>
              </GridContainer>
              <GridContainer>
                <p className="font-medium text-xl">{t('Sections.Relations')}</p>
                <div className="col-span-4"></div>
              </GridContainer>
            </div>
            <ControlPanelConcept
              conceptID={conceptMetadata?.id || 0}
              isPublished={conceptMetadata.isPublished || false}
              name={conceptDetail.název?.cs || ''}
            />
            <CommentSidebox
              conceptIRI={conceptDetail.iri}
              comments={conceptMetadata.comments}
              refetch={() => concept.refetch()}
            />
          </div>
        </>
      );
    }
  }
};

export default ConceptDetail;
