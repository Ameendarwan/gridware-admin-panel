'use client';

import * as yup from 'yup';

import { Card, CardContent, CardHeader, CardTitle } from '@app/components/Card/Card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/components/Form/Form';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@app/components/Button/Button';
import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { Deployment } from '@app/pages/Deployments/types';
import { Input } from '@app/components/Input/Input';
import Loader from '@app/components/Loader/Loader';
import SearchableCustomers from '@app/components/SearchableCustomers';
import SearchableUsers from '@app/components/SearchableUsers';
import { deleteHandler } from '@app/components/DataTable/DataTable.utils';
import { API } from '@app/lib/api-config';
import { toast } from 'sonner';
import { urls } from '@app/routes/urls';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { computeLoadingState, fetchDetailData } from '@app/utils/detailPageUtils';
import { handleApiError } from '@app/utils/errorHandling';

const formSchema = yup.object().shape({
  name: yup.string().optional(),
  location: yup.string().required('Location is required'),
  gridware_id: yup
    .string()
    .when([], (_, schema) => {
      return schema.test('isRequired', 'Gridware UUID is required', function (value) {
        const { mode } = this.options.context || {};
        if (mode === 'edit') {
          return !!value;
        }
        return true;
      });
    })
    .test(
      'validFormat',
      'Please enter a valid UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)',
      function (value) {
        if (!value) return true; // Skip validation if empty
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      }
    ),
  json_file: yup
    .mixed<FileList>()
    .test('fileType', 'Only .json files are allowed', value => {
      if (value && value.length > 0) {
        return value[0].type === 'application/json';
      }
      return true;
    })
    .when([], (_, schema) =>
      schema.test('isRequired', 'JSON file is required', function (value) {
        const { mode } = this.options.context || {};
        if (mode === 'edit') {
          return value && value.length > 0;
        }
        return true;
      })
    ),
  kml_file: yup
    .mixed<FileList>()
    .nullable()
    .optional()
    .test('fileType', 'Only .kml files are allowed', value => {
      if (value && value.length > 0) {
        return value[0].name.endsWith('.kml');
      }
      return true;
    }),
  customer_id: yup.number().optional(),
  user_ids: yup.array().ensure().of(yup.string().required('Invalid user ID')).min(1, 'Please select at least one user'),
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
});

