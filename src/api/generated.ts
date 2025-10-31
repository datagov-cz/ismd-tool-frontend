import { useMutation } from '@tanstack/react-query';

import { axiosInstance } from '../axios-instance';
import { OntologyType } from '../lib/appTypes';

type OntologyMetadataModel = {
  id: number;
  graphName: string;
  user: {
    userId: string;
  };
  isPublished: boolean;
  validationReport: {
    id: number | null;
    results: unknown | null;
    timestamp: string | null;
    ontologyId: number | null;
    valid: boolean;
  };
  ontologyLevel: unknown | null;
  comments: unknown[];
};

export const createOntology = async (
  userId: string,
  ontology: OntologyType,
): Promise<OntologyMetadataModel> => {
  const response = (await axiosInstance({
    method: 'POST',
    url: `/api/ontology/create?userId=${userId}`,
    data: ontology,
  })) as { data: OntologyMetadataModel };
  return response.data;
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
