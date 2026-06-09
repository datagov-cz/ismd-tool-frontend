import { useTranslations } from 'next-intl';

import { CheckBox } from '@/components/shared/CheckBox';
import { RPPInput } from '@/components/shared/RPPInput';
import { FormSection } from '../components/FormSection';

export const RightsAndObligationsSection = () => {
  const tRegistry = useTranslations('ConceptDetail.Registry');
  const tSection = useTranslations('CreateConcept.RightsAndObligationsSection');

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
      <CheckBox name="isInPPDF" label={tRegistry('PPDF')} />

      {/* TODO add Ustanoveni dokladajici neverejnost udaje */}
    </FormSection>
  );
};
