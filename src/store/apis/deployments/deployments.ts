import {
  DeploymentsResponse,
  PolesResponse,
  ExportDeploymentFileResponse,
  ExportDeploymentWarningsResponse,
  ExportGQLResponse,
} from './types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../utils';

export const deploymentsApi = createApi({
  reducerPath: 'deploymentsApi',
  baseQuery: fetchBaseQuery(baseQuery),
  tagTypes: ['Deployment', 'Poles'],
  endpoints: builder => ({
    getPolesByDeploymentId: builder.query<PolesResponse, { deploymentId: string }>({
      query: ({ deploymentId }) => `deployment/${deploymentId}/poles`,
      providesTags: ['Poles'],
    }),

    getDeploymentById: builder.query<DeploymentsResponse, { deploymentId: string }>({
      query: ({ deploymentId }) => `deployment/${deploymentId}`,
      providesTags: ['Deployment'],
    }),

    exportDeployment: builder.query<
      ExportDeploymentWarningsResponse | ExportDeploymentFileResponse,
      { deploymentId: number; check_warnings?: boolean }
    >({
      query: ({ deploymentId, check_warnings = false }) =>
        `deployment/export-deployment/${deploymentId}?check_warnings=${check_warnings}`,
      providesTags: ['Deployment'],
      transformResponse: (
        response: unknown,
        meta: { response?: { headers?: { get: (name: string) => string | null } } } | undefined
      ) => {
        // If response has warnings structure, return it as-is
        if (response && typeof response === 'object' && response !== null && 'has_warnings' in response) {
          return response as ExportDeploymentWarningsResponse;
        }

        // Otherwise, it's file data - extract filename and return structured response
        const contentDisposition = meta?.response?.headers?.get('content-disposition');
        let filename = 'default.json';

        if (contentDisposition) {
          const regex = /filename="(.+?)"/;
          const match = regex.exec(contentDisposition);
          if (match) {
            filename = match[1];
          }
        }

        return { data: response, filename } as ExportDeploymentFileResponse;
      },
    }),
    exportDeploymentGql: builder.query<ExportGQLResponse, { deploymentId: number }>({
      query: ({ deploymentId }) => ({
        url: `deployment/export-deployment-gql/${deploymentId}`,
      }),
      providesTags: ['Deployment'],
    }),
  }),
});

export const {
  useGetPolesByDeploymentIdQuery,
  useExportDeploymentQuery,
  useGetDeploymentByIdQuery,
  useExportDeploymentGqlQuery,
} = deploymentsApi;
