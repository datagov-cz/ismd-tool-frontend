import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';

import { ControlPanelConcept } from './ControlPanelConcept';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Section } from './Section';

type Props = {
  ontology: string;
  conceptDetail: ConceptDetailModel;
  conceptId?: number;
  commentsCount: number;
  isPublished?: boolean;
  loggedIn?: boolean;
  source?: 'NKD' | 'ISMD';
  owner: boolean;
  slug: string;
};

export const ConceptHeader = ({
  ontology,
  conceptDetail,
  conceptId,
  isPublished,
  commentsCount,
  loggedIn,
  source,
  owner,
  slug,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const isPublic = conceptDetail['typ']?.includes('Veřejný údaj');

  const router = useRouter();

  return (
    <div className="w-full bg-white">
      <div className="max-w-250 mx-auto py-5 px-4 flex flex-col gap-3 w-full">
        <div className="flex items-center lg:justify-between relative gap-5">
          <button
            onClick={() => router.back()}
            className="lg:absolute top-0 lg:-left-5 lg:pt-1 lg:-translate-x-full flex gap-1 text-blue-primary font-bold items-center text-sm"
          >
            <GovIcon name="chevron-compact-left" size="s" color="primary" />
            {t('Main.ControlPanel.Back')}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {t('Main.ControlPanel.InOntology')}:
            </span>
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
                {isPublic ? t('Main.Public') : t('Main.NonPublic')}
              </GovTag>
            </div>
            <div>
              {conceptDetail['název'] &&
                (Object.keys(conceptDetail['název']).includes('en') ||
                  Object.keys(conceptDetail['název']).includes('sk')) && (
                  <Section title={t('Main.Name')}>
                    <LanguageSwitcher item={conceptDetail['název']!} />
                  </Section>
                )}
            </div>
          </div>

          <ControlPanelConcept
            commentsCount={commentsCount}
            conceptID={conceptId || 0}
            isPublished={isPublished || false}
            name={conceptDetail.název?.cs || ''}
            loggedIn={loggedIn}
            source={source}
            owner={owner}
            slug={slug}
          />
        </div>
      </div>
    </div>
  );
};
