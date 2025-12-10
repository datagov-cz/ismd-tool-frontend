import { create } from 'zustand';

type CreateConceptBoxStoreType = {
  isOpen: boolean;
};

type CreateConceptBoxStoreActions = {
  setIsOpen: (_isOpen: boolean) => void;
};

const initialState: CreateConceptBoxStoreType = {
  isOpen: false,
};

export const useCreateConceptBoxStore = create<
  CreateConceptBoxStoreType & CreateConceptBoxStoreActions
>()((set) => ({
  ...initialState,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
