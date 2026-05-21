import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';

import { ControlPanelConcept } from './ControlPanelConcept';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Section } from './Section';

type Props = {
  ontology: string;
  conceptDetail: ConceptDetailModel;
};

export const ConceptHeaderNKD = ({ ontology, conceptDetail }: Props) => {
  const t = useTranslations('ConceptDetail');
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const isPublic = conceptDetail['typ']?.includes('Veřejný údaj');

  return (
    <div className="w-full bg-white">
      <div className="max-w-250 mx-auto py-5 px-4 flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between">
          <Link
            href={`/dictionary/${ontology.split(' ').join('-')}`}
            className="cursor-pointer"
          >
            <GovTag
              color="success"
              type="subtle"
              size="xs"
              className="w-fit border bg-white! cursor-pointer"
            >
              <GovIcon
                name="journal-text"
                slot="icon-start"
                type="components"
              />
              <span className="font-bold text-blue-primary cursor-pointer">
                {capitalizeFirst(ontology)}
              </span>
            </GovTag>
          </Link>
        </div>
        <div className="flex justify-between gap-3 w-full">
          <div>
            <div className="gap-3 flex pb-2">
              <h1 className="text-xl lg:text-2xl font-medium">
                {conceptDetail.název?.cs}
              </h1>
              <GovTag
                color="primary"
                type="subtle"
                size="xs"
                className="h-fit whitespace-nowrap my-1!"
              >
                <GovIcon
                  name="card-heading"
                  slot="icon-start"
                  type="components"
                />
                {conceptDetail.typ
                  ?.filter((item: string) => item !== 'Koncept')
                  .map(
                    (item: string, index, arr) =>
                      item + ` ${index < arr.length - 1 ? '/ ' : ''}`,
                  )}
              </GovTag>
              <GovTag
                color={isPublic ? 'success' : 'neutral'}
                type="subtle"
                size="xs"
                className="h-fit whitespace-nowrap my-1!"
              >
                <GovIcon
                  name={isPublic ? 'globe' : 'lock-fill'}
                  slot="icon-start"
                  type="components"
                />
                {isPublic ? 'Veřejný' : 'Neveřejný'}
              </GovTag>
            </div>
            <div>
              {conceptDetail['název'] &&
                (Object.keys(conceptDetail['název']).includes('en') ||
                  Object.keys(conceptDetail['název']).includes('sk')) && (
                  <Section title="Název">
                    <LanguageSwitcher item={conceptDetail['název']!} />
                  </Section>
                )}
              {conceptDetail['alternativní-název'] && (
                <Section title={t('Sections.AlternativeName')}>
                  <LanguageSwitcher
                    item={conceptDetail['alternativní-název']!}
                  />
                </Section>
              )}
            </div>
          </div>

          <ControlPanelConcept
            conceptID={0}
            isPublished={true}
            name={conceptDetail.název?.cs || ''}
            source={'NKD'}
            owner={false}
            commentsCount={0}
          />
        </div>
      </div>
    </div>
  );
};
