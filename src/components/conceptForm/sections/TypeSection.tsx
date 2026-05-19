import { useFormContext } from 'react-hook-form';

import { ConceptEditModelConceptTypeEnum } from '@/api/generated';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema'; // ← ConceptForm, not ConceptCreateModel

const CONCEPT_TYPE_OPTIONS = [
  { value: ConceptEditModelConceptTypeEnum.TRIDA, label: 'Třída' },
  { value: ConceptEditModelConceptTypeEnum.VLASTNOST, label: 'Vlastnost' },
  { value: ConceptEditModelConceptTypeEnum.VZTAH, label: 'Vztah' },
];

const TYPE_OPTIONS = [
  { value: '', label: '' },
  { value: 'Objekt', label: 'Objekt' },
  { value: 'Subjekt', label: 'Subjekt' },
];

export const TypesSection = () => {
  const { watch, register } = useFormContext<ConceptForm>();
  const type = watch('conceptType');
  return (
    <FormSection icon="diagram-3" label="Typy a zařazení">
      <Select
        name="conceptTypeEnum"
        label="Typ pojmu"
        options={CONCEPT_TYPE_OPTIONS}
        changeMultiple="conceptType"
      />
      {type === 'TRIDA' && (
        <Select name="type" label="Typ tridy" options={TYPE_OPTIONS} />
      )}
      {type === 'VLASTNOST' && (
        <>
          <ConceptInput
            name="domain"
            label="Patri k pojmu"
            placeholder="Vyhledejte pojem"
            single
          />
          <Input<ConceptForm>
            name="dataType"
            placeholder="Vyberte typ hodnoty"
            register={register}
            label="Datovy typ hodnoty"
          />
        </>
      )}
      {type === 'VZTAH' && (
        <>
          <ConceptInput
            name="domain"
            label="Vychozi pojem"
            placeholder="Vyhledejte pojem"
            single
          />
          <ConceptInput
            name="range"
            label="Cilovy pojem"
            placeholder="Vyhledejte pojem"
            single
          />
        </>
      )}
    </FormSection>
  );
};
