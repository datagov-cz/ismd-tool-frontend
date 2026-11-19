import {
  type AiConceptReferenceDto,
  type AiIdReferenceDto,
  type AiKnownConceptualModelDto,
  ClassDtoType,
  type OntologyCreateModel,
  type OntologyCreateWithConceptsRequestDto,
} from '@/api/generated';
import {
  type DraftItem,
  isAttribute,
  isClass,
  isRelationship,
} from '@/lib/vocabularyDraft/types';

const toIdReference = (
  reference?: AiConceptReferenceDto,
): AiIdReferenceDto | undefined => {
  const id = reference?.ref ?? reference?.iri;
  if (!id) {
    return undefined;
  }
  return { id };
};

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

export const toKnownModel = (
  items: DraftItem[],
): AiKnownConceptualModelDto => ({
  classes: items.filter(isClass).map(({ ref, data }) => ({
    termID: ref,
    name: data.name,
    definition: data.definition,
    explanation: data.explanation,
    type: data.type,
    legalAct: data.legalAct,
    specializes: (data.specializes ?? []).map(toIdReference).filter(isDefined),
  })),
  attributes: items.filter(isAttribute).map(({ ref, data }) => ({
    termID: ref,
    associatedClass: toIdReference(data.associatedClass),
    name: data.name,
    definition: data.definition,
    explanation: data.explanation,
    legalAct: data.legalAct,
  })),
  relationships: items.filter(isRelationship).map(({ ref, data }) => ({
    termID: ref,
    sourceClass: toIdReference(data.sourceClass),
    targetClass: toIdReference(data.targetClass),
    name: data.name,
    definition: data.definition,
    explanation: data.explanation,
    legalAct: data.legalAct,
  })),
});

export const toCreatePayload = (
  ontology: OntologyCreateModel,
  items: DraftItem[],
  selectedRefs: string[],
): OntologyCreateWithConceptsRequestDto => {
  const selected = new Set(selectedRefs);
  const picked = items.filter((item) => selected.has(item.ref));

  return {
    ontology,
    classes: picked.filter(isClass).map(({ ref, data }) => ({
      ...data,
      ref,
      name: data.name ?? {},
      type: data.type ?? ClassDtoType.CLASS,
      specializes: data.specializes ?? [],
    })),
    attributes: picked.filter(isAttribute).map(({ ref, data }) => ({
      ...data,
      ref,
      name: data.name ?? {},
      associatedClass: data.associatedClass ?? {},
    })),
    relationships: picked.filter(isRelationship).map(({ ref, data }) => ({
      ...data,
      ref,
      name: data.name ?? {},
      sourceClass: data.sourceClass ?? {},
      targetClass: data.targetClass ?? {},
    })),
  };
};
