import { GovFormLabel } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { RPPInput } from '@/components/shared/RPPInput';
import { FormSection } from '../components/FormSection';

export const RightsAndObligationsSection = () => {
  const { register } = useFormContext();
  const tRegistry = useTranslations('ConceptDetail.Registry');
  const tSection = useTranslations('CreateConcept.RightsAndObligationsSection');

  return (
    <FormSection label={tRegistry('Title')} icon="shield-check" anchor="rights">
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
      <div className="grid-cols-7 grid">
        <div className="flex gap-2 col-start-2 ml-10 col-span-5">
          <input type="checkbox" {...register('isPublic')} className="w-fit" />
          <GovFormLabel size="m" className="w-fit mb-0!">
            <span className="font-bold">{tRegistry('NonPublic')}</span>
          </GovFormLabel>
        </div>
      </div>

      {/* TODO add Ustanoveni dokladajici neverejnost udaje */}
      <div className="grid-cols-7 grid">
        <div className="flex gap-2 col-start-2 ml-10 col-span-5">
          <input type="checkbox" {...register('isInPPDF')} className="w-fit" />
          <GovFormLabel size="m" className="w-fit mb-0!">
            <span className="font-bold">{tRegistry('PPDF')}</span>
          </GovFormLabel>
        </div>
      </div>
    </FormSection>
  );
};
