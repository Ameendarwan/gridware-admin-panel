import {
  CreateEdgeResponse,
  DeleteEdgesResponse,
  EdgesResponse,
  SingleEdgeResponse,
  SpanUpdatePayload,
  SpansResponse,
} from './types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { Edge } from '@app/pages/Deployments/components/MapBox/types';
import { baseQuery } from '../../utils';

export const edgeApi = createApi({
  reducerPath: 'edgeApi',
  baseQuery: fetchBaseQuery(baseQuery),
  tagTypes: ['Edges', 'Spans'],
  endpoints: builder => ({
    getSpansByDeploymentId: builder.query<SpansResponse, { deploymentId: string }>({
      query: ({ deploymentId }) => `span/all?where={"and":[{"deployment_id":{"eq": "${deploymentId}"}}]}`,
      providesTags: ['Spans'],
    }),
    getEdgesById: builder.query<EdgesResponse, { deploymentId: string; skip: number }>({
      query: ({ deploymentId, skip }) =>
        `edge/all?skip=${skip}&limit=500&where={"and":[{"deployment_id":{"eq": "${deploymentId}"}}]}&order_by=id desc`,
      providesTags: ['Edges'],
    }),
    getEdgeById: builder.query<SingleEdgeResponse, { edgeId: number }>({
      query: ({ edgeId }) => `edge/${edgeId}`,
      providesTags: ['Edges'],
    }),
    createBulkEdges: builder.mutation<CreateEdgeResponse, { edges: Edge[]; skipInvalidation?: boolean }>({
      query: ({ edges }) => ({
        url: `edge/bulk`,
        method: 'POST',
        body: edges,
      }),
      invalidatesTags: (_result, _error, arg) => (arg?.skipInvalidation ? [] : ['Edges', 'Spans']),
    }),
    deleteEdges: builder.mutation<DeleteEdgesResponse, { selectedEdgeIds: number[]; skipInvalidation?: boolean }>({
      query: ({ selectedEdgeIds }) => ({
        url: 'edge/bulk-delete',
        method: 'POST',
        body: {
          edge_ids: selectedEdgeIds,
        },
      }),
      invalidatesTags: (_result, _error, arg) => (arg?.skipInvalidation ? [] : ['Edges', 'Spans']),
    }),
    updateSpans: builder.mutation<{ message: string }, { body: SpanUpdatePayload; deploymentId: string }>({
      query: ({ body, deploymentId }) => ({
        url: `span/deployment/${deploymentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Spans', 'Edges'],
    }),
  }),
});

export const {
  useUpdateSpansMutation,
  useGetSpansByDeploymentIdQuery,
  useGetEdgesByIdQuery,
  useGetEdgeByIdQuery,
  useCreateBulkEdgesMutation,
  useDeleteEdgesMutation,
} = edgeApi;
