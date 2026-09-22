import { Device, DeviceResponse, SingleDeviceResponse } from './types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { Dispatch } from '@reduxjs/toolkit';
import { baseQuery } from '../../utils';
import { poleApi } from '../pole/pole';

type InvalidatePoleDataParams = {
  dispatch: Dispatch;
  queryFulfilled: Promise<unknown>;
};

// Common function to invalidate pole data
const invalidatePoleData = async ({ dispatch, queryFulfilled }: InvalidatePoleDataParams) => {
  await queryFulfilled;
  dispatch(poleApi.util.invalidateTags([{ type: 'Pole' }]));
};

export const devicesApi = createApi({
  reducerPath: 'DevicesApi',
  baseQuery: fetchBaseQuery(baseQuery),
  tagTypes: ['Device'],
  endpoints: builder => ({
    getAllDevices: builder.query<DeviceResponse, { poleId: number | null }>({
      query: ({ poleId }) => ({
        url: `device/all`,
        params: { ...(poleId && { where: JSON.stringify({ and: [{ pole_id: { eq: poleId } }] }) }) },
      }),

      providesTags: ['Device'],
    }),

    getDeviceById: builder.query<SingleDeviceResponse, { deviceId: number | null }>({
      query: ({ deviceId }) => `device/${deviceId}`,
      providesTags: ['Device'],
    }),

    createDevice: builder.mutation<SingleDeviceResponse, { body: Partial<Device> }>({
      query: ({ body }) => ({
        url: `device`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Device'],
      // Invalidating the pole related to the deleted device
      onQueryStarted(args, api) {
        invalidatePoleData(api);
      },
    }),

    updateDevice: builder.mutation<SingleDeviceResponse, { body: Partial<Device>; deviceId: number | null }>({
      query: ({ deviceId, body }) => ({
        url: `device/${deviceId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Device'],
      // Invalidating the pole related to the deleted device
      onQueryStarted(args, api) {
        invalidatePoleData(api);
      },
    }),

    deleteDevice: builder.mutation<SingleDeviceResponse, { deviceId: number | null }>({
      query: ({ deviceId }) => ({
        url: `device/${deviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Device'],
      // Invalidating the pole related to the deleted device
      onQueryStarted(args, api) {
        invalidatePoleData(api);
      },
    }),
  }),
});

export const {
  useGetAllDevicesQuery,
  useGetDeviceByIdQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} = devicesApi;