const DeploymentDetails = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const navigateUrl = urls.deployments.list;
  const { id, mode } = useParams();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Deployment>();
  const [isSaving, setIsSaving] = useState(false);
  const [jsonFileDetails, setJsonFileDetails] = useState<any>(null);
  const [kmlFileDetails, setKmlFileDetails] = useState<any>(null);

  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      gridware_id: '',
      json_file: undefined,
      kml_file: undefined,
      customer_id: undefined,
      user_ids: [],
      created_by: '',
      updated_by: '',
    },
  });

  const fetchDeploymentData = useCallback(async () => {
    /**
     * Function that fetches deployment data when the `id` changes or when the component is mounted.
     * - Uses shared utility to fetch and reset form data
     */
    if (!id) {
      setIsInitialLoading(false);
      return;
    }

    await fetchDetailData(
      `/deployment/${id}`,
      data => {
        setInitialData(data);
        form.reset({
          created_by: data.created_by ?? '',
          updated_by: data.updated_by ?? '',
          name: data.name ?? '',
          location: data.location ?? '',
          gridware_id: data.gridware_id ?? '',
          customer_id: data.customer_id ?? undefined,
          user_ids: data.users?.map((user: any) => user.id) ?? undefined,
        });
        setJsonFileDetails(data?.file_path);
        setKmlFileDetails(data?.kml_path);
      },
      undefined,
      () => setIsInitialLoading(false)
    );
  }, [id, form]);

  useEffect(() => {
    /**
     * Effect hook that fetches deployment data when the component is mounted or when the `id` changes.
     * - Calls `fetchDeploymentData` to fetch and populate the form with the deployment data.
     * - Ensures that the component always has the most recent data when loaded or when the `id` changes.
     */
    fetchDeploymentData();
  }, [fetchDeploymentData]);

  const onSubmit = useCallback(
    async (data: any) => {
      /**
       * Function to handle form submission for creating or updating a deployment.
       * - Compares each field's current value to its initial value to identify changed fields.
       * - Creates a `FormData` object to submit the data, including any file uploads (JSON and KML).
       * - If the mode is 'edit', it sends a PATCH request to update the existing deployment.
       * - If the mode is not 'edit', it sends a POST request to create a new deployment.
       * - Displays a success message based on the operation (create or update) and navigates to the next page.
       * - Handles any errors that may occur during the request and displays an error toast.
       * - Ensures the loading state is set to true during the request and false once it completes.
       */
      try {
        setIsSaving(true);

        const formData = new FormData();
        const changedFields: Partial<Deployment> = {};
        const { json_file, kml_file, user_ids, ...deploymentData } = data;

        for (const key of Object.keys(data)) {
          const fieldKey = key as keyof Deployment;
          const currentValue = deploymentData?.[fieldKey];
          const initialValue = initialData?.[fieldKey];
          if (JSON.stringify(currentValue) !== JSON.stringify(initialValue)) {
            changedFields[fieldKey] = currentValue;
          }
        }

        formData.append('deployment_data', JSON.stringify({ ...changedFields }));

        if (json_file) {
          formData.append('json_file', json_file);
        }
        if (kml_file) {
          formData.append('kml_file', kml_file);
        }

        if (mode === 'edit') {
          await API.patch(`/deployment/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            params: {
              user_ids,
            },
            paramsSerializer: params => {
              const searchParams = new URLSearchParams();
              if (Array.isArray(params.user_ids)) {
                for (const id of params.user_ids) {
                  searchParams.append('user_ids', id);
                }
              }
              return searchParams.toString();
            },
          });
          toast.success('Deployment updated successfully');
        } else {
          await API.post('/deployment', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            params: {
              user_ids,
            },
            paramsSerializer: params => {
              const searchParams = new URLSearchParams();
              if (Array.isArray(params.user_ids)) {
                for (const id of params.user_ids) {
                  searchParams.append('user_ids', id);
                }
              }
              return searchParams.toString();
            },
          });
          toast.success('Deployment created successfully');
        }
        navigate(navigateUrl);
      } catch (error) {
        const errorMessage = handleApiError(error, 'Error saving deployment');
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [id, mode, navigate, navigateUrl]
  );

  const handleDeleteDeployment = async () => {
    await deleteHandler({
      id,
      url: '/deployment/all',
      setSearchParams,
    });
    navigate(urls.deployments.list);
  };

  const getCardTitle = () => {
    if (mode === 'view') {
      return `#${id}`;
    }
    if (mode === 'edit') {
      return `Edit Deployment #${id}`;
    }
    return 'New Deployment';
  };

  const isLoading = computeLoadingState(isInitialLoading, isSaving);

  return (
    <div className="m-3 min-h-[55rem] rounded-lg border border-gray-300 py-4 shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{getCardTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[55rem] overflow-y-auto">
          {isLoading ? (
            <Loader width={'150'} height={'150'} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployment Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={mode === 'view'} data-testid="deployment-name" />
                      </FormControl>
                      {mode !== 'view' && (
                        <FormDescription>
                          Leave this field empty to auto-populate from the JSON upload. Because, if you assign a name
                          here, it will override the auto-population from the JSON upload.
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Location <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} required disabled={mode === 'view'} data-testid="deployment-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode === 'edit' && (
                  <FormField
                    name="gridware_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Gridware UUID <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} required data-testid="deployment-gridware-id" />
                        </FormControl>
                        <FormDescription>Please provide the Unique Deployment Gridware UUID here.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  name="json_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        JSON File <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          data-testid="deployment-json-file"
                          type="file"
                          accept=".json"
                          onChange={e => field.onChange(e.target.files?.[0])}
                          disabled={mode === 'view' ||  mode === 'edit'}
                          required={!jsonFileDetails?.url}
                        />
                      </FormControl>
                      {mode !== 'view' && <FormDescription>Accepted format: .json</FormDescription>}
                    </FormItem>
                  )}
                />
                {mode && jsonFileDetails?.url && (
                  <div>
                    <a
                      href={jsonFileDetails.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-x-1 text-accent">
                      <i className="fa-solid fa-file" />
                      {jsonFileDetails?.filename}
                    </a>
                  </div>
                )}
                <FormField
                  name="kml_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Info Map Overlay</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="deployment-kml-file"
                          type="file"
                          accept=".kml"
                          onChange={e => field.onChange(e.target.files?.[0])}
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                      {mode !== 'view' && <FormDescription>Accepted format: .kml</FormDescription>}
                    </FormItem>
                  )}
                />
                {mode && kmlFileDetails?.url && (
                  <div>
                    <a
                      href={kmlFileDetails.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-x-1 text-accent">
                      <i className="fa-solid fa-file" />
                      {kmlFileDetails?.filename}
                    </a>
                  </div>
                )}
                <FormField
                  name="customer_id"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <SearchableCustomers value={value} onChange={onChange} mode={mode} />
                      </FormControl>
                      {mode !== 'view' && (
                        <FormDescription>
                          Leave this field empty to auto-populate from the JSON upload. Because, if you assign a name
                          here, it will override the auto-population from the JSON upload.
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  name="user_ids"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>
                        Users <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <SearchableUsers value={value} onChange={onChange} mode={mode} />
                      </FormControl>
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
                            <Input {...field} disabled={true} data-testid="deployment-created-by" />
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
                            <Input {...field} disabled={true} data-testid="deployment-updated-by" />
                          </FormControl>
                          <FormDescription>Auto populates.</FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div className="flex justify-end gap-4">
                  <ConfirmationDialog
                    title="Delete Deployment"
                    description="Are you sure you want to DELETE this deployment?"
                    triggerComponent={
                      <Button data-testid="delete-btn" variant="destructive" type="button">
                        Delete
                      </Button>
                    }
                    confirmationComponent={
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded bg-redShades-shade1"
                        onClick={handleDeleteDeployment}>
                        Yes, delete
                      </Button>
                    }
                  />

                  <Button
                    data-testid="cancel-btn"
                    variant="destructive"
                    type="button"
                    onClick={() => navigate(navigateUrl)}
                    disabled={isLoading}>
                    {mode === 'view' ? 'Back' : 'Cancel'}
                  </Button>
                  {mode !== 'view' && (
                    <Button type="submit" disabled={isLoading} data-testid="save-btn">
                      Save
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentDetails;
