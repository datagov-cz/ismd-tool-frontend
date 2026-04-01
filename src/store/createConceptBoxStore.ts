import { create } from 'zustand';

type CreateConceptBoxStoreType = {
  openBoxId: string | null;
};

type CreateConceptBoxStoreActions = {
  setOpenBoxId: (_id: string | null) => void;
  isOpen: (_id: string) => boolean;
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
