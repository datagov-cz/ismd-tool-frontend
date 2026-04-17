export const getBaseUrl = (namespace: string) => {
  const lastSlashIndex = namespace.lastIndexOf('/');
  return namespace.substring(0, lastSlashIndex);
};
