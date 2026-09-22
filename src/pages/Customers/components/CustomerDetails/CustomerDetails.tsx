'use client';

import * as yup from 'yup';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import { Customer } from '../../types';
import { Input } from '@app/components/Input/Input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DetailPageWrapper from '@app/components/DetailPageWrapper';
import { getDetailPageTitle } from '@app/utils/formUtils';
import { handleApiError } from '@app/utils/errorHandling';

const formSchema = yup.object().shape({
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
  name: yup.string().required('Name is required'),
  description: yup.string().optional(),
  gridware_id: yup
    .string()
    .required('Gridware UUID is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'Please enter a valid UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)'
    ),
});

const CustomerDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = -1;
  const { id, mode } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      created_by: '',
      updated_by: '',
      name: '',
      description: '',
      gridware_id: '',
    },
  });

  useEffect(() => {
    /**
     * Effect hook that fetches customer data when the component is mounted or when the `id` changes.
     * - If the `id` is available, it triggers an API request to fetch the customer details.
     * - On successful response, it sets the customer details to the form fields using `form.setValue`.
     * - Ensures that the `isLoading` state is set to true during the request and false once the request completes or fails.
     * - This hook ensures that the form is populated with the latest customer data whenever the `id` changes.
     */
    if (id) {
      setIsLoading(true);
      API.get(`/customer/${id}`)
        .then(resp => {
          const { data } = resp.data;
          form.setValue('name', data.name ?? '');
          form.setValue('description', data.description ?? '');
          form.setValue('gridware_id', data.gridware_id ?? '');
          form.setValue('created_by', data.created_by ?? '');
          form.setValue('updated_by', data.updated_by ?? '');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const onSubmit = async (data: Customer) => {
    /**
     * Function to handle form submission for creating or updating a customer.
     * - If the mode is 'edit', it sends a PATCH request to update the existing customer.
     * - If the mode is not 'edit', it sends a POST request to create a new customer.
     * - Displays a success message based on the operation (create or update) and navigates to the next page.
     * - Handles any errors that may occur during the request and displays an error toast.
     * - Ensures the loading state is set to true during the request and false once it completes.
     */
    try {
      setIsLoading(true);
      if (mode === 'edit') {
        await API.patch(`/customer/${id}`, data);
        toast.success('Customer updated successfully');
      } else {
        await API.post('/customer', data);
        toast.success('Customer created successfully');
      }
      navigate(navigateUrl);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error saving customer');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DetailPageWrapper
      title={getDetailPageTitle(mode, id, 'Customer')}
      isLoading={isLoading}
      mode={mode}
      form={form}
      onSubmit={onSubmit}
      onCancel={() => navigate(navigateUrl)}>
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Name <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} required disabled={mode === 'view'} data-testid="customer-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} required disabled={mode === 'view'} data-testid="customer-description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="gridware_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Gridware UUID <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} required disabled={mode === 'view'} data-testid="customer-gridware-id" />
            </FormControl>
            {mode !== 'view' && (
              <FormDescription>Please provide the Unique Customer Gridware UUID here.</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      {mode && (
        <>
          <FormField
            name="created_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Created by</FormLabel>
                <FormControl>
                  <Input {...field} disabled={true} data-testid="customer-created-by" />
                </FormControl>
                <FormDescription>Auto populates.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            name="updated_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Updated by</FormLabel>
                <FormControl>
                  <Input {...field} disabled={true} data-testid="customer-updated-by" />
                </FormControl>
                <FormDescription>Auto populates.</FormDescription>
              </FormItem>
            )}
          />
        </>
      )}
    </DetailPageWrapper>
  );
};

export default CustomerDetails;
