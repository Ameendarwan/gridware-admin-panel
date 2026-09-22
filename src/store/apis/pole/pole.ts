import { CreatePoleResponse, MiscellaneousResponse, SinglePoleResponse } from './types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../utils';

export const poleApi = createApi({
  reducerPath: 'poleApi',
  baseQuery: fetchBaseQuery(baseQuery),
  tagTypes: ['Pole'],
  endpoints: builder => ({
    getPoleById: builder.query<SinglePoleResponse, { poleId: number | null }>({
      query: ({ poleId }) => `pole/${poleId}`,
      providesTags: ['Pole'],
      keepUnusedDataFor: 0,
    }),
    getMiscellaneous: builder.query<MiscellaneousResponse, void>({
      query: () => `miscellaneous/sequence`,
    }),
    createPole: builder.mutation<CreatePoleResponse, { formData: FormData }>({
      query: ({ formData }) => ({
        url: `pole`,
        method: 'POST',
        body: formData,
      }),
    }),
    updatePole: builder.mutation<SinglePoleResponse, { formData: FormData; poleId: number | null }>({
      query: ({ poleId, formData }) => ({
        url: `pole/${poleId}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Pole'],
    }),
  }),
});

export const { useGetMiscellaneousQuery, useGetPoleByIdQuery, useUpdatePoleMutation, useCreatePoleMutation } = poleApi;
