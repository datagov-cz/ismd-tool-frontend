import { useTranslations } from 'next-intl';

import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';
import { LanguageSwitcher } from '../LanguageSwitcher';
import {
  LegislativeSource,
  NonLegislativeSource,
} from '../sections/LegalSection';
import { IriRelatedTerm } from '../Term/IriRelatedTerm';
import { IriRelatedTermList } from '../Term/IriRelatedTermList';

import {
  ALT_NAME_KEYS,
  CONCEPT_KEYS,
  Deviation,
  DeviationKey,
  DeviationResolvedMaps,
  DeviationSide,
  DeviationValue as DeviationValueType,
  IRI_LABEL_KEYS,
  isOneOf,
  LEGAL_SOURCE_KEYS,
  MULTI_LANG_KEYS,
  NONLEGAL_SOURCE_KEYS,
  OBOR_HODNOT_KEYS,
  PPDF_KEYS,
  RPP_KEYS,
  SHARING_KEYS,
  TYP_KEYS,
} from './deviation.types';
import { labelFromIri } from './deviation.utils';

export const DeviationValue = ({
  propertyKey,
  data,
  side,
  resolved,
  deviationResolved,
}: {
  propertyKey: DeviationKey;
  data: DeviationValueType;
  side: DeviationSide;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  deviationResolved?: DeviationResolvedMaps;
}) => {
  const t = useTranslations('ConceptDeviations');

  const deviation = { key: propertyKey, data } as Deviation;

  if (isOneOf(deviation, LEGAL_SOURCE_KEYS)) {
    const value = deviation.data[side];
    if (!value?.length) return null;
    return (
      <div className="space-y-2">
        {value.map((fragmentIri) => (
          <LegislativeSource
            key={fragmentIri}
            item={{ fragmentIri }}
            bg="white"
          />
        ))}
      </div>
    );
  }

  if (
    isOneOf(deviation, MULTI_LANG_KEYS) ||
    isOneOf(deviation, ALT_NAME_KEYS)
  ) {
    const value = deviation.data[side];
    if (!value) return null;
    return (
      <div className="ml-10">
        <LanguageSwitcher item={value} showCsTag={true} />
      </div>
    );
  }

  if (isOneOf(deviation, PPDF_KEYS)) {
    const value = deviation.data[side];
    if (value === undefined) return null;
    return <div>{value ? t('Yes') : t('No')}</div>;
  }

  if (isOneOf(deviation, CONCEPT_KEYS)) {
    const value = deviation.data[side];
    if (value === undefined) return null;
    if (!Array.isArray(value)) {
      return <IriRelatedTerm iri={value} resolved={resolved} />;
    }
    return (
      <div className="space-y-2">
        <IriRelatedTermList iris={value} resolved={resolved} />
      </div>
    );
  }

  if (isOneOf(deviation, RPP_KEYS)) {
    const value = deviation.data[side];
    if (value === undefined) return null;

    const entry = deviationResolved?.[`${deviation.key}-resolved`]?.[value];
    if (!entry) return <p>{value}</p>;

    return (
      <p>
        {entry.nazev ?? value}
        {entry.code ? ` (${entry.code})` : ''}
      </p>
    );
  }

  if (isOneOf(deviation, TYP_KEYS)) {
    const value = deviation.data[side];
    if (value === undefined) return null;
    return <p>{value.join(', ')}</p>;
  }

  if (isOneOf(deviation, OBOR_HODNOT_KEYS)) {
    const value = deviation.data[side];
    if (value === undefined) return null;

    const entry = deviationResolved?.['obor-hodnot-resolved']?.[value];
    if (entry?.label) return <p>{entry.label}</p>;

    if (value.includes('https://')) {
      return <IriRelatedTermList iris={[value]} resolved={resolved} />;
    }

    return <p>{value}</p>;
  }

  if (isOneOf(deviation, IRI_LABEL_KEYS)) {
    const value = deviation.data[side];
    return <span>{labelFromIri(value)}</span>;
  }

  if (isOneOf(deviation, SHARING_KEYS)) {
    const value = deviation.data[side];
    return (
      <div className="flex flex-col">
        {value?.map((item) => (
          <span key={item}>{labelFromIri(item)}</span>
        ))}
      </div>
    );
  }

  if (isOneOf(deviation, NONLEGAL_SOURCE_KEYS)) {
    const value = deviation.data[side];
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
