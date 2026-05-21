import { useTranslations } from 'next-intl';

import { Section } from '../Section';

export const SharingTypeSection = ({
  typObsahuUdaje,
  zpusobSdileniUdaje,
  zpusobZiskaniUdaje,
}: {
  typObsahuUdaje?: string;
  zpusobSdileniUdaje?: string[];
  zpusobZiskaniUdaje?: string;
}) => {
  const t = useTranslations('ConceptDetail');

  if (!typObsahuUdaje && !zpusobSdileniUdaje && !zpusobSdileniUdaje) {
    return null;
  }

  const getType = (item: string) =>
    item.split('položky/')[1].split('-').join(' ');

  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {typObsahuUdaje && (
        <Section title={t('Sections.DataContentType')}>
          <span>{getType(typObsahuUdaje)}</span>
        </Section>
      )}
      {zpusobSdileniUdaje && (
        <Section title={t('Sections.WaySharingData')}>
          <div className="flex flex-col">
            {zpusobSdileniUdaje.map((item) => (
              <span key={item}>{getType(item)}</span>
            ))}
          </div>
        </Section>
      )}
      {zpusobZiskaniUdaje && (
        <Section title={t('Sections.WayObtainingData')}>
          {getType(zpusobZiskaniUdaje)}
        </Section>
      )}
    </div>
  );
};
