export type LawByIri = {
  label: string;
};

// There is no fetch-by-IRI endpoint yet. This mock is intentionally shaped like
// a react-query hook (`{ data, isLoading }`) so that swapping in the real
// generated `useGetLawByIri(iri)` later is a drop-in change at the call sites.
export const useLawByIri = (
  iri: string | null,
): { data: LawByIri | undefined; isLoading: boolean } => {
  return {
    data: iri ? { label: 'Právní předpis' } : undefined,
    isLoading: false,
  };
};
