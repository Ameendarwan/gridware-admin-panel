import * as yup from 'yup';

import { Device, DeviceTypes, OrientationOptions } from '@app/store/apis/devices/types';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Input } from '@app/components/Input/Input';
import SearchablePoles from '@app/components/SearchablePoles';
import { Switch } from '@app/components/Switch/Switch';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DetailPageWrapper from '@app/components/DetailPageWrapper';
import { getDetailPageTitle } from '@app/utils/formUtils';
import { computeLoadingState, fetchDetailData, submitDetailForm } from '@app/utils/detailPageUtils';

const formSchema = yup.object().shape({
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
  serial_no: yup
    .string()
    .required('Serial number is required')
    .matches(/^GS\d{8}$/, 'Serial number must follow the format GS followed by 8 digits'),
  type: yup.string().optional(),
  solar_orientation: yup.string().optional(),
  is_blinked: yup.boolean().optional(),
  pole_id: yup.number().optional(),
});

const DeviceDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = -1;
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { id, mode } = useParams();

  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      created_by: '',
      updated_by: '',
      serial_no: '',
      type: '',
      solar_orientation: '',
      is_blinked: false,
      pole_id: undefined,
    },
  });

  const fetchDeviceData = useCallback(async () => {
    /**
     * Fetches device data from the API when a valid `id` is provided.
     * - Uses shared utility to fetch and reset form data
     */
    if (!id) {
      setIsInitialLoading(false);
      return;
    }

    await fetchDetailData(
      `/device/${id}`,
      data => {
        form.reset({
          created_by: data.created_by ?? '',
          updated_by: data.updated_by ?? '',
          serial_no: data.serial_no ?? '',
          type: data.type ?? '',
          solar_orientation: data.solar_orientation ?? '',
          is_blinked: data.is_blinked ?? false,
          pole_id: data.pole_id ?? undefined,
        });
      },
      undefined,
      () => setIsInitialLoading(false)
    );
  }, [id, form]);

  useEffect(() => {
    /**
     * Effect hook that fetches the device data when the component mounts or the `id` parameter changes.
     * - Calls `fetchDeviceData` to load device data.
     * - Runs on initial render and whenever the `id` changes.
     */
    fetchDeviceData();
  }, [fetchDeviceData]);

  const onSubmit = async (data: Partial<Device>) => {
    /**
     * Handles form submission to create or update a device.
     * - Uses shared utility for consistent submit handling
     */
    setIsSaving(true);
    await submitDetailForm({
      mode,
      endpoint: '/device',
      id,
      data,
      entityName: 'Device',
      onSuccess: () => navigate(navigateUrl),
    });
    setIsSaving(false);
  };

  const isLoading = computeLoadingState(isInitialLoading, isSaving);

  return (
    <DetailPageWrapper
      title={getDetailPageTitle(mode, id, 'Device')}
      isLoading={isLoading}
      mode={mode}
      form={form}
      onSubmit={onSubmit}
      onCancel={() => navigate(navigateUrl)}>
      <FormField
        name="serial_no"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Serial no</FormLabel>
            <FormControl>
              <Input {...field} disabled={mode === 'view'} type="text" data-testid="device-serial_no" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={mode === 'view'}
                data-testid="device-type">
                <SelectTrigger>
                  <SelectValue placeholder="Select a Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceTypes).map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="pole_id"
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel>Pole</FormLabel>
            <FormControl>
              <SearchablePoles value={value} onChange={onChange} mode={mode} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="solar_orientation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Solar Orientation</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={mode === 'view'}
                data-testid="device-solar-orientation">
                <SelectTrigger>
                  <SelectValue placeholder="Select a Solar orientation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrientationOptions).map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="is_blinked"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Is blinked</FormLabel>
            <FormControl>
              <div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={mode === 'view'}
                  data-testid="device-is-blinked"
                />
              </div>
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
                  <Input {...field} disabled={true} data-testid="device-created_by" />
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
                  <Input {...field} disabled={true} data-testid="device-updated_by" />
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

export default DeviceDetails;
