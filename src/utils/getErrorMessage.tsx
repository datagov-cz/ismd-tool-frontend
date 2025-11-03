import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  let message: string | undefined;

  if (error instanceof AxiosError) {
    message = error?.response?.data.message ?? error.message;
  }

  return message ?? 'Unknown error';
};
