import { useTranslations } from 'next-intl';

import { ConceptPropertiesModel } from '@/api/generated';
import { useCreateConceptBoxStore } from '@/store/createConceptBoxStore';
import { CreateConceptSideBox } from '../conceptCreate/CreateConceptSidebox';
import { ControlPanelButton } from '../dictionaryDetail/ControlPanelButton';
import { Term } from '../dictionaryDetail/Term';

import { Section } from './Section';

type Props = {
  type: 'VLASTNOST' | 'VZTAH';
  title: string;
  concepts: ConceptPropertiesModel[];
  conceptIRI: string;
  ontologyIRI: string;
  conceptSlug: string;
};

export const AddPropertyRelation = ({
  type,
  title,
  concepts,
  conceptIRI,
  ontologyIRI,
  conceptSlug,
}: Props) => {
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');
  const setOpenBoxId = useCreateConceptBoxStore((state) => state.setOpenBoxId);

  const sideboxId = `${conceptSlug}-${type}-${conceptIRI}`;

  return (
    <Section title={title}>
      <div className="justify-between flex items-start">
        <div>
          {concepts?.map((item) => (
            <Term
              key={item.slug}
              slug={item.slug || ''}
              tree={false}
              data={{ název: { cs: item.name || '' } }}
            />
          ))}
        </div>
        <ControlPanelButton
          iconName="plus"
          ariaLabel={t('Add')}
          onClick={() => setOpenBoxId(sideboxId)}
        />
        <CreateConceptSideBox
          slug={conceptSlug}
          namespace={ontologyIRI}
          action="create"
          defaultData={{
            domain: conceptIRI,
            conceptType: type,
            conceptTypeEnum: type,
          }}
          sideboxId={sideboxId}
        />
      </div>
    </Section>
  );
};
