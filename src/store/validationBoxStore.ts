import { create } from 'zustand';

import {
  GroupedValidation,
  ValidationRule,
} from '@/components/dictionaryDetail/validation/ValidationSummary';

type ValidationSideboxStoreType = {
  isOpen: boolean;
  activeRuleName: string | null;
  grouped: GroupedValidation | null;
  timestamp: string | null;
  slug: string;
};

type ValidationSideboxStoreActions = {
  setIsOpen: (_isOpen: boolean) => void;
  openRule: (
    _rule: ValidationRule,
    _grouped: GroupedValidation,
    _timestamp: string | null,
    _slug: string,
  ) => void;
  setActiveRuleName: (_ruleName: string | null) => void;
  close: () => void;
};

const initialState: ValidationSideboxStoreType = {
  isOpen: false,
  activeRuleName: null,
  grouped: null,
  timestamp: null,
  slug: '',
};

export const useValidationSideboxStore = create<
  ValidationSideboxStoreType & ValidationSideboxStoreActions
>()((set) => ({
  ...initialState,
  setIsOpen: (isOpen) => set({ isOpen }),
  openRule: (rule, grouped, timestamp, slug) =>
    set({
      isOpen: true,
      activeRuleName: rule.ruleName,
      grouped,
      timestamp,
      slug,
    }),
  setActiveRuleName: (ruleName) => set({ activeRuleName: ruleName }),
  close: () => set({ isOpen: false, activeRuleName: null, timestamp: null }),
}));
