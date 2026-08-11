import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { CheckBox } from '@/components/shared/CheckBox';
import { LegislativeSourceArrayInput } from '@/components/shared/LegislativeSourceInput/LegislativeSourceArrayInput';
import { RPPInput } from '@/components/shared/RPPInput';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';
import { FormSection } from '../components/FormSection';
import { ConceptForm } from '../schema/conceptFormSchema';

export const RightsAndObligationsSection = () => {
  const tRegistry = useTranslations('ConceptDetail.Registry');
  const tSection = useTranslations('CreateConcept.RightsAndObligationsSection');

  const { control, watch } = useFormContext<ConceptForm>();
  const isPublic = watch('isPublic');
  const type = watch('conceptType');

  const isPublicActive = useActiveAnchor('isPublic');

  return (
    <FormSection label={tRegistry('Title')} icon="shield-check">
      {type === 'TRIDA' && (
        <>
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
        </>
      )}

      <Controller
        control={control}
        name="isPublic"
        render={({ field }) => {
          const toggle = (value: boolean) => {
            field.onChange(field.value === value ? null : value);
          };

          return (
            <div
              className={clsx(
                'grid-cols-7 grid w-full space-y-2 p-2.5 rounded-lg',
                isPublicActive && 'bg-blue-subtle',
              )}
            >
              <div
                className="flex gap-2 col-start-2 ml-10 col-span-5"
                id="isPublic"
              >
                <fieldset className="flex flex-col gap-1">
                  <label className="flex gap-2">
                    <input
                      ref={field.ref}
                      type="radio"
                      name={field.name}
                      checked={field.value === false}
                      onBlur={field.onBlur}
                      onChange={() => field.onChange(false)}
                      onClick={() => toggle(false)}
                    />
                    {tRegistry('NonPublic')}
                  </label>

                  <label className="flex gap-2">
                    <input
                      type="radio"
                      name={field.name}
                      checked={field.value === true}
                      onBlur={field.onBlur}
                      onChange={() => field.onChange(true)}
                      onClick={() => toggle(true)}
                    />
                    {tRegistry('Public')}
                  </label>
                </fieldset>
              </div>
            </div>
          );
        }}
      />
      {isPublic === false && (
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
