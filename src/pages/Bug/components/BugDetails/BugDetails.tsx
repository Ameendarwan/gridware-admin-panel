import * as yup from 'yup';

import { Card, CardContent, CardHeader, CardTitle } from '@app/components/Card/Card';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import { Button } from '@app/components/Button/Button';
import { Checkbox } from '@app/components/Checkbox/Checkbox';
import { Input } from '@app/components/Input/Input';
import Loader from '@app/components/Loader/Loader';
import { toast } from 'sonner';
import { urls } from '@app/routes/urls';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { computeLoadingState, fetchDetailData } from '@app/utils/detailPageUtils';
import { renderTextInputField, renderReadOnlyField } from '@app/utils/formFieldRenderers';

const formSchema = yup.object().shape({
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
  device_model: yup.string().optional(),
  device_mac: yup.string().optional(),
  title: yup.string().optional(),
  description: yup.string().optional(),
  status: yup.string().optional(),
  images: yup.array().when('selectedFiles', (selectedFiles, schema) => {
    const files = selectedFiles as File[];
    if (files && files.length > 0) {
      return schema.of(yup.mixed().test('fileType', 'Invalid file', value => value instanceof File));
    }
    return schema.optional();
  }),

  mobile_db: yup
    .mixed()
    .test('fileType', 'Invalid file', value => {
      if (!(value instanceof File)) return false;
      const allowedExtensions = ['csv', 'xlsx', 'xls'];
      const fileExtension = value.name.split('.').pop()?.toLowerCase();
      return fileExtension ? allowedExtensions.includes(fileExtension) : false;
    })
    .required('File is required'),
});

const BugDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = urls.csv.list;
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [mobileDBDetails, setMobileDBDetails] = useState<any>(null);
  const { id, mode } = useParams();

  const form = useForm({
    resolver: yupResolver(formSchema, {
      context: {
        selectedFiles: selectedImages,
      },
    }),
    defaultValues: {
      created_by: '',
      updated_by: '',
      device_model: '',
      device_mac: '',
      title: '',
      description: '',
      status: '',
      images: [],
      mobile_db: undefined,
    },
  });

  const fetchCSVData = useCallback(async () => {
    /**
     * Callback function that fetches Bug data from the API.
     * - Uses shared utility to fetch and reset form data
     */
    if (!id) {
      setIsInitialLoading(false);
      return;
    }

    await fetchDetailData(
      `/bug/${id}`,
      data => {
        form.reset({
          created_by: data.created_by ?? '',
          updated_by: data.updated_by ?? '',
          device_model: data?.device_model ?? '',
          device_mac: data?.device_mac ?? '',
          title: data?.title ?? '',
          description: data?.description ?? '',
          status: '',
          images: data.images ?? [],
          mobile_db: data?.mobile_db ?? undefined,
        });
        setMobileDBDetails(data?.mobile_db);
      },
      undefined,
      () => setIsInitialLoading(false)
    );
  }, [id, form]);

  useEffect(() => {
    fetchCSVData();
  }, [fetchCSVData]);

  const handleDeleteImage = useCallback((fileId: string) => {
    /**
     * Handles the deletion of images by adding the `fileId` to the list of deleted image IDs.
     * - Updates the state to reflect which image IDs have been deleted.
     * - Prevents duplicate deletion by using a Set.
     */
    if (fileId) {
      setDeletedImageIds(prevState => {
        const updatedSet = new Set([...prevState, fileId]);
        return Array.from(updatedSet);
      });
    }
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    /**
     * Handles file uploads by updating the `selectedImages` state with the uploaded files.
     * - Updates the state with the selected files when the user uploads new files.
     */
    const files = event.target?.files;
    if (files?.length) {
      setSelectedImages(Array.from(files));
    }
  };

  const onSubmit = async (data: any) => {
    /**
     * Handles the form submission for either creating or editing Bug data.
     * - Collects the form data and appends it to a `FormData` object, including the `csv` file.
     * - If in "edit" mode, it makes a PATCH request to update the Bug data.
     * - If in "create" mode, it makes a POST request to create the new Bug.
     * - On success, it shows a toast message indicating whether the Bug was created or updated, and navigates to the specified URL.
     * - If an error occurs, it logs the error and shows a failure toast.
     * - Sets the saving state to false after the operation is complete.
     */
    try {
      setIsSaving(true);
      const formData = new FormData();
      const { csv, ...csvData } = data;
      formData.append('bug_data', JSON.stringify(csvData));
      formData.append('bug', csv);
      if (selectedImages && selectedImages?.length > 0) {
        for (const file of selectedImages) {
          formData.append(`images`, file);
        }
      }

      if (mode === 'edit') {
        await API.patch(`/bug/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Bug updated successfully');
      } else {
        await API.post('/bug', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Bug created successfully');
      }
      navigate(navigateUrl);
    } catch (error) {
      console.error('Error saving Bug:', error);
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = computeLoadingState(isInitialLoading, isSaving);

  return (
    <div className="m-3 rounded-lg border border-gray-300 py-4 shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {(() => {
              if (mode === 'view') return `#${id}`;
              if (mode === 'edit') return `Edit Bug #${id}`;
              return 'New Bug';
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {isLoading ? (
            <Loader width={'150'} height={'150'} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderTextInputField('title', 'Title', true, mode === 'view', 'bug-title')}
                {renderTextInputField('description', 'Description', true, mode === 'view', 'bug-description')}
                {renderTextInputField('device_model', 'Device Model', true, mode === 'view', 'bug-device-model')}
                {renderTextInputField('device_mac', 'Device Mac', true, mode === 'view', 'bug-device_mac')}
                <FormField
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={mode === 'view'}
                          data-testid="bug-status">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="in development">In Development</SelectItem>
                            <SelectItem value="deployed">Deployed</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4 flex flex-col gap-3">
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <Input
                      className="!m-0"
                      type="file"
                      multiple={true}
                      accept=".jpeg, .jpg, .png, .pdf"
                      disabled={mode === 'view'}
                      onChange={handleImageUpload}
                    />
                  </FormControl>
                </div>
                {mode && (form.getValues('images')?.length ?? 0) > 0 && (
                  <div className="flex flex-row flex-wrap justify-center gap-4">
                    {form.getValues('images')?.map((image: any) =>
                      image.url ? (
                        <div key={image.file_id} className="flex flex-col gap-2">
                          <img src={image.url} alt={image.filename} className="!h-36 !w-36 object-cover" />
                          <div className="flex flex-row items-center gap-2">
                            <Checkbox
                              checked={deletedImageIds.includes(image.file_id)}
                              onCheckedChange={() => handleDeleteImage(image.file_id)}
                              aria-label="Select all"
                              disabled={mode === 'view'}
                            />
                            <span className="text-xs">Delete this image</span>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
                <FormField
                  name="mobile_db"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile DB</FormLabel>
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

                {mode && mobileDBDetails?.url && (
                  <div>
                    <a href={mobileDBDetails.url} target="_blank" rel="noreferrer" className="text-accent">
                      <i className="fa-solid fa-file-csv" />
                      {mobileDBDetails?.extra?.meta_data?.filename}
                    </a>
                  </div>
                )}

                {mode && (
                  <>
                    {renderReadOnlyField('created_by', 'Created by', 'csv-created-by', 'Auto populates.')}
                    {renderReadOnlyField('updated_by', 'Updated by', 'csv-updated-by', 'Auto populates.')}
                  </>
                )}

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

export default BugDetails;
