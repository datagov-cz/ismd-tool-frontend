import { GovIcon, GovMessage } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import type { IriStatus as IriStatusType } from '@/hooks/useIriCheck';

type Props = {
  status: IriStatusType;
  iri?: string;
};

export const IriStatus = ({ status, iri }: Props) => {
  const t = useTranslations('CreateOntology.IriCheck');

  if (status === 'idle') {
    return (
      <div className="px-2.5">
        <GovMessage
          color="primary"
          type="subtle"
          icon={<GovIcon type="components" name="info-circle" />}
        >
          {t('Idle')}
        </GovMessage>
      </div>
    );
  }

  if (status === 'checking') {
    return (
      <div className="px-2.5">
        <GovMessage
          color="neutral"
          type="subtle"
          icon={
            <GovIcon type="components" name="loader" className="animate-spin" />
          }
        >
          {t('Checking')}
        </GovMessage>
      </div>
    );
  }

  if (status === 'ok') {
    return (
      <div className="px-2.5">
        <GovMessage
          color="success"
          type="subtle"
          icon={<GovIcon type="components" name="check-circle" />}
        >
          <span className="break-all">{t('Ok', { iri: iri ?? '' })}</span>
        </GovMessage>
      </div>
    );
  }

  const message = {
    invalid: t('Invalid'),
    taken: t('Taken', { iri: iri ?? '' }),
    error: t('Error'),
  }[status];

  return (
    <div className="px-2.5" role="alert">
      <GovMessage
        color={status === 'error' ? 'warning' : 'error'}
        type="subtle"
        icon={<GovIcon type="components" name="exclamation-triangle" />}
      >
        <span className="break-all">{message}</span>
      </GovMessage>
    </div>
  );
};
