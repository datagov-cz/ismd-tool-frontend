import { useTranslations } from 'next-intl';

import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';
import { LanguageSwitcher } from '../LanguageSwitcher';
import {
  LegislativeSource,
  NonLegislativeSource,
} from '../sections/LegalSection';
import { IriRelatedTermList } from '../Term/IriRelatedTermList';

import {
  DeviationKey,
  DeviationSide,
  DeviationValue as DeviationValueType,
  isAltName,
  isConcept,
  isLegalSource,
  isMultiLang,
  isNonLegalSource,
  isPPDF,
  isRPP,
} from './deviation.types';
import { labelFromIri } from './deviation.utils';

export const DeviationValue = ({
  propertyKey,
  data,
  side,
  resolved,
}: {
  propertyKey: DeviationKey;
  data: DeviationValueType;
  side: DeviationSide;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
}) => {
  const t = useTranslations('ConceptDeviations');

  if (isLegalSource(propertyKey, data)) {
    const value = data[side];
    if (!value?.length) return null;
    return (
      <>
        {value.map((fragmentIri) => (
          <LegislativeSource
            key={fragmentIri}
            item={{ fragmentIri }}
            bg="white"
          />
        ))}
      </>
    );
  }

  if (isMultiLang(propertyKey, data) || isAltName(propertyKey, data)) {
    const value = data[side];
    if (!value) return null;
    return (
      <div className="ml-10">
        <LanguageSwitcher item={value} showCsTag={true} />
      </div>
    );
  }

  if (isPPDF(propertyKey, data)) {
    const value = data[side];
    if (value === undefined) return null;
    return <div>{value ? t('Yes') : t('No')}</div>;
  }

  if (isConcept(propertyKey, data)) {
    const value = data[side];
    if (value === undefined) return null;
    return <IriRelatedTermList iris={value} resolved={resolved} />;
  }

  if (isRPP(propertyKey, data)) {
    const value = data[side];
    if (value === undefined) return null;
    return <p>{value}</p>;
  }

  if (propertyKey === 'typ') {
    const value = data[side];
    if (value === undefined) return null;
    return <p>{value.join(', ')}</p>;
  }

  if (
    propertyKey === 'typ-obsahu-údajů' ||
    propertyKey === 'způsob-získání-údajů'
  ) {
    const value = data[side];
    return <span>{labelFromIri(value?.toLocaleString())}</span>;
  }

  if (propertyKey === 'způsob-sdílení-údajů') {
    const value = data[side];
    return (
      <div className="flex flex-col">
        {value?.map((item) => (
          <span key={item?.toLocaleString()}>
            {labelFromIri(item?.toLocaleString())}
          </span>
        ))}
      </div>
    );
  }

  if (isNonLegalSource(propertyKey, data)) {
    const value = data[side];
    return (
      <>
        {value?.map((item) => (
          <NonLegislativeSource
            key={item.iri}
            name={item['název']?.cs}
            description={item.popis?.cs}
            url={item.url}
          />
        ))}
      </>
    );
  }

  return null;
};
