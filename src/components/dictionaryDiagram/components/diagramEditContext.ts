import { createContext, useContext } from 'react';

export const DiagramEditContext = createContext(false);

export const useCanEditDiagram = () => useContext(DiagramEditContext);
