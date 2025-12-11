import { CreateConceptFormData } from '../createConceptSchema';

import { transformLanguageData } from './transformLanguageData';

const mapToValues = (items: Array<{ value?: string }> | undefined) => {
  if (!items?.length) return undefined;
  const values = items.map((item) => item.value || '').filter(Boolean);
  return values.length ? values : undefined;
};

export const transformFormData = (data: CreateConceptFormData) => {
  return {
    ...data,
    nameModel: {
      name: { cs: data.nameModel.name },
    },
    sharingMethod: mapToValues(data.sharingMethod),
    definitionModel: data.definitionModel?.length
      ? { definition: transformLanguageData(data.definitionModel) }
      : undefined,
    descriptionModel: data.descriptionModel?.length
      ? { description: transformLanguageData(data.descriptionModel) }
      : undefined,
    altNameModel: data.altNameModel?.length
      ? { altName: transformLanguageData(data.altNameModel) }
      : undefined,
    conceptType: data.conceptTypeEnum,
    definingLegalSource: mapToValues(data.definingLegalSource),
    definingNonLegalSource: mapToValues(data.definingNonLegalSource),
    relatedLegalSource: mapToValues(data.relatedLegalSource),
    relatedNonLegalSource: mapToValues(data.relatedNonLegalSource),
    exactMatch: mapToValues(data.exactMatch),
    ...(data.conceptTypeEnum === 'TRIDA' && {
      broaderConcept: mapToValues(data.broaderConcept),
    }),
    ...(data.conceptTypeEnum === 'VLASTNOST' && {
      superProperty: mapToValues(data.superProperty),
    }),
    ...(data.conceptTypeEnum === 'VZTAH' && {
      superRelation: mapToValues(data.superRelation),
    }),
  };
};
