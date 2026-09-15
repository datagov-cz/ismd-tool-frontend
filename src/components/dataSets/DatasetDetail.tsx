'use client';

import { useTranslations } from 'next-intl';

import { ConceptDetailModel, useGetDatasetDetail } from '@/api/generated';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { PageLoader } from '@/components/shared/PageLoader';
import { isQueryLoading } from '@/lib/query';

import { DatasetLayout } from './DatasetLayout';

interface Props {
  iri: string;
}

export const DatasetDetailWrapper = ({ iri }: Props) => {
  const dataset = useGetDatasetDetail({ iri });
  const t = useTranslations('DictionaryDetail');

  const datasetDetail = dataset.data?.data;

  if (isQueryLoading(dataset)) {
    return <PageLoader />;
  }

  if (!datasetDetail) {
    return <NotFoundState title={t('NotFound')} backLabel={t('Back')} />;
  }

  const nkdSlug = (concept: ConceptDetailModel) => `/nkd?iri=${concept.iri}`;

  return (
    <DatasetLayout
      iri={datasetDetail.iri}
      title={datasetDetail.název}
      popis={datasetDetail.popis}
      concepts={datasetDetail.pojmy}
      conceptCount={datasetDetail.pojmy?.length}
      getConceptSlug={nkdSlug}
      distribuce={datasetDetail.distribuce}
    />
  );
};
