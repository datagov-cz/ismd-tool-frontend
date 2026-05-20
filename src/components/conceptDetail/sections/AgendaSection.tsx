import { useTranslations } from 'next-intl';

import { RppAgenda, RppIsvs } from '@/api/generated';
import { Section } from '../Section';

export const AgendaSection = ({
  agenda,
  agendovyInformacniSystem,
  neverejnostUdaje,
}: {
  agenda?: RppAgenda;
  agendovyInformacniSystem?: RppIsvs;
  neverejnostUdaje?: string[];
}) => {
  const t = useTranslations('ConceptDetail');

  if (!agenda && !agendovyInformacniSystem && !neverejnostUdaje) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {agenda && (
        <Section title={t('Sections.Agenda')}>
          <span>
            {agenda.code} - {agenda.nazev}
          </span>
        </Section>
      )}
      {agendovyInformacniSystem && (
        <Section title={t('Sections.AgendaInfoSystem')}>
          <span>
            {agendovyInformacniSystem.code} - {agendovyInformacniSystem.nazev}
          </span>
        </Section>
      )}
      {neverejnostUdaje && (
        <Section title={t('Sections.ProvingNonPublicData')}>
          {neverejnostUdaje.map((item) => item)}
        </Section>
      )}
    </div>
  );
};
