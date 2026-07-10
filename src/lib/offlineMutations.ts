import {
  getCreateConceptMutationOptions,
  getCreateOntologyMutationOptions,
  getEditConceptMutationOptions,
  getEditOntologyMutationOptions,
} from '@/api/generated';

export const offlineMutations = {
  createOntology: getCreateOntologyMutationOptions,
  editOntology: getEditOntologyMutationOptions,
  createConcept: getCreateConceptMutationOptions,
  editConcept: getEditConceptMutationOptions,
} as const;

export type OfflineMutationKey = keyof typeof offlineMutations;

type MutationFnOf<K extends OfflineMutationKey> = NonNullable<
  ReturnType<(typeof offlineMutations)[K]>['mutationFn']
>;

export type OfflineMutationVariables<K extends OfflineMutationKey> = Parameters<
  MutationFnOf<K>
>[0];

export type OfflineMutationResponse<K extends OfflineMutationKey> = Awaited<
  ReturnType<MutationFnOf<K>>
>;
