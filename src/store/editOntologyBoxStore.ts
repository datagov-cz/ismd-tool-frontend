import { create } from 'zustand';

type EditOntologyBoxType = {
  isOpen: boolean;
};

type EditOntologyBoxTypeActions = {
  setIsOpen: (_isOpen: boolean) => void;
};

const initialState: EditOntologyBoxType = {
  isOpen: false,
};

export const useEditOntologyBoxStore = create<
  EditOntologyBoxType & EditOntologyBoxTypeActions
>()((set) => ({
  ...initialState,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
