import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { ValidateDeploymentResponse, ValidationResultsResponse } from './types';
import { baseQuery } from '../../utils';

export const validationApi = createApi({
  reducerPath: 'validationApi',
  baseQuery: fetchBaseQuery(baseQuery),
  tagTypes: ['Validation'],
  endpoints: builder => ({
    validateDeployment: builder.mutation<
      ValidateDeploymentResponse,
      { deploymentId: string; ignorableIssues?: string[] }
    >({
      query: ({ deploymentId, ignorableIssues }) => ({
        url: `validation/validate`,
        method: 'POST',
        body: {
          deployment_id: deploymentId,
          ...(ignorableIssues &&
            ignorableIssues.length > 0 && {
              ignorable_issues: ignorableIssues,
            }),
        },
      }),
    }),
    getValidationResults: builder.query<ValidationResultsResponse, { taskId: string }>({
      query: ({ taskId }) => ({
        url: `validation/task/${taskId}?delete_on_read=false`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useValidateDeploymentMutation, useGetValidationResultsQuery, useLazyGetValidationResultsQuery } =
  validationApi;
