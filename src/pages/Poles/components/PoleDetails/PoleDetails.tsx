'use client';

import * as yup from 'yup';

import { Card, CardContent, CardHeader, CardTitle } from '@app/components/Card/Card';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Equipment,
  FileData,
  ImageType,
  Pole,
  PoleStatus,
  PoleStatusType,
  Strength,
  VegetationCondition,
} from '@app/store/apis/pole/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/components/Form/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import { Badge } from '@app/components/Badge/Badge';
import { Button } from '@app/components/Button/Button';
import { Checkbox } from '@app/components/Checkbox/Checkbox';
import { Device } from '@app/store/apis/devices/types';
import { Input } from '@app/components/Input/Input';
import Loader from '@app/components/Loader/Loader';
import MultiSelect from '@app/components/MultiSelect';
import SearchableDeployments from '@app/components/SearchableDeployments';
import SearchableDevices from '@app/components/SearchableDevices';
import { toast } from 'sonner';
import { urls } from '@app/routes/urls';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  renderInputField,
  renderTextareaField,
  renderSelectField,
  renderSwitchField,
} from '@app/utils/formFieldRenderers';

/**
 * Schema validation using Yup for the pole form.
 * - Ensures that the pole data adheres to the specified validation rules.
 * - Fields include required and optional values like `lat`, `long`, `status`, etc.
 * - Handles file validation for images using a conditional schema.
 */
const formSchema = yup.object().shape({
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
  pole_id: yup.string().required(),
  lat: yup.number().required(),
  long: yup.number().required(),
  status: yup.string().required(),
  status_type: yup.string().required(),
  status_reason: yup.string().optional(),
  devices: yup.array().of(yup.string()).optional(),
  deployment_id: yup.number().required(),
  images: yup.array().when('selectedFiles', ([selectedFiles], schema) => {
    return selectedFiles && selectedFiles.length > 0
      ? schema.of(yup.mixed().test('fileType', 'Invalid file', value => value instanceof File))
      : schema.optional();
  }),
  images_metadata: yup.array().of(yup.string()).optional(),
  vegetation_condition: yup.array().of(yup.string()).optional(),
  network_strength: yup.string().required(),
  solar_strength: yup.string().required(),
  surveyor_notes: yup.string().optional(),
  installation_notes: yup.string().optional(),
  vegetation_notes: yup.string().optional(),
  gate_unlock_mobile_no: yup.string().optional(),
  gate_unlock_address: yup.string().optional(),
  equipments: yup.array().of(yup.string()).optional(),
  transmission_configuration: yup.string().optional(),
  distribution_configuration: yup.string().optional(),
  suitable_for_install: yup.boolean().optional(),
  primary_circuit_protective_equipment: yup.boolean().optional(),
  is_miscellaneous: yup.boolean().optional(),
  disabled: yup.boolean().optional(),
});

const PoleDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = urls.poles.list;
  const [initialData, setInitialData] = useState<Pole>();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fieldRefs = useRef<{
    [key: string]: HTMLElement | null;
  }>({});
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
      pole_id: '',
      lat: undefined,
      long: undefined,
      status: '',
      status_type: '',
      status_reason: '',
      devices: undefined,
      deployment_id: undefined,
      images: [],
      images_metadata: [],
      vegetation_condition: [],
      network_strength: '',
      solar_strength: '',
      surveyor_notes: '',
      installation_notes: '',
      vegetation_notes: '',
      gate_unlock_mobile_no: '',
      gate_unlock_address: '',
      equipments: [],
      transmission_configuration: '',
      distribution_configuration: '',
      suitable_for_install: false,
      primary_circuit_protective_equipment: false,
      is_miscellaneous: false,
      disabled: false,
    },
  });

  const fetchPoleData = useCallback(async () => {
    /**
     * Fetches data for a specific pole when an `id` is provided in the URL parameters.
     * - Calls the API to retrieve pole data.
     * - Resets the form values with the fetched data.
     * - Manages the loading state during data retrieval.
     */
    if (!id) {
      setIsInitialLoading(false);
      return;
    }
    try {
      const response = await API.get(`/pole/${id}`);
      const { data } = response.data;
      setInitialData(data);
      form.reset({
        created_by: data.created_by ?? '',
        updated_by: data.updated_by ?? '',
        pole_id: data.pole_id ?? '',
        lat: data.lat ?? undefined,
        long: data.long ?? undefined,
        status: data.status ?? '',
        status_type: data.status_type ?? '',
        status_reason: data.status_reason ?? '',
        devices: data?.devices?.map((device: Device) => device.serial_no) ?? undefined,
        deployment_id: data.deployment_id ?? undefined,
        images: data.images ?? [],
        images_metadata: data?.images?.map((image: FileData) => image?.extra?.meta_data?.type) ?? [],
        vegetation_condition: data.vegetation_condition ?? [],
        network_strength: data.network_strength ?? '',
        solar_strength: data.solar_strength ?? '',
        surveyor_notes: data.surveyor_notes ?? '',
        installation_notes: data.installation_notes ?? '',
        vegetation_notes: data.vegetation_notes ?? '',
        gate_unlock_mobile_no: data.gate_unlock_mobile_no ?? '',
        gate_unlock_address: data.gate_unlock_address ?? '',
        equipments: data.equipments ?? [],
        transmission_configuration: data.transmission_configuration ?? '',
        distribution_configuration: data.distribution_configuration ?? '',
        suitable_for_install: data.suitable_for_install ?? false,
        primary_circuit_protective_equipment: data.primary_circuit_protective_equipment ?? false,
        is_miscellaneous: data.is_miscellaneous ?? false,
        disabled: data.disabled ?? false,
      });
    } catch (error) {
      console.error('Error fetching pole data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchPoleData();
  }, [fetchPoleData]);

  const handleError = (errors: any) => {
    /**
     * Focuses on the first error field and scrolls to it for better UX during form submission.
     * - Checks if any field has validation errors.
     * - Scrolls and focuses on the first error field if errors are found.
     */
    const firstErrorField = Object.keys(errors)?.[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      fieldRefs.current[firstErrorField]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      fieldRefs.current[firstErrorField]?.focus();
    }
  };

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

  const transformDevicesToObjects = (devices: string[]) => {
    /**
     * Transforms device strings into objects by parsing key-value pairs.
     * - Splits device strings by commas and colons to create object entries.
     * - Handles type conversion for numbers and booleans.
     */
    return devices?.map((device: string) => {
      const entries = device?.split(',')?.map((entry: any) => {
        const parts = entry?.split(':');
        if (!parts || parts.length < 2) return ['', ''];
        const [key, value] = parts;
        let parsedValue;
        if (!Number.isNaN(value)) {
          parsedValue = Number(value);
        } else if (value?.toLowerCase() === 'true' || value?.toLowerCase() === 'false') {
          parsedValue = value?.toLowerCase() === 'true';
        } else {
          parsedValue = value;
        }
        return [key, parsedValue];
      });
      return Object.fromEntries(entries || []);
    });
  };

  const getChangedFields = (poleData: any, initialData?: Pole): Partial<Pole> => {
    /**
     * Compares current form data with initial data to identify changed fields.
     * - Returns only fields that have been modified.
     */
    const changedFields: Partial<Pole> = {};
    for (const key of Object.keys(poleData)) {
      const fieldKey = key as keyof Pole;
      const currentValue = poleData?.[fieldKey];
      const initialValue = initialData?.[fieldKey];

      if (
        JSON.stringify(currentValue) !== JSON.stringify(initialValue) &&
        !['images', 'images_metadata', 'devices'].includes(key)
      ) {
        changedFields[fieldKey] = currentValue;
      }
    }
    return changedFields;
  };

  const buildFormData = (
    changedFields: Partial<Pole>,
    devicesAsObjects: any[],
    selectedImages: File[],
    deletedImageIds: string[]
  ): FormData => {
    /**
     * Builds FormData object for API submission.
     * - Appends pole data, images, metadata, and deleted file IDs.
     */
    const formData = new FormData();

    formData.append(
      'pole_data',
      JSON.stringify({ ...changedFields, ...(devicesAsObjects?.length > 0 && { devices: devicesAsObjects }) })
    );

    const imagesMetadata = selectedImages?.map((image: File) => ({
      filename: image.name,
      type: 'pole',
    }));

    if (imagesMetadata.length) formData.append('images_metadata', JSON.stringify(imagesMetadata));

    if (selectedImages?.length > 0) {
      for (const file of selectedImages) {
        formData.append(`images`, file);
      }
    }

    if (deletedImageIds?.length > 0) {
      formData.append('file_ids', deletedImageIds.join(','));
    }

    return formData;
  };

  const onSubmit = useCallback(
    async (data: any) => {
      /**
       * Handles the form submission for creating or editing a pole.
       * - Collects form data and compares it with initial data to identify changes.
       * - Submits the form with images, metadata, and field values to the API.
       * - Displays success or error toast notifications based on the result of the submission.
       */
      try {
        setIsSaving(true);

        const { devices, ...poleData } = data;

        const devicesAsObjects = mode === undefined || mode === null ? transformDevicesToObjects(devices) : [];

        const changedFields = getChangedFields(poleData, initialData);
        const formData = buildFormData(changedFields, devicesAsObjects, selectedImages, deletedImageIds);

        if (mode === 'edit') {
          await API.patch(`/pole/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          toast.success('Pole updated successfully');
        } else {
          await API.post('/pole', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          toast.success('Pole created successfully');
        }
        navigate(navigateUrl);
      } catch (error) {
        console.error('Error saving pole:', error);
        toast.error('Something went wrong');
      } finally {
        setIsSaving(false);
      }
    },
    [id, mode, navigate, navigateUrl, initialData, selectedImages, deletedImageIds]
  );

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

  const isLoading = isInitialLoading || isSaving;

  return (
    <div className="m-3 rounded-lg border border-gray-300 py-4 shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {(() => {
              if (mode === 'view') return `#${id}`;
              if (mode === 'edit') return `Edit Pole #${id}`;
              return 'New Pole';
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {isLoading ? (
            <Loader width={'150'} height={'150'} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, handleError)} className="space-y-6">
                {renderInputField('pole_id', 'Pole id', mode === 'view', fieldRefs)}
                {renderSelectField(
                  'status',
                  'Status',
                  Object.values(PoleStatus),
                  'Select a Status',
                  mode === 'view',
                  fieldRefs
                )}
                {renderInputField('lat', 'Latitude', mode === 'view', fieldRefs)}
                {renderInputField('long', 'Longitude', mode === 'view', fieldRefs)}
                {renderSelectField(
                  'status_type',
                  'Status type',
                  Object.values(PoleStatusType),
                  'Select a Status Type',
                  mode === 'view',
                  fieldRefs
                )}
                {renderTextareaField('status_reason', 'Status reason', mode === 'view')}

                <FormField
                  name="devices"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>Device(s) SN</FormLabel>
                      <FormControl>
                        {mode === undefined || mode === null ? (
                          <SearchableDevices value={value} onChange={onChange} mode={mode} />
                        ) : (
                          <div>
                            {form.getValues('devices')?.map((device, index) => (
                              <Badge
                                key={`${device}-${index}`}
                                variant="outline"
                                className="bg-[#e8f0f9] p-2 text-secondary">
                                {device}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="deployment_id"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>Deployment</FormLabel>
                      <FormControl>
                        <SearchableDeployments value={value} onChange={onChange} mode={mode} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* <FormField
                  name="images_metadata"
                  render={({ field }) => (
                    <FormItem ref={el => (fieldRefs.current['images_metadata'] = el)}>
                      <FormLabel>Images Types</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={Object.values(ImageType).map((type: string) => ({
                            value: type,
                            label: type,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder="Select Image Type"
                          variant="inverted"
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
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
                    {form.getValues('images')?.map((image: any, index: number) =>
                      image.url ? (
                        <div key={image.file_id || index} className="flex flex-col gap-2">
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
                          <FormField
                            name={`images_metadata.${index}`}
                            render={({ field }) => (
                              <FormItem ref={el => (fieldRefs.current[`images_metadata_${index}`] = el)}>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={form.getValues('images_metadata')?.[index]}
                                    disabled={mode === 'view'}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select image type" />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-36">
                                      {Object.values(ImageType).map((type: string) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                <FormField
                  name="vegetation_condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vegetation condition</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={Object.values(VegetationCondition).map((condition: string) => ({
                            value: condition,
                            label: condition,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder="Select Vegetation Condition"
                          variant="inverted"
                          disabled={mode === 'view'}
                          ref={el => (fieldRefs.current['vegetation_condition'] = el)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderSelectField(
                  'network_strength',
                  'Network strength',
                  Object.values(Strength),
                  'Select Network Strength',
                  mode === 'view',
                  fieldRefs
                )}
                {renderSelectField(
                  'solar_strength',
                  'Solar strength',
                  Object.values(Strength),
                  'Select Solar Strength',
                  mode === 'view',
                  fieldRefs
                )}
                {renderTextareaField('surveyor_notes', 'Surveyor Notes', mode === 'view')}
                {renderTextareaField('installation_notes', 'Device Notes', mode === 'view')}
                {renderTextareaField('vegetation_notes', 'Vegetation Notes', mode === 'view')}
                {renderInputField('gate_unlock_mobile_no', 'Mobile Number', mode === 'view')}
                {renderTextareaField('gate_unlock_address', 'Access Unlock Address', mode === 'view')}
                <FormField
                  name="equipments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipments</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={Object.values(Equipment).map((equipment: string) => ({
                            value: equipment,
                            label: equipment,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder="Select Equipments"
                          variant="inverted"
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderInputField('transmission_configuration', 'Transmission configuration', mode === 'view')}
                {renderInputField('distribution_configuration', 'Distribution configuration', mode === 'view')}
                {renderSwitchField('suitable_for_install', 'Suitable for install', mode === 'view')}
                {renderSwitchField(
                  'primary_circuit_protective_equipment',
                  'Primary circuit protective equipment',
                  mode === 'view'
                )}
                {renderSwitchField('is_miscellaneous', 'Is miscellaneous', mode === 'view')}
                {renderSwitchField('disabled', 'is disabled', mode === 'view')}
                <FormField
                  name="created_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Created by</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={true} />
                      </FormControl>
                      {mode !== 'view' && <FormDescription>Auto populates.</FormDescription>}
                    </FormItem>
                  )}
                />
                <FormField
                  name="updated_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Updated by</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={true} />
                      </FormControl>
                      {mode !== 'view' && <FormDescription>Auto populates.</FormDescription>}
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button variant="destructive" type="button" onClick={() => navigate(navigateUrl)}>
                    {mode === 'view' ? 'Back' : 'Cancel'}
                  </Button>
                  {mode !== 'view' && <Button type="submit">Save</Button>}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PoleDetails;
