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
      <GovChip size="m" color="primary" type="outlined">
        <span title={item.label}>
          {item.label} - {item.code}
        </span>
      </GovChip>
    </Section>
  );
};
