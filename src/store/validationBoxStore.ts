import { create } from 'zustand';

type ValidationBoxStoreType = {
  isOpen: boolean;
};

type ValidationBoxStoreActions = {
  setIsOpen: (isOpen: boolean) => void;
};

const initialState: ValidationBoxStoreType = {
  isOpen: false,
};

export const useValidationBoxStore = create<
  ValidationBoxStoreType & ValidationBoxStoreActions
>()((set) => ({
  ...initialState,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
