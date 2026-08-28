import axios from 'axios';

type ErrorResponse = {
  message?: string;
};

export const getErrorMessage = (
  error: unknown,
  t: (_key: string) => string,
): string => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? t('UnknownError');
  }

  return error instanceof Error ? error.message : t('UnknownError');
};

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
