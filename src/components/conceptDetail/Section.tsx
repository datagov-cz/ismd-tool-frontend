import { ReactNode } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';

import { GridContainer } from '../dictionaryDetail/GridContainer';

export const Section = ({
  title,
  children,
  addMore,
}: {
  title: string;
  children: ReactNode;
  addMore?: () => void;
}) => (
  <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
    <GridContainer>
      <div className="flex flex-col gap-2.5">
        <span className="font-medium text-sm">{title}</span>
        {addMore && (
          <GovButton type="base" color="primary" size="s" onGovClick={addMore}>
            <GovIcon
              slot="icon-start"
              name="plus"
              size="s"
              className="text-white"
            />
            Pridat dalsi
          </GovButton>
        )}
      </div>
      <div className="col-span-3 space-y-2">{children}</div>
    </GridContainer>
  </div>
);
