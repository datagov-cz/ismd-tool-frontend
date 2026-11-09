import { useQuery } from '@tanstack/react-query';
import { useDebounceValue } from 'usehooks-ts';

import { checkIri } from '@/api/generated';

export type IriStatus =
  | 'idle'
  | 'checking'
  | 'ok'
  | 'invalid'
  | 'taken'
  | 'error';

export const IRI_CHECK_QUERY_KEY = ['checkIri'] as const;

const DEBOUNCE_MS = 500;

export const useIriCheck = (namespace: string, name: string) => {
  const input = JSON.stringify([namespace.trim(), name.trim()]);
  const [debouncedInput] = useDebounceValue(input, DEBOUNCE_MS);
  const [debouncedNamespace, debouncedName] = JSON.parse(debouncedInput) as [
    string,
    string,
  ];
  const enabled = !!debouncedNamespace && !!debouncedName;

  const { data, isFetching, isError } = useQuery({
    queryKey: [...IRI_CHECK_QUERY_KEY, debouncedNamespace, debouncedName],
    queryFn: ({ signal }) =>
      checkIri(
        {
          namespace: debouncedNamespace,
          nameModel: { name: { cs: debouncedName } },
        },
        undefined,
        signal,
      ),
    enabled,
    gcTime: 0,
    retry: false,
  });

  const result = data?.data;

  const status: IriStatus = (() => {
    if (!namespace.trim() || !name.trim()) {
      return 'idle';
    }
    if (input !== debouncedInput || isFetching) {
      return 'checking';
    }
    if (isError) {
      return 'error';
    }
    if (!result) {
      return 'checking';
    }
    if (!result.valid) {
      return 'invalid';
    }
    if (!result.available) {
      return 'taken';
    }
    return 'ok';
  })();

  return { status, iri: result?.iri };
};
