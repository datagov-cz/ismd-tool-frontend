import axios from 'axios';

export const OFN_NONCONFORMANCE_ERROR_CODES = [
  'ONTOLOGY_DOWNLOAD_BLOCKED_BY_OFN',
  'ONTOLOGY_DOWNLOAD_BLOCKED_BY_VALIDATION',
  'UPLOAD_OFN_NONCONFORMANT',
  'OFN_WRITE_NONCONFORMANT',
] as const;

export interface OfnIssue {
  kind: string;
  conceptIri: string | null;
  location: string;
  message: string;
  value: string | null;
}

export interface OfnIssuesData {
  vocabularyIri: string;
  issues: OfnIssue[];
  message?: string;
}

export interface OfnConformanceError {
  errorCode: (typeof OFN_NONCONFORMANCE_ERROR_CODES)[number];
  message: string;
  data: OfnIssuesData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const parseOfnConformanceError = (
  value: unknown,
): OfnConformanceError | undefined => {
  if (!isRecord(value) || !isRecord(value.data)) return undefined;
  if (
    typeof value.errorCode !== 'string' ||
    !OFN_NONCONFORMANCE_ERROR_CODES.includes(
      value.errorCode as (typeof OFN_NONCONFORMANCE_ERROR_CODES)[number],
    ) ||
    typeof value.message !== 'string' ||
    typeof value.data.vocabularyIri !== 'string' ||
    !Array.isArray(value.data.issues)
  ) {
    return undefined;
  }

  return {
    ...(value as unknown as OfnConformanceError),
    data: { ...value.data, message: value.message } as OfnIssuesData,
  };
};

const getResponseBody = (error: unknown): unknown =>
  axios.isAxiosError(error)
    ? error.response?.data
    : (error as { response?: { data?: unknown } } | null)?.response?.data;

export const getOfnConformanceError = async (
  error: unknown,
  parseBlob = false,
): Promise<OfnConformanceError | undefined> => {
  const body = getResponseBody(error);

  if (parseBlob && body instanceof Blob) {
    try {
      return parseOfnConformanceError(JSON.parse(await body.text()));
    } catch {
      return undefined;
    }
  }

  return parseOfnConformanceError(body);
};

const hasErrorCode = (error: unknown, code: string): boolean => {
  const body = getResponseBody(error);
  return isRecord(body) && body.errorCode === code;
};

export const isOfnWriteNonconformant = (error: unknown): boolean =>
  hasErrorCode(error, 'OFN_WRITE_NONCONFORMANT');

export const isOfnUploadNonconformant = (error: unknown): boolean =>
  hasErrorCode(error, 'UPLOAD_OFN_NONCONFORMANT');
