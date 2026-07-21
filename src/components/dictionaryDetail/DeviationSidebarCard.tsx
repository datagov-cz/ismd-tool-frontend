import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  GetOntologyDtoPublishedConceptDeviations,
} from '@/api/generated';

export const DeviationSidebarCard = ({
  deviations,
  concepts,
}: {
  deviations: GetOntologyDtoPublishedConceptDeviations;
  concepts?: ConceptDetailModel[];
}) => {
  const t = useTranslations('DictionaryDetail.Deviations');

  const keys = Object.keys(deviations);
  const filteredDeviations = keys.filter(
    (key) => deviations[key].status !== 'NO_DEVIATION',
  );

  const filteredConcepts = concepts?.filter(
    (concept) => concept.iri && filteredDeviations.includes(concept.iri),
  );

  return (
    <div className="w-auto rounded-md border border-status-warning-600 bg-status-warning-300 px-3 py-2.5">
      <div>
        <span className="font-medium">
          {t('SidebarTitle')} [{filteredDeviations.length}]
        </span>
        <p className="text-sm">{t('SidebarDescription')}</p>
      </div>
      <div className="flex flex-col gap-2 pt-3 max-h-62 overflow-y-scroll">
        {filteredConcepts?.map((item) => (
          <Link
            key={item.iri}
            href={`#${item.iri}`}
            className="bg-white border border-blue-hover flex w-full group justify-between rounded-md py-1 px-1.5 font-bold text-blue-hover leading-none"
          >
            <span className="group-hover:underline">{item.název?.cs}</span>
            {filteredDeviations.includes(item.iri!) && (
              <span className="text-xs text-black font-normal whitespace-nowrap flex items-center">
                {t('Differences')}
                <span className="font-bold pl-1">
                  [{Object.keys(deviations[item.iri!]).length}]
                </span>
                <GovIcon
                  name="chevron-compact-right"
                  size="s"
                  color="primary"
                />
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
