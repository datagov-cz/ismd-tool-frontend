import { AxiosError } from 'axios';

export const getErrorMessage = (
  error: unknown,
  t: (key: string) => string,
): string => {
  let message: string | undefined;

  if (error instanceof AxiosError) {
    message = error?.response?.data.message ?? error.message;
  }

  return message ?? t('UnknownError');
};
