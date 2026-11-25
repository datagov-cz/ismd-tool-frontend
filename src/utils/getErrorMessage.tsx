import axios from 'axios';

type ErrorResponse = {
  message?: string;
  errorCode?: string;
};

const ERROR_CODE_TRANSLATIONS: Record<string, string> = {
  SERVER_BUSY: 'ServerBusy',
  ONTOLOGY_CREATION_CONFLICT: 'OntologyCreationConflict',
};

export const getErrorMessage = (
  error: unknown,
  t: (_key: string) => string,
): string => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const errorCode = error.response?.data?.errorCode;
    const translationKey = errorCode && ERROR_CODE_TRANSLATIONS[errorCode];
    if (translationKey) return t(translationKey);
    if (error.response?.data?.errorCode === 'OFN_WRITE_NONCONFORMANT') {
      return t('OfnWriteNonconformant');
    }
    return error.response?.data?.message ?? error.message ?? t('UnknownError');
  }

  return error instanceof Error ? error.message : t('UnknownError');
};

export const hasApiErrorCode = (error: unknown, errorCode: string): boolean =>
  axios.isAxiosError<ErrorResponse>(error) &&
  error.response?.data?.errorCode === errorCode;

export const getBlobErrorMessage = async (
  error: unknown,
  t: (_key: string) => string,
): Promise<string> => {
  if (axios.isAxiosError<Blob>(error)) {
    const data = error.response?.data;

    if (data instanceof Blob) {
      try {
        const body: unknown = JSON.parse(await data.text());

        if (
          body &&
          typeof body === 'object' &&
          'message' in body &&
          typeof body.message === 'string'
        ) {
          return body.message;
        }
      } catch {
        // Fall through to the normal Axios error message.
      }
    }

    return error.message || t('UnknownError');
  }

  return getErrorMessage(error, t);
};
