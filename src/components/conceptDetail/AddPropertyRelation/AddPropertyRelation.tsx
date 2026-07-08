import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  ConceptPropertiesModel,
} from '@/api/generated';
import { Section } from '../Section';
import { IriRelatedTerm } from '../Term/IriRelatedTerm';

type Props = {
  title: string;
  concepts?: ConceptPropertiesModel[];
  type: 'property' | 'relation';
  isOwnerLoggedIn?: boolean;
  openModal: () => void;
  resolvedRelations?: ConceptDetailModelReferencovanéPojmyResolved;
};

export const AddPropertyRelation = ({
  title,
  concepts,
  type,
  isOwnerLoggedIn,
  openModal,
  resolvedRelations,
}: Props) => {
  const t = useTranslations('ConceptDetail.Main');
  return (
    <Section title={title}>
      <div className="space-y-2 w-full">
        {concepts?.map(
          (item) =>
            item.iri && (
              <IriRelatedTerm
                key={item.iri}
                iri={item.iri}
                resolved={resolvedRelations}
                type={type === 'property' ? 'VLASTNOST' : 'VZTAH'}
              />
            ),
        )}

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
              {type === 'property'
                ? t('AddPropertyButton')
                : t('AddRelationButton')}
            </span>
          </GovButton>
        )}
      </div>
    </Section>
  );
};
