import { ReactNode } from 'react';

import { GridContainer } from '../dictionaryDetail/GridContainer';

export const AccordionItemContent = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <GridContainer>
      <p className="font-medium! text-sm! col-span-2">{title}</p>
      <div className="col-span-3 flex flex-col gap-2">{children}</div>
    </GridContainer>
  );
};
