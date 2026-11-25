'use client';

import axios from 'axios';
import { useTranslations } from 'next-intl';

import { useGetOntologyDetail } from '@/api/generated';
import { isQueryLoading } from '@/lib/query';
import { NotFoundState } from '../shared/NotFoundState';
import { PageLoader } from '../shared/PageLoader';

import { DictionaryEditForm } from './DictionaryEditForm';

export const DictionaryEditWrapper = ({ slug }: { slug: string }) => {
  const t = useTranslations('DictionaryDetail');
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));
  const ontologyDetail = ontology.data?.data?.ontologyDetail;
  const ontologyMetadata = ontology.data?.data?.ontologyMetadata;

  if (isQueryLoading(ontology)) {
    return <PageLoader />;
  }

  if (ontology.error) {
    if (
      axios.isAxiosError(ontology.error) &&
      ontology.error.response?.status === 404
    ) {
      return <NotFoundState title={t('NotFound')} backLabel={t('Back')} />;
    }
    throw ontology.error;
  }

  if (!ontologyDetail || !ontologyMetadata?.id) {
    return <NotFoundState title={t('NotFound')} backLabel={t('Back')} />;
  }

  return (
    <DictionaryEditForm
      ontologySlug={slug}
      ontologyID={ontologyMetadata.id}
      metadata={ontologyMetadata}
      detail={ontologyDetail}
    />
  );
};
