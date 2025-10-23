import { useMutation } from '@tanstack/react-query';

import { axiosInstance } from '../axios-instance';
import { OntologyType } from '../lib/appTypes';

export const createOntology = async (
  userId: string,
  ontology: OntologyType,
): Promise<void> => {
  await axiosInstance({
    method: 'POST',
    url: `/api/ontology/create?userId=${userId}`,
    data: ontology,
  });
};

export const useCreateOntology = () => {
  return useMutation({
    mutationFn: ({
      userId,
      ontology,
    }: {
      userId: string;
      ontology: OntologyType;
    }) => createOntology(userId, ontology),
  });
};
