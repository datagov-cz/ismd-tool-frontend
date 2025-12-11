'use client';

import { GovAccordion } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel, useGetConceptDetail } from '@/api/generated';
import { conceptDataFormatter } from '@/components/conceptCreate/conceptDataFormatter';
import { CreateConceptSideBox } from '@/components/conceptCreate/CreateConceptSidebox';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { ControlPanelConcept } from '@/components/conceptDetail/ControlPanelConcept';
import { DecreeAccordion } from '@/components/conceptDetail/DecreeAccordion';
import { LanguageSwitcher } from '@/components/conceptDetail/LanguageSwitcher';
import { LinkList } from '@/components/conceptDetail/LinkList';
import { RegistryAccordion } from '@/components/conceptDetail/RegistryAcordion';
import { Section } from '@/components/conceptDetail/Section';
import { SuperClassList } from '@/components/conceptDetail/SuperClassList';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { Term } from '@/components/dictionaryDetail/Term';

interface Props {
  slug: string;
}

const extractOntologyFromUrl = (graphName: string) => {
  const url = new URL(graphName);
  return decodeURIComponent(url.pathname)
    .replace(/^\/|\/$/g, '')
    .replace(/-/g, ' ');
};

const extractDefinicniObor = (
  conceptDetail: ConceptDetailModel,
  pathname: string,
) => {
  const definicniOborValue = conceptDetail['definiční-obor'];
  if (!definicniOborValue) return null;

  const name = String(
    definicniOborValue.split('/pojem/')[1]?.replace(/-/g, ' '),
  );
  const link = `${pathname.replace(/^\/|\/$/g, '')}-${definicniOborValue.split('/pojem/')[1]}`;

  return { name, link };
};

const ConceptContent = ({ slug }: Props) => {
  const t = useTranslations('ConceptDetail');
  const concept = useGetConceptDetail(slug);

  if (!concept.data) return null;

  const { conceptDetail, conceptMetadata } = concept.data;
  if (!conceptDetail || !conceptMetadata) return null;

  const ontology = extractOntologyFromUrl(conceptMetadata.graphName || '');
  const pathname = new URL(conceptMetadata.graphName || '').pathname;
  const definicniObor = extractDefinicniObor(conceptDetail, pathname);

  return (
    <div className="w-full relative flex">
      <div className="w-full pl-2 pr-8 space-y-6 relative">
        <ConceptHeader
          ontology={ontology}
          conceptDetail={conceptDetail}
          definicniObor={definicniObor}
        />

        <Section title={t('Sections.AlternativeName')}>
          {conceptDetail['alternativní-název'] && (
            <LanguageSwitcher item={conceptDetail['alternativní-název']} />
          )}
        </Section>

        <Section title={t('Sections.Definition')}>
          {conceptDetail.definice && (
            <LanguageSwitcher item={conceptDetail.definice} />
          )}
        </Section>

        <Section title={t('Sections.Resource')}>
          <LinkList
            items={conceptDetail['definující-ustanovení-právního-předpisu']}
          />
        </Section>

        <Section title="Definující nelegislativní zdroj">
          {conceptDetail['definující-nelegislativní-zdroj']
            ?.filter((item) => 'cs' in item)
            .map((item, index) => (
              <p key={index}>{item['název'].cs as string}</p>
            ))}
        </Section>

        <Section title={t('Sections.Description')}>
          {conceptDetail.popis && (
            <LanguageSwitcher item={conceptDetail.popis} />
          )}
        </Section>

        <Section title={t('Sections.RelatedResources')}>
          <LinkList
            items={conceptDetail['související-ustanovení-právního-předpisu']}
          />
        </Section>

        <Section title={t('Sections.RelatedNonLegalResources')}>
          {conceptDetail['definující-nelegislativní-zdroj']?.map(
            (item, index) => (
              <p key={index}>{item['název'].cs as string}</p>
            ),
          )}
        </Section>

        <Section title={t('Sections.SupersededConcepts')}>
          <div />
        </Section>

        <Section title={t('Sections.Range')}>
          {conceptDetail['obor-hodnot'] && (
            <SuperClassList
              items={[conceptDetail['obor-hodnot']]}
              pathname={pathname}
            />
          )}
        </Section>

        <Section title={t('Sections.SupersededClass')}>
          <SuperClassList
            items={conceptDetail['nadřazená-třída']}
            pathname={pathname}
          />
        </Section>

        <Section title={t('Sections.SupersededRelation')}>
          <SuperClassList
            items={conceptDetail['nadřazený-vztah']}
            pathname={pathname}
          />
        </Section>

        <Section title={t('Sections.Properties')}>
          {conceptDetail.conceptProperties?.map((item) => (
            <Term
              key={item.slug}
              slug={item.slug || ''}
              tree={false}
              data={{ název: { cs: item.name || '' } }}
            />
          ))}
        </Section>

        <Section title={t('Sections.Relations')}>
          {conceptDetail.conceptRelationships?.map((item) => (
            <Term
              key={item.slug}
              tree={false}
              slug={item.slug}
              data={{ název: { cs: item.name || '' } }}
            />
          ))}
        </Section>

        <div className="w-full pt-10">
          <GovAccordion noBorder={false}>
            <RegistryAccordion conceptDetail={conceptDetail} />
            <DecreeAccordion conceptDetail={conceptDetail} />
          </GovAccordion>
        </div>
      </div>

      <ControlPanelConcept
        conceptID={conceptMetadata.id || 0}
        isPublished={conceptMetadata.isPublished || false}
        name={conceptDetail.název?.cs || ''}
      />

      <CommentSidebox
        conceptIRI={conceptDetail.iri}
        comments={conceptMetadata.comments}
        refetch={() => concept.refetch()}
        userId="test"
      />

      {conceptMetadata.graphName && (
        <CreateConceptSideBox
          slug={conceptMetadata.slug || ''}
          namespace={conceptMetadata.graphName}
          defaultData={conceptDataFormatter(concept.data)}
          action="update"
          conceptId={conceptMetadata.id}
        />
      )}
    </div>
  );
};

export default ConceptContent;
