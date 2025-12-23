import { create } from 'zustand';

type EditOntologyBoxType = {
  isOpen: boolean;
};

type EditOntologyBoxTypeActions = {
  // eslint-disable-next-line no-unused-vars
  setIsOpen: (isOpen: boolean) => void;
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
