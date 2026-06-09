import { isAxiosError } from 'axios';

import { UploadFromFileBody } from '@/api/generated';

export const MISSING_INSCHEME_ERROR_CODE = 'MISSING_INSCHEME_DECISION_REQUIRED';

export interface ConceptMissingInScheme {
  conceptIri: string;
  conceptName: string;
  proposedInScheme: string;
}

export interface MissingInSchemeErrorBody {
  data: {
    graphName: string;
    conceptsMissingInScheme: ConceptMissingInScheme[];
  };
  message: string;
  success: false;
  errorCode: typeof MISSING_INSCHEME_ERROR_CODE;
}

// What we hand to the decision step: the file to re-upload + the concepts.
export interface InSchemeDecisionData {
  file: UploadFromFileBody['file'];
  graphName: string;
  conceptsMissingInScheme: ConceptMissingInScheme[];
}

export const getMissingInSchemeError = (
  error: unknown,
): MissingInSchemeErrorBody | undefined => {
  const body = isAxiosError(error)
    ? error.response?.data
    : (error as { response?: { data?: unknown } })?.response?.data;

  if (
    body &&
    typeof body === 'object' &&
    'errorCode' in body &&
    (body as { errorCode?: string }).errorCode === MISSING_INSCHEME_ERROR_CODE
  ) {
    return body as MissingInSchemeErrorBody;
  }
  return undefined;
};
