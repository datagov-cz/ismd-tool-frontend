import { create } from 'zustand';

type CommentBoxStoreType = {
  isOpen: boolean;
};

type CommentBoxStoreActions = {
  setIsOpen: (_isOpen: boolean) => void;
};

const initialState: CommentBoxStoreType = {
  isOpen: false,
};

export const useCommentBoxStore = create<
  CommentBoxStoreType & CommentBoxStoreActions
>()((set) => ({
  ...initialState,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
