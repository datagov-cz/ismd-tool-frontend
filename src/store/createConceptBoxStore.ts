import { create } from 'zustand';

type CreateConceptBoxStoreType = {
  openBoxId: string | null;
};

type CreateConceptBoxStoreActions = {
  // eslint-disable-next-line no-unused-vars
  setOpenBoxId: (id: string | null) => void;
  // eslint-disable-next-line no-unused-vars
  isOpen: (id: string) => boolean;
};

const initialState: CreateConceptBoxStoreType = {
  openBoxId: null,
};

export const useCreateConceptBoxStore = create<
  CreateConceptBoxStoreType & CreateConceptBoxStoreActions
>()((set, get) => ({
  ...initialState,
  setOpenBoxId: (id) => set({ openBoxId: id }),
  isOpen: (id) => get().openBoxId === id,
}));
