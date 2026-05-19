import { GovFormLabel } from '@gov-design-system-ce/react';
import { useFormContext } from 'react-hook-form';

import { RPPInput } from '@/components/shared/RPPInput';
import { FormSection } from '../components/FormSection';

export const RightsAndObligationsSection = () => {
  const { register } = useFormContext();
  return (
    <FormSection label="Registr práv a povinností" icon="shield-check">
      <RPPInput
        label="Agenda"
        name="agendaCode"
        placeholder="Vyhledat agendu RPP"
        type="AGENDA"
      />
      <RPPInput
        label="Agendovy informacni system"
        name="agendaSystemCode"
        placeholder="Vyhledat AIS"
        type="AIS"
      />
      <div className="grid-cols-7 grid">
        <div className="flex gap-2 col-start-2 ml-10">
          <input type="checkbox" {...register('isPublic')} className="w-fit" />
          <GovFormLabel size="m" className="w-fit mb-0!">
            <span className="font-bold">Je verejny</span>
          </GovFormLabel>
        </div>
      </div>

      {/* TODO add Ustanoveni dokladajici neverejnost udaje */}
      <div className="grid-cols-7 grid">
        <div className="flex gap-2 col-start-2 ml-10">
          <input type="checkbox" {...register('isInPPDF')} className="w-fit" />
          <GovFormLabel size="m" className="w-fit mb-0!">
            <span className="font-bold">Je v PPDF</span>
          </GovFormLabel>
        </div>
      </div>
    </FormSection>
  );
};
