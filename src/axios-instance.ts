import Axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL,
});

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
  }).then(({ data }) => data);

  // @ts-expect-error -> cancel does not exist on Promise type
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
