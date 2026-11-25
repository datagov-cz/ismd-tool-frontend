'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetAllDiagrams } from '@/api/generated';
import { useCurrentUser } from '../contexts/CurrentUserProvider';
import { CircularLoader } from '../shared/CircularLoader';
import { DiagramCard } from '../shared/DiagramCard/DiagramCard';

export const DiagramsSection = () => {
  const t = useTranslations('Home');

  const { user } = useCurrentUser();

  const diagrams = useGetAllDiagrams(
    { userId: user?.userId, limit: 8 },
    { query: { enabled: !!user?.userId } },
  );

  const isLoading = diagrams.isLoading;

  return (
    <div className="space-y-5 pb-10 pt-4 w-full">
      <h2 className="font-medium text-xl flex items-center gap-2">
        <GovIcon
          type="components"
          name="diagram-3"
          size="m"
          className="transition-transform duration-200 text-purple"
        />
        {t('DiagramSectionTitle')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {isLoading ? (
          <CircularLoader />
        ) : (
          diagrams.data?.data?.items.map(
            ({ diagramId, name, updatedAt, ontologySlug, ontologyLabel }) =>
              diagramId &&
              name && (
                <DiagramCard
                  key={diagramId}
                  title={name}
                  link={`/dictionary/${ontologySlug}/diagram/${diagramId}`}
                  modified={updatedAt ? new Date(updatedAt) : undefined}
                  ontologyName={
                    ontologyLabel?.cs ?? ontologyLabel?.sk ?? ontologyLabel?.en
                  }
                  ontologySlug={ontologySlug}
                />
              ),
          )
        )}
      </div>
    </div>
  );
};
