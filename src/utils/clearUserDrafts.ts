import { draftKeys } from '@/lib/draftKeys';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

const EXACT_DRAFT_KEYS = [draftKeys.ontologyCreate, draftKeys.ontologyCreateAi];
const DRAFT_KEY_PREFIXES = [
  'dictionary-draft:edit:',
  'concept-draft:create:',
  'concept-draft:edit:',
];

export const clearUserDrafts = () => {
  if (typeof window === 'undefined') return;

  // Clear in-memory AI suggestions as well as their persisted copy.
  try {
    useVocabularyDraftStore.getState().reset();
  } catch {
    // Continue removing local drafts if the store cannot write to storage.
  }

  try {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (
        key &&
        (EXACT_DRAFT_KEYS.includes(key) ||
          DRAFT_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage may be unavailable in private browsing or under browser policy.
  }
};
