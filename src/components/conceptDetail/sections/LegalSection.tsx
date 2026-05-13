import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  ConceptDetailModelDefinujícíNelegislativníZdrojItem,
  ConceptDetailModelSouvisejícíNelegislativníZdrojItem,
} from '@/api/generated';
import { ConceptDetailLink } from '../ConceptDetailLink';
import { LinkList } from '../LinkList';
import { Section } from '../Section';

export const LegalSection = ({
  definujiciUstanoveni,
  souvisejiciUstanoveni,
  definujícíZdroj,
  souvisejícíZdroj,
}: {
  definujiciUstanoveni?: string[];
  souvisejiciUstanoveni?: string[];
  definujícíZdroj?: ConceptDetailModelDefinujícíNelegislativníZdrojItem[];
  souvisejícíZdroj?: ConceptDetailModelSouvisejícíNelegislativníZdrojItem[];
}) => {
  const t = useTranslations('ConceptDetail');

  const renderNonLegalSource = (
    items: ConceptDetailModel['definující-nelegislativní-zdroj'],
  ) =>
    items?.map((item, index) =>
      'název' in item ? (
        <p key={index}>{item['název'].cs as string}</p>
      ) : 'url' in item ? (
        <ConceptDetailLink key={String(item.url)} href={String(item.url)} />
      ) : null,
    );

  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {definujiciUstanoveni && (
        <Section title={t('Sections.Resource')}>
          <LinkList items={definujiciUstanoveni} />
        </Section>
      )}

      {souvisejiciUstanoveni && (
        <Section title={t('Sections.RelatedResources')}>
          <LinkList items={souvisejiciUstanoveni} />
        </Section>
      )}

      {definujícíZdroj && (
        <Section title={t('Sections.NonLegalResources')}>
          {renderNonLegalSource(definujícíZdroj)}
        </Section>
      )}

      {souvisejícíZdroj && (
        <Section title={t('Sections.RelatedNonLegalResources')}>
          {renderNonLegalSource(souvisejícíZdroj)}
        </Section>
      )}
    </div>
  );
};
