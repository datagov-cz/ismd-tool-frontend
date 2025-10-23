import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStoreType = {
  user: object | null; // TODO: set correct user type
};

type UserStoreActions = {
  setUser: (user: object | null) => void;
};

const initialState: UserStoreType = {
  user: {},
};

export const useUserStore = create<UserStoreType & UserStoreActions>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
    },
  ),
);
