import { useTranslations } from 'next-intl';

import { ResolvedLegalSourceDto, RppAgenda, RppIsvs } from '@/api/generated';
import { Section } from '../Section';

import { LegislativeSource } from './LegalSection';

export const AgendaSection = ({
  agenda,
  agendovyInformacniSystem,
  neverejnostUdaje,
}: {
  agenda?: RppAgenda | string;
  agendovyInformacniSystem?: RppIsvs | string;
  neverejnostUdaje?: ResolvedLegalSourceDto[];
}) => {
  const t = useTranslations('ConceptDetail');

  if (!agenda && !agendovyInformacniSystem && !neverejnostUdaje) {
    return null;
  }

  const renderAgenda = (item: RppAgenda | string) => {
    if (typeof item === 'string') {
      const code = item.split('/').pop();
      return <span>{code}</span>;
    }
    return (
      <span>
        {item.code} - {item.nazev}
      </span>
    );
  };

  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {agenda && (
        <Section title={t('Sections.Agenda')}>{renderAgenda(agenda)}</Section>
      )}
      {agendovyInformacniSystem && (
        <Section title={t('Sections.AgendaInfoSystem')}>
          {renderAgenda(agendovyInformacniSystem)}
        </Section>
      )}
      {neverejnostUdaje && (
        <Section title={t('Sections.ProvingNonPublicData')}>
          <div className="space-y-2">
            {neverejnostUdaje.map((item) => {
              return <LegislativeSource item={item} key={item.displayLabel} />;
            })}
          </div>
        </Section>
      )}
    </div>
  );
};
