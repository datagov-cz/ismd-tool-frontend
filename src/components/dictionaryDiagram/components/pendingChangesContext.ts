import { createContext, useContext } from 'react';

export const PendingChangesContext = createContext<ReadonlySet<string>>(
  new Set(),
);

export const usePendingChanges = () => useContext(PendingChangesContext);
