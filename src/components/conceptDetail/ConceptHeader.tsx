import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  ConceptMetadataModelConceptType,
  ConceptMetadataModelSourceTag,
} from '@/api/generated';

import { ControlPanelConcept } from './ControlPanelConcept';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Section } from './Section';

type RelationItem = {
  name: string;
  slug: string;
};

type Props = {
  ontology: string;
  conceptDetail: ConceptDetailModel;
  conceptId?: number;
  commentsCount: number;
  loggedIn?: boolean;
  source?: 'NKD' | 'ISMD';
  editAllowed: boolean;
  slug: string;
  relation?: { start: RelationItem; middle: RelationItem; end: RelationItem };
  conceptType?: ConceptMetadataModelConceptType;
  ontologySlug?: string;
  sourceTag?: ConceptMetadataModelSourceTag;
};

export const ConceptHeader = ({
  ontology,
  conceptDetail,
  conceptId,
  commentsCount,
  loggedIn,
  source,
  editAllowed,
  slug,
  relation,
  conceptType,
  ontologySlug,
  sourceTag,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const isPublic = conceptDetail['typ']?.includes('Veřejný údaj');
  const notPublic = conceptDetail['typ']?.includes('Neveřejný údaj');

  const router = useRouter();

  return (
    <div className="w-full bg-surface">
      <div className="max-w-250 mx-auto py-5 px-4 flex flex-col gap-3 w-full">
        <div className="flex items-center lg:justify-between relative gap-5">
          <button
            onClick={() => router.back()}
            className="lg:absolute top-0 lg:-left-5 lg:pt-1 lg:-translate-x-full flex gap-1 text-accent font-bold items-center text-sm"
          >
            <GovIcon name="chevron-compact-left" size="s" color="primary" />
            {t('Main.ControlPanel.Back')}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {t('Main.ControlPanel.InOntology')}:
            </span>
            <Link
              href={`/dictionary/${ontologySlug}`}
              className="cursor-pointer"
            >
              <GovTag
                color="success"
                type="subtle"
                size="xs"
                className="w-fit border bg-surface! cursor-pointer"
              >
                <GovIcon
                  name="journal-text"
                  slot="icon-start"
                  type="components"
                />
                <span className="font-bold text-accent cursor-pointer">
                  {capitalizeFirst(ontology)}
                </span>
              </GovTag>
            </Link>
          </div>
        </div>
        <div className="flex justify-between gap-3 w-full">
          <div>
            <div className="flex pb-2 flex-col">
              <h1 className="text-xl lg:text-2xl font-medium">
                {conceptDetail.název?.cs}
              </h1>
              <div className="space-x-1">
                <GovTag
                  color="primary"
                  type="subtle"
                  size="xs"
                  className="h-fit whitespace-nowrap my-1!"
                >
                  <GovIcon
                    name={
                      conceptType === 'VZTAH'
                        ? 'bezier2'
                        : conceptType === 'VLASTNOST'
                          ? 'tag'
                          : 'card-heading'
                    }
                    slot="icon-start"
                    type="components"
                  />
                  <span className="font-bold">
                    {conceptDetail.typ
                      ?.filter((item: string) => item !== 'Koncept')
                      .map(
                        (item: string, index, arr) =>
                          item + ` ${index < arr.length - 1 ? '/ ' : ''}`,
                      )}
                  </span>
                </GovTag>
                {(isPublic || notPublic) && (
                  <>
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
                      <span className="font-bold">
                        {isPublic ? t('Main.Public') : t('Main.NonPublic')}
                      </span>
                    </GovTag>
                  </>
                )}
                {sourceTag && (
                  <GovTag
                    color={sourceTag === 'DRAFT' ? 'warning' : 'neutral'}
                    type="subtle"
                    size="xs"
                    className="h-fit whitespace-nowrap my-1!"
                  >
                    <GovIcon
                      name={sourceTag === 'DRAFT' ? 'gear' : 'copy'}
                      slot="icon-start"
                      type="components"
                    />
                    <span className="font-bold">
                      {sourceTag === 'DRAFT'
                        ? t('Main.Draft')
                        : t('Main.WorkingCopy')}
                    </span>
                  </GovTag>
                )}
                {conceptDetail['instance-definovány-číselníkem'] &&
                  Object.keys(conceptDetail['instance-definovány-číselníkem'])
                    .length > 0 && (
                    <GovTag
                      color="neutral"
                      type="subtle"
                      size="xs"
                      className="h-fit whitespace-nowrap my-1!"
                    >
                      <GovIcon
                        name="signpost-2-fill"
                        slot="icon-start"
                        type="components"
                      />
                      <span className="font-bold">
                        {t('Main.DefinedByDictionary')}
                      </span>
                    </GovTag>
                  )}
              </div>
            </div>
            <div>
              {conceptDetail['název'] &&
                (Object.keys(conceptDetail['název']).includes('en') ||
                  Object.keys(conceptDetail['název']).includes('sk')) && (
                  <Section title={t('Main.Name')}>
                    <LanguageSwitcher item={conceptDetail['název']!} hideCs />
                  </Section>
                )}
              {relation && (
                <div className="flex gap-2 items-center pt-2">
                  <InnerTerm term={relation.start} />
                  <GovIcon
                    name="arrow-right"
                    slot="icon-start"
                    type="components"
                    size="s"
                    color="primary"
                  />
                  <InnerTerm term={relation.middle} isRelation={true} />
                  <GovIcon
                    name="arrow-right"
                    slot="icon-start"
                    type="components"
                    size="s"
                    color="primary"
                  />
                  <InnerTerm term={relation.end} />
                </div>
              )}
            </div>
          </div>

          <ControlPanelConcept
            commentsCount={commentsCount}
            conceptID={conceptId || 0}
            name={conceptDetail.název?.cs || ''}
            loggedIn={loggedIn}
            source={source}
            editAllowed={editAllowed}
            slug={slug}
            iri={conceptDetail.iri}
            conceptType={conceptType}
          />
        </div>
      </div>
    </div>
  );
};

export const InnerTerm = ({
  term,
  isRelation,
}: {
  term: RelationItem;
  isRelation?: boolean;
}) => {
  return (
    <Link
      href={`/concept/${term.slug}`}
      className={clsx(
        'inline-flex gap-1 px-1.5 py  rounded-md border hover:underline',
        isRelation
          ? 'border-accent bg-blue-subtle font-bold text-blue-hover'
          : 'border-border-default bg-surface',
      )}
    >
      {!isRelation && (
        <GovIcon
          slot="icon-start"
          name={'card-heading'}
          type="components"
          size="l"
          color="primary"
          className={clsx('shrink-0', 'mt-0.5!')}
        />
      )}
      {term.name}
    </Link>
  );
};
