import { create } from 'zustand';

type HintboxStoreType = {
  isOpen: boolean;
};

type HintboxStoreActions = {
  setIsOpen: (isOpen: boolean) => void;
};

const initialState: HintboxStoreType = {
  isOpen: false,
};

export const useHintboxStore = create<HintboxStoreType & HintboxStoreActions>()(
  (set) => ({
    ...initialState,
    setIsOpen: (isOpen) => set({ isOpen }),
  }),
);
