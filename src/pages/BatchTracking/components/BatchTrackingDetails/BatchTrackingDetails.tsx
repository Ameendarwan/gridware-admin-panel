'use client';

import * as yup from 'yup';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import { BatchTrackingFormValues } from '../../types';
import { Input } from '@app/components/Input/Input';
import { Switch } from '@app/components/Switch/Switch';
import { formatDate } from '@app/components/DataTable/DataTable.utils';
import { urls } from '@app/routes/urls';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DetailPageWrapper from '@app/components/DetailPageWrapper';
import { getDetailPageTitle } from '@app/utils/formUtils';

const formSchema = yup.object().shape({
  id: yup.string().required(),
  data_type: yup.string().optional(),
  is_completed: yup.boolean().optional(),
  total: yup.number().optional(),
  data: yup.object().optional(),
  request_data: yup.array().of(yup.object()).optional(),
  errors: yup.array().of(yup.object()).optional(),
  requested_by: yup.string().optional(),
  created_at: yup.string().optional(),
  updated_at: yup.string().optional(),
});

const BatchTrackingDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = urls.users.list;
  const { id, mode } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      id: '',
      data_type: '',
      is_completed: false,
      data: {},
      request_data: [],
      errors: [],
      requested_by: '',
      total: 0,
      created_at: '',
      updated_at: '',
    },
  });

  useEffect(() => {
    /**
     * Effect hook that fetches data from an API when the `id` is available.
     * - If `id` exists, it triggers a request to fetch the status from the server.
     * - Upon success, the data is populated into the form fields.
     * - The `isLoading` state is set to `true` when the request starts and `false` when it finishes.
     */
    if (id) {
      setIsLoading(true);
      API.get(`/status/${id}`)
        .then(resp => {
          const { data } = resp.data;
          form.setValue('id', data.id ?? '');
          form.setValue('data_type', data.data_type ?? '');
          form.setValue('is_completed', data.is_completed ?? false);
          form.setValue('total', data.total ?? 0);
          form.setValue('data', data.data ?? []);
          form.setValue('request_data', data.request_data ?? []);
          form.setValue('errors', data.errors ?? []);
          form.setValue('requested_by', data.requested_by ?? '');
          form.setValue('created_at', data.created_at ?? '');
          form.setValue('updated_at', data.updated_at ?? '');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const onSubmit = (data: BatchTrackingFormValues) => {
    /**
     * Handles form submission.
     * - Sends the form data to the API using a POST request.
     * - Navigates to a users list page (defined by `navigateUrl`) after the request succeeds.
     */
    API.post('/user', data).then(() => navigate(navigateUrl));
  };

  return (
    <DetailPageWrapper
      title={getDetailPageTitle(mode, id, 'Batch Tracking')}
      isLoading={isLoading}
      mode={mode}
      form={form}
      onSubmit={onSubmit}
      onCancel={() => navigate(navigateUrl)}>
      <FormField
        name="id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Id <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} required disabled={mode === 'view'} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="created_at"
        render={({ field: { value, ...rest } }) => (
          <FormItem>
            <FormLabel>Created at</FormLabel>
            <FormControl>
              <Input
                value={form.getValues('created_at') ? formatDate(value) : ''}
                {...rest}
                disabled={mode === 'view'}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="updated_at"
        render={({ field: { value, ...rest } }) => (
          <FormItem>
            <FormLabel>Updated at</FormLabel>
            <FormControl>
              <Input
                value={form.getValues('updated_at') ? formatDate(value) : ''}
                {...rest}
                disabled={mode === 'view'}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="data_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date type</FormLabel>
            <FormControl>
              <Input {...field} disabled={mode === 'view'} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name="total"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total</FormLabel>
            <FormControl>
              <Input {...field} disabled={mode === 'view'} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="request_data"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Request data</FormLabel>
            <FormControl>
              <div>{JSON.stringify(field.value, null, 1)}</div>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="data"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data</FormLabel>
            <FormControl>
              <div>{JSON.stringify(field.value, null, 1)}</div>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="requested_by"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Request by</FormLabel>
            <FormControl>
              <Input {...field} disabled={mode === 'view'} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="is_completed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Is completed</FormLabel>
            <FormControl>
              <div>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={mode === 'view'} />
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="errors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Errors</FormLabel>
            <FormControl>
              <div>{JSON.stringify(field.value, null, 1)}</div>
            </FormControl>
          </FormItem>
        )}
      />
    </DetailPageWrapper>
  );
};

export default BatchTrackingDetails;
