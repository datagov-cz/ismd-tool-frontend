// Single source of truth for localStorage form-draft keys.
// Mutation defaults (offlineMutationDefaults.ts) clear these on success,
// so keys must be derivable from mutation variables/response there.
export const draftKeys = {
  ontologyCreate: 'ontology-create-form',
  ontologyEdit: (slug: string) => `dictionary-draft:edit:${slug}`,
  conceptCreate: (ontologySlug: string) =>
    `concept-draft:create:${ontologySlug}`,
  conceptEdit: (slug: string) => `concept-draft:edit:${slug}`,
};
