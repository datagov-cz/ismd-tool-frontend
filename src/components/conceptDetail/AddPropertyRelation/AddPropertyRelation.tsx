import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';

import { ConceptPropertiesModel } from '@/api/generated';
import { Section } from '../Section';
import { RelatedTerm } from '../Term/RelatedTerm';

import { AddPropertyRelationModal } from './AddPropertyRelationModal';

type Props = {
  title: string;
  concepts?: ConceptPropertiesModel[];
  type: 'property' | 'relation';
  iri: string;
  conceptName?: string;
  slug: string;
  isOwnerLoggedIn?: boolean;
};

export const AddPropertyRelation = ({
  title,
  concepts,
  type,
  iri,
  conceptName,
  slug,
  isOwnerLoggedIn,
}: Props) => {
  const [open, setOpen] = useState(false);
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
            onGovClick={() => setOpen(true)}
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
      <AddPropertyRelationModal
        iri={iri}
        type={type}
        conceptName={conceptName}
        open={open}
        setOpen={setOpen}
        slug={slug}
      />
    </Section>
  );
};
