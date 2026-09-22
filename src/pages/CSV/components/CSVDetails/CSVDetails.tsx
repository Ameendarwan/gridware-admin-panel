import * as yup from 'yup';

import { Card, CardContent, CardHeader, CardTitle } from '@app/components/Card/Card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import { Button } from '@app/components/Button/Button';
import { Input } from '@app/components/Input/Input';
import Loader from '@app/components/Loader/Loader';
import SearchableDeployments from '@app/components/SearchableDeployments';
import { toast } from 'sonner';
import { urls } from '@app/routes/urls';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { computeLoadingState, fetchDetailData } from '@app/utils/detailPageUtils';
import { renderReadOnlyField } from '@app/utils/formFieldRenderers';

const formSchema = yup.object().shape({
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
  deployment_id: yup.number().required(),
  csv: yup
    .mixed()
    .test('fileType', 'Invalid file', value => {
      if (!(value instanceof File)) return false;
      const allowedExtensions = ['csv', 'xlsx', 'xls'];
      const fileExtension = value.name.split('.').pop()?.toLowerCase();
      return fileExtension ? allowedExtensions.includes(fileExtension) : false;
    })
    .required('File is required'),
});

const CSVDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = urls.csv.list;
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [csvDetails, setCSVDetails] = useState<any>(null);
  const { id, mode } = useParams();

  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      created_by: '',
      updated_by: '',
      deployment_id: undefined,
      csv: undefined,
    },
  });

  const fetchCSVData = useCallback(async () => {
    /**
     * Callback function that fetches CSV data from the API.
     * - Uses shared utility to fetch and reset form data
     */
    if (!id) {
      setIsInitialLoading(false);
      return;
    }

    await fetchDetailData(
      `/csv/${id}`,
      data => {
        form.reset({
          created_by: data.created_by ?? '',
          updated_by: data.updated_by ?? '',
          deployment_id: data.deployment_id ?? undefined,
          csv: data.csv ?? undefined,
        });
        setCSVDetails(data.file_path);
      },
      undefined,
      () => setIsInitialLoading(false)
    );
  }, [id, form]);

  useEffect(() => {
    fetchCSVData();
  }, [fetchCSVData]);

  const onSubmit = async (data: any) => {
    /**
     * Handles the form submission for either creating or editing CSV data.
     * - Collects the form data and appends it to a `FormData` object, including the `csv` file.
     * - If in "edit" mode, it makes a PATCH request to update the CSV data.
     * - If in "create" mode, it makes a POST request to create the new CSV.
     * - On success, it shows a toast message indicating whether the CSV was created or updated, and navigates to the specified URL.
     * - If an error occurs, it logs the error and shows a failure toast.
     * - Sets the saving state to false after the operation is complete.
     */
    try {
      setIsSaving(true);
      const formData = new FormData();
      const { csv, ...csvData } = data;
      formData.append('csv_data', JSON.stringify(csvData));
      formData.append('csv', csv);

      if (mode === 'edit') {
        await API.patch(`/csv/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('CSV updated successfully');
      } else {
        await API.post('/csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('CSV created successfully');
      }
      navigate(navigateUrl);
    } catch (error) {
      console.error('Error saving CSV:', error);
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const getCardTitle = () => {
    if (mode === 'view') {
      return `#${id}`;
    }
    if (mode === 'edit') {
      return `Edit CSV #${id}`;
    }
    return 'New CSV';
  };

  const isLoading = computeLoadingState(isInitialLoading, isSaving);

  return (
    <div className="m-3 rounded-lg border border-gray-300 py-4 shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{getCardTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {isLoading ? (
            <Loader width={'150'} height={'150'} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  name="deployment_id"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>Deployment</FormLabel>
                      <FormControl>
                        <SearchableDeployments value={value} onChange={onChange} mode={mode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="csv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSV</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="csv-file"
                          type="file"
                          accept=".csv, .xls, .xlsx"
                          disabled={mode === 'view'}
                          onChange={e => {
                            const file = e.target.files?.[0] || null;
                            field.onChange(file);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode && csvDetails?.url && (
                  <div>
                    <a href={csvDetails.url} target="_blank" rel="noreferrer" className="text-accent">
                      <i className="fa-solid fa-file-csv" />
                      {csvDetails?.extra?.meta_data?.filename}
                    </a>
                  </div>
                )}

                {renderReadOnlyField('created_by', 'Created by', 'csv-created-by', 'Auto populates.')}
                {renderReadOnlyField('updated_by', 'Updated by', 'csv-updated-by', 'Auto populates.')}

                <div className="flex justify-end gap-4">
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

export default CSVDetails;
