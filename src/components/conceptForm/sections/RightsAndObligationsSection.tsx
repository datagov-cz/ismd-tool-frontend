import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { CheckBox } from '@/components/shared/CheckBox';
import { LegislativeSourceArrayInput } from '@/components/shared/LegislativeSourceInput/LegislativeSourceArrayInput';
import { RPPInput } from '@/components/shared/RPPInput';
import { FormSection } from '../components/FormSection';
import { ConceptForm } from '../schema/conceptFormSchema';

export const RightsAndObligationsSection = () => {
  const tRegistry = useTranslations('ConceptDetail.Registry');
  const tSection = useTranslations('CreateConcept.RightsAndObligationsSection');

  const { watch } = useFormContext<ConceptForm>();
  const isPublic = watch('isPublic');

  return (
    <FormSection label={tRegistry('Title')} icon="shield-check">
      <RPPInput
        label={tRegistry('Agenda')}
        name="agendaCode"
        placeholder={tSection('AgendaPlaceholder')}
        type="AGENDA"
      />
      <RPPInput
        label={tRegistry('AIS')}
        name="agendaSystemCode"
        placeholder={tSection('AISPlaceholder')}
        type="AIS"
      />
      <CheckBox name="isPublic" label={tRegistry('NonPublic')} />
      {!isPublic && (
        <LegislativeSourceArrayInput<ConceptForm>
          label="Ustanovení dokládající neveřejnost údaje"
          name="privacyProvisions"
          anchor="privacyProvisions"
        />
      )}
      <CheckBox name="isInPPDF" label={tRegistry('PPDF')} />
    </FormSection>
  );
};
