import { GovChip } from '@gov-design-system-ce/react';

import { DataTypeDto } from '@/api/generated';

import { Section } from './Section';

type Props = {
  title: string;
  item: DataTypeDto;
};

export const RangeItem = ({ title, item }: Props) => {
  return (
    <Section title={title}>
      <GovChip title={item.label} color="primary" type="outlined">
        {item.label} - {item.code}
      </GovChip>
    </Section>
  );
};
