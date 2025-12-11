import { ReactNode } from 'react';

import { GridContainer } from '../dictionaryDetail/GridContainer';

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <GridContainer>
    <p className="font-medium text-xl">{title}</p>
    <div className="col-span-4">{children}</div>
  </GridContainer>
);
