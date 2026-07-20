import { useTranslations } from 'next-intl';

import { ResolvedLegalSourceDto, RppAgenda, RppIsvs } from '@/api/generated';
import { Section } from '../Section';

import { LegislativeSource } from './LegalSection';

export const AgendaSection = ({
  agenda,
  agendovyInformacniSystem,
  neverejnostUdaje,
  ppdf,
}: {
  agenda?: RppAgenda | string;
  agendovyInformacniSystem?: RppIsvs | string;
  neverejnostUdaje?: ResolvedLegalSourceDto[];
  ppdf?: boolean;
}) => {
  const t = useTranslations('ConceptDetail');

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
      {neverejnostUdaje && neverejnostUdaje?.length > 0 && (
        <Section title={t('Sections.ProvingNonPublicData')}>
          <div className="space-y-2">
            {neverejnostUdaje.map((item) => {
              return <LegislativeSource item={item} key={item.displayLabel} />;
            })}
          </div>
        </Section>
      )}
      <Section title={t('Sections.IsPpdf')}>{ppdf ? 'Ano' : 'Ne'}</Section>
    </div>
  );
};
