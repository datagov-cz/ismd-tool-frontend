import { GovButton, GovIcon } from '@gov-design-system-ce/react';

import { ConceptPropertiesModel } from '@/api/generated';
import { Section } from '../Section';
import { RelatedTerm } from '../Term/RelatedTerm';

type Props = {
  title: string;
  concepts?: ConceptPropertiesModel[];
  type: 'property' | 'relation';
  isOwnerLoggedIn?: boolean;
  openModal: () => void;
};

export const AddPropertyRelation = ({
  title,
  concepts,
  type,
  isOwnerLoggedIn,
  openModal,
}: Props) => {
  return (
    <Section title={title}>
      <div className="space-y-2 w-full">
        {concepts?.map((item) => (
          <RelatedTerm
            key={item.name}
            label={item.name || ''}
            href={item.ref || ''}
          />
        ))}
        {isOwnerLoggedIn && (
          <GovButton
            className="block! py-2"
            color="primary"
            type="base"
            onGovClick={() => {
              openModal();
            }}
          >
            <GovIcon
              size="xs"
              slot="icon-start"
              type="components"
              name="plus"
            />
            <span className="text-sm font-bold">
              Pridat {type === 'property' ? 'vlastnost' : 'vztah'}
            </span>
          </GovButton>
        )}
      </div>
    </Section>
  );
};
