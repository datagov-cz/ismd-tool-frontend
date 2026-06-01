import Axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/backend`,
  withCredentials: false,
});

// Auth is handled server-side by the /api/backend proxy route.
// No token attachment needed here.

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      error.isOffline = true;
      error.message = 'Jste offline. Zkuste to znovu, až budete online.';
    }
    return Promise.reject(error);
  },
);

export const axiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    paramsSerializer: { indexes: null },
    cancelToken: source.token,
    timeout: 10000,
  }).then(({ data }) => data);

  // @ts-expect-error -> cancel does not exist on Promise type
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
