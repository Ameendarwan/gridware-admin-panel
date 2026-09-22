import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

import { ControllerRenderProps, useForm } from 'react-hook-form';
import {
  DEVICE_CONNECTIVITY_VALUE,
  DEVICE_DISPLAY_NAMES,
  DEVICE_LIMITS,
  DEVICE_TYPES,
  DeviceDisplayName,
  validatePoleAccessEfforts,
  validateStatusTypesForInaccessiblePhoto,
} from './EditPole.utils';
import { Device, OrientationOptions } from '@app/store/apis/devices/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { ImageType, MetaData, Pole, StatusType } from '@app/store/apis/pole/types';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { getMode, setSelectedFromPole } from '@app/store/slices/edgesSlice';
import {
  getPoleMarkerName,
  poleLabelOptionsForCreate,
  poleLabelOptionsForEdit,
  poleStatuses,
  poleStatusesMap,
} from '../../MapBox.utils';
import {
  removeDeviceFromPole,
  setIsAddingPole,
  setIsMovingPole,
  setIsPoleLoading,
  setNewPoleCoordinates,
  setPoles,
  updatePoleDevices,
  updatePoleInState,
} from '@app/store/slices/polesSlice';
import {
  useCreateDeviceMutation,
  useDeleteDeviceMutation,
  useUpdateDeviceMutation,
} from '@app/store/apis/devices/devices';
import { useCreatePoleMutation, useGetMiscellaneousQuery, useUpdatePoleMutation } from '@app/store/apis/pole/pole';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@app/components/Button/Button';
import { Card } from '@app/components/Card/Card';
import ConfirmationDialog from '@app/components/ConfirmationDialog/ConfirmationDialog';
import DateTimePicker from 'react-datetime-picker';
import { EditPoleProps } from './types';
import { Input } from '@app/components/Input/Input';
import { Label } from '@app/components/Label/Label';
import { MapMode } from '../../types';
import MultiSelectOption from './components/MultiSelectOption';
import PoleImageSection from '../PoleImageSection';
import { RootState } from '@app/store';
import { Separator } from '@app/components/Separator/Separator';
import SingleSelectOption from './components/SingleSelectOption';
import { Textarea } from '@app/components/TextArea/Textarea';
import { XIcon } from 'lucide-react';
import { PoleStatus, validatePole } from '@app/hooks/usePoleValidations';
import { formatDate } from '@app/utils/formatDate';
import { isEqual } from 'lodash';
import { toast } from 'sonner';
import CopyCoordinatesButton from '../CopyCoordinatesButton';

const EditPole: FC<EditPoleProps> = ({ pole, handleEditPole }) => {
  const dispatch = useDispatch();
  const { id: deploymentId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = useSelector(getMode);

  const newPoleCoordinates = useSelector((state: RootState) => state.poles.newPoleCoordinates);
  const isLoading = useSelector((state: RootState) => state.poles.isPoleLoading);
  const mapRef = useSelector((state: RootState) => state.poles.mapRef);
  const isMovingPole = useSelector((state: RootState) => state.poles.isMovingPole);
  const poles = useSelector((state: RootState) => state.poles.polesList);

  const selectedPoleDetails = useMemo(() => poles.find(poleObj => poleObj.id === pole?.id), [poles, pole]);

  const poleIconName = selectedPoleDetails ? getPoleMarkerName(selectedPoleDetails) : 'marker-gs';

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletedFilesIds, setDeletedFilesIds] = useState<string[]>([]);
  const [selectedImageTypes, setSelectedImageTypes] = useState<string[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceDisplayName | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number | string; long: number | string }>({ lat: 0, long: 0 });
  const [tempPoleId, setTempPoleId] = useState('');
  const [tempStatusReason, setTempStatusReason] = useState('');
  const [showDeviceValidation, setShowDeviceValidation] = useState(false);

  const [
    updatePole,
    { isLoading: isPoleUpdating, isSuccess: updateSuccess, isError: isUpdateError, error: updateError },
  ] = useUpdatePoleMutation();
  const [createPole, { isLoading: isPoleCreating }] = useCreatePoleMutation();
  const [createDevice, { isLoading: isDeviceCreating }] = useCreateDeviceMutation();
  const [updateDevice, { isLoading: isDeviceUpdating }] = useUpdateDeviceMutation();
  const [deleteDevice, { isLoading: isDeviceDeleting }] = useDeleteDeviceMutation();
  const { data: miscellaneousData } = useGetMiscellaneousQuery();

  const form = useForm<Pole>({
    defaultValues: { ...pole },
  });

  const status = form.getValues('status');
  const devices = form.getValues('devices') || [];
  const isInstalled = status === 'installed' && devices.length > 0;

  const shouldUpdate = (fieldName: string) =>
    !isEqual(pole?.[fieldName as keyof typeof pole], form.getValues(fieldName as keyof typeof pole));

  const handleResetForm = useCallback(() => {
    const poleData = structuredClone(pole);

    // Map null values to empty strings for specific fields
    if (poleData) {
      poleData.installation_notes = poleData.installation_notes ?? '';
      poleData.vegetation_notes = poleData.vegetation_notes ?? '';
      poleData.installed_at = poleData.installed_at ?? null;
    }

    form.reset({ ...poleData });
  }, [pole]);

  useEffect(() => {
    if (isUpdateError) {
      handleResetForm();
      const statusCode = 'status' in updateError ? updateError.status : null;
      toast.error(
        statusCode === 'FETCH_ERROR'
          ? 'The payload is too large. Please reduce the size and try again.'
          : 'Failed to update pole'
      );
    }
  }, [isUpdateError, handleResetForm]);

  useEffect(() => {
    if (updateSuccess) {
      toast.dismiss();
      toast.success('Pole updated successfully');
    }
  }, [updateSuccess]);

  useEffect(() => {
    dispatch(setIsMovingPole(false));
  }, [pole?.id]);

  useEffect(() => {
    /**
     * Effect hook that resets the form values when `pole` or `form` changes.
     * - It resets the form with the current pole data using a deep clone to avoid mutations.
     */
    if (pole?.id) dispatch(setSelectedFromPole(pole?.id));
    handleResetForm();
    if (pole?.lat && pole?.long) setCoordinates({ lat: pole?.lat, long: pole?.long });
    if (pole?.pole_id) setTempPoleId(pole?.pole_id);
  }, [pole, form]);

  useEffect(() => {
    if (pole?.devices?.length) {
      form.setValue('devices.0.type', pole?.devices?.[0]?.type);
      setSelectedDeviceType(pole?.devices?.[0]?.type);
    }
  }, [pole, form, handleResetForm]);

  /**
   * Derived state to check if the current mode is pole addition mode.
   * - It returns true if the mode is `MapMode.POLEADD`, indicating that the user is in the process of adding a new pole.
   */
  const isPoleAddMode = useMemo(() => mode === MapMode.POLEADD, [mode]);

  const currentDeviceCounts = useMemo(() => {
    /**
     * Memoized function to calculate the current counts of devices based on their types.
     * - It reads the devices from the form and counts the occurrences of each device type.
     */
    const devices = form.getValues('devices') || [];
    return devices.reduce((acc: Record<string, number>, device: Device) => {
      acc[device.type] = (acc[device.type] || 0) + 1;
      return acc;
    }, {});
  }, [form.watch('devices')]);

  useEffect(() => {
    /**
     * Effect hook that sets default values for a new pole when `newPoleCoordinates` change.
     * - It initializes the longitude, latitude, and pole ID when adding a new pole.
     */
    if (mode === MapMode.POLEADD || isMovingPole) {
      const longitude = newPoleCoordinates?.[0] ?? pole?.long ?? 0;
      const latitude = newPoleCoordinates?.[1] ?? pole?.lat ?? 0;
      if (!isMovingPole) {
        form.setValue('long', longitude);
        form.setValue('lat', latitude);
      }
      setCoordinates({ lat: latitude, long: longitude });
      if (mode === MapMode.POLEADD) {
        form.setValue('pole_id', `UNKNOWN-NEAR-(${longitude},${latitude})`);
      }
    }
  }, [newPoleCoordinates, isMovingPole]);

  const validateInstalledAt = () => {
    // Check installed_at validation specifically
    const devices = form.getValues('devices') || [];
    const installed_at = form.getValues('installed_at');
    const isInstalled = devices.length > 0;
    if (isInstalled && !installed_at) {
      toast.error('Installed At date is required');
      form.setError('installed_at', { message: 'Installed At date is required' });
      return false;
    }
    return true;
  };

  const buildFormDataForPole = (data: Pole, changedFields: Partial<Pole>, hasMinimalDeviceData?: boolean) => {
    const formData = new FormData();

    if (mode === MapMode.POLEADD) {
      changedFields['deployment_id'] = Number(deploymentId);
      changedFields['is_new_pole'] = true;
      if (hasMinimalDeviceData && isPoleAddMode && !data?.status) {
        changedFields['status'] = PoleStatus.Installed;
      }
    }

    formData.append('pole_data', JSON.stringify(changedFields));

    if (deletedFilesIds && deletedFilesIds.length > 0) {
      formData.append('file_ids', deletedFilesIds?.join(','));
    }

    if (selectedFiles && selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        formData.append(`images`, file);
      }

      if (selectedImageTypes?.length) {
        const adjustedImageTypes = [...selectedImageTypes];
        while (adjustedImageTypes.length < selectedFiles.length) {
          adjustedImageTypes.push('pole');
        }

        const metaData = adjustedImageTypes.map((imageType: string) => ({
          type: imageType,
        })) as MetaData[];
        formData.append('images_metadata', JSON.stringify(metaData));
      } else {
        const metaData = new Array(selectedFiles.length).fill({ type: 'pole' }) as MetaData[];
        formData.append('images_metadata', JSON.stringify(metaData));
      }
    }

    return formData;
  };

  const getChangedFields = (data: Pole): Partial<Pole> => {
    const changedFields: Partial<Pole> = {};
    for (const key of Object.keys(data)) {
      const fieldKey = key as keyof Pole;
      const currentValue = data[fieldKey];
      const initialValue = pole?.[fieldKey];

      if (JSON.stringify(currentValue) !== JSON.stringify(initialValue)) {
        if (fieldKey !== 'devices') {
          changedFields[fieldKey] = currentValue as any;
        }
      }
    }
    return changedFields;
  };

  const createDevicesForNewPole = async (poleId: number) => {
    const devices = form.getValues('devices') ?? [];
    const createdDevices = [];
    for (const newDevice of devices) {
      try {
        const device = await createDevice({ body: { ...newDevice, pole_id: poleId } });
        console.error('Device created:', device);
        if (device?.data?.data) {
          createdDevices.push(device.data.data);
        }
      } catch {
        toast.error('Failed to create devices');
      }
    }
    return createdDevices;
  };

  const handlePoleUpdate = async (formData: FormData, poleId: number) => {
    const updatedPole = await updatePole({ formData, poleId });
    if (updatedPole?.data?.data?.id) {
      dispatch(updatePoleInState({ id: updatedPole?.data?.data?.id, newData: updatedPole?.data?.data }));
    }
  };

  const handlePoleCreation = async (formData: FormData) => {
    const createdPole = await createPole({ formData }).unwrap();
    if (createdPole?.data) {
      const createdDevices = await createDevicesForNewPole(createdPole.data.id);
      const poleWithDevices = { ...createdPole.data, devices: createdDevices };
      dispatch(setPoles([...poles, poleWithDevices]));

      if (createdPole?.data?.id) {
        dispatch(updatePoleInState({ id: createdPole.data.id, newData: poleWithDevices }));
      }

      searchParams.set('pole_id', createdPole.data.id?.toString());
      toast.dismiss();
      toast.success('Pole created successfully');
    }
  };

  const cleanupAfterSubmit = () => {
    if (mapRef) {
      mapRef.getCanvas().style.cursor = '';
    }
    if (isPoleAddMode) {
      searchParams.set('mode', MapMode.POLEVIEW);
      setSearchParams(searchParams);
    }
    dispatch(setNewPoleCoordinates(null));
    dispatch(setIsMovingPole(false));
    setSelectedFiles([]);
    setSelectedImageTypes([]);
    setDeletedFilesIds([]);
    dispatch(setIsAddingPole(false));
  };

  const onSubmit = async (data: Pole) => {
    /**
     * Function to handle form submission for creating or updating a pole.
     * - It creates a `FormData` object to hold the pole data, including any changes to the form values.
     * - If files are deleted or added, it appends them to the form data.
     * - If the mode is POLEEDIT, it updates the pole; if POLEADD, it creates a new pole and associated devices.
     */

    if (data) {
      const { isValid, hasMinimalDeviceData } = validatePole(data, pole?.status as any);

      if (!isValid) {
        handleResetForm();
        return;
      }

      const imageAlreadyExist = pole?.images?.find(image => image?.extra.meta_data.type === ImageType.Inaccessible);
      if (
        !imageAlreadyExist &&
        data?.status &&
        data?.status_type &&
        !validateStatusTypesForInaccessiblePhoto(data?.status, data?.status_type)
      ) {
        handleResetForm();
        return;
      }

      try {
        const changedFields = getChangedFields(data);
        const formData = buildFormDataForPole(data, changedFields, hasMinimalDeviceData);

        if (mode === MapMode.POLEEDIT) {
          await handlePoleUpdate(formData, data?.id);
        } else {
          await handlePoleCreation(formData);
        }

        cleanupAfterSubmit();
      } catch (error: any) {
        if (error?.originalStatus !== 413) {
          toast.error(`Failed to ${mode === MapMode.POLEEDIT ? 'update' : 'create'} pole`);
        }
        console.error('Update failed', error);
      }
    }
  };

  const handleTriggerFormForStatus = (status: string) => {
    form.setValue('status', status);
    form.setValue('status_reason', null);
    form.setValue('status_type', null);
    form.handleSubmit(onSubmit)();
  };

  useEffect(() => {
    const currentStatus = form.getValues('status');

    // Case 1: If no devices and status is "installed", change to "pending"
    if ((!pole?.devices || pole.devices.length === 0) && pole?.status === 'installed') {
      setSelectedDeviceType(null);
      handleTriggerFormForStatus('pending');
      return;
    }

    // Case 2: If devices exist and status is not "installed", change to "installed"
    if (
      pole?.status &&
      pole.status !== 'installed' &&
      pole.devices &&
      pole.devices.length > 0 &&
      currentStatus !== 'installed'
    ) {
      handleTriggerFormForStatus('installed');
    }
  }, [pole]);

  useEffect(() => {
    /**
     * Effect hook that triggers form submission when files are deleted.
     * - If there are deleted files and not in pole add mode, it triggers the form submission to save the changes.
     */
    if (deletedFilesIds.length) {
      !isPoleAddMode && form.handleSubmit(onSubmit)();
    }
  }, [deletedFilesIds, isPoleAddMode]);

  const handleDeleteDevice = async (deviceId: number, deviceType: string, isNewDevice?: boolean) => {
    /**
     * Function to handle device deletion.
     * - If not in pole add mode and a valid device ID is provided, it deletes the device from the database and Redux store.
     * - Otherwise, it removes the device from the form's device list.
     */
    const devices = form.getValues('devices');
    if (!isPoleAddMode && deviceId !== -1 && !isNewDevice) {
      const device = await deleteDevice({ deviceId });
      if (device?.data?.data?.id) {
        const poleId = form.getValues('id');
        const filteredDevices = devices?.filter(device => device.id !== deviceId);
        dispatch(removeDeviceFromPole({ poleId: poleId, devices: filteredDevices ?? [] }));
      }
    } else {
      setSelectedDeviceType(null);
      form.setValue(
        'devices',
        devices?.filter(device => device.id !== deviceId)
      );
    }
    setShowDeviceValidation(false);
    if (canAddDeviceType(deviceType)) setSelectedDeviceType(null);
  };

  const handleAddDeviceClick = (deviceType: string) => {
    /**
     * Function to add a new device of the specified type to the form.
     * - It creates a new device with default values and appends it to the form's device list.
     */
    setSelectedDeviceType(deviceType);
    const devices = form.getValues('devices') || [];
    const newDevice: Device = {
      id: devices.length,
      description: '',
      pole_id: Number(pole?.id),
      type: DEVICE_DISPLAY_NAMES[deviceType as keyof typeof DEVICE_DISPLAY_NAMES],
      serial_no: '',
      solar_orientation: '',
      is_blinked: undefined,
      isNew: true,
    };
    form.setValue('devices', [...devices, newDevice]);
  };

  const handleSaveAllDevices = useCallback(async () => {
    setShowDeviceValidation(true);
    await form.trigger();
    const formErrors = form.formState.errors;
    const devices = form.getValues('devices');
    const poleId = form.getValues('id');
    if (!validateInstalledAt()) return;
    const newDevices = devices?.filter(device => device.isNew) || [];
    if (newDevices.length > 0 && !formErrors.devices) {
      const savedDevices = await Promise.all(newDevices.map(device => createDevice({ body: device })));
      const updatedDevices = savedDevices.flatMap(device => device?.data?.data ?? []);
      dispatch(updatePoleDevices({ poleId, devices: updatedDevices }));
      setShowDeviceValidation(false);
    }
  }, [form.formState.errors]);

  const handleUpdateDevice = useCallback(
    async (deviceId: number) => {
      /**
       * Function to update a device based on its ID.
       * - It triggers form validation and updates the device in the database and Redux store.
       */
      if (!validateInstalledAt()) return;
      await form.trigger();
      const formErrors = form.formState.errors;
      const devices = form.getValues('devices');
      const updatedDevice = devices?.find(device => device.id === deviceId);
      if (updatedDevice && !formErrors.devices) {
        const device = await updateDevice({ body: updatedDevice, deviceId });
        const poleId = form.getValues('id');
        dispatch(updatePoleDevices({ poleId: poleId, devices: device?.data?.data as unknown as Device[] }));
        searchParams.set('mode', MapMode.POLEVIEW);
        setSearchParams(searchParams);
      }
    },
    [form.formState.errors]
  );

  const isAnyDeviceAdded = useMemo(() => {
    /**
     * Memoized function to check if any device is added.
     * - It returns true if there are any devices in the form's device list.
     */
    const devices = form.getValues('devices') || [];
    return devices.length > 0;
  }, [form.watch('devices')]);

  const currentDeviceType = useMemo(() => {
    /**
     * Memoized function to get the type of the first device.
     * - It returns the type of the first device in the list, or null if no devices are added.
     */
    const devices = form.getValues('devices') || [];
    return devices[0]?.type || null;
  }, [form.watch('devices')]);

  const canAddDeviceType = (type: string) => {
    /**
     * Function to determine if a device type can be added based on the current device counts and type.
     * - It ensures that the count of devices of the same type does not exceed the limit.
     */
    if (isAnyDeviceAdded && type !== currentDeviceType) {
      return false;
    }
    const currentCount = currentDeviceCounts[type] || 0;
    return currentCount < DEVICE_LIMITS[type as keyof typeof DEVICE_LIMITS];
  };

  // Miscellaneous data
  const equipments = useMemo(() => miscellaneousData?.data?.equipment?.map(e => e.name) ?? [], [miscellaneousData]);
  const accessEfforts = useMemo(() => miscellaneousData?.data?.access_efforts?.map(v => v) ?? [], [miscellaneousData]);
  const statusTypes = useMemo(() => miscellaneousData?.data?.status_info ?? [], [miscellaneousData]) as StatusType;

  useEffect(() => {
    dispatch(
      setIsPoleLoading(isPoleCreating || isPoleUpdating || isDeviceCreating || isDeviceUpdating || isDeviceDeleting)
    );
  }, [isPoleCreating, isPoleUpdating, isDeviceCreating, isDeviceUpdating, isDeviceDeleting]);

  const handleDateChange = (date: Date | null, field: ControllerRenderProps) => {
    if (date) {
      // Format the date as YYYY-MM-DDTHH:MM:SS without timezone info
      const formattedDate =
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0') +
        'T' +
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0') +
        ':' +
        String(date.getSeconds()).padStart(2, '0');

      field.onChange(formattedDate);
    } else {
      field.onChange(null);
    }
  };

  // Add a new function to save individual fields
  const saveIndividualField = async (fieldName: string) => {
    try {
      if (!validateInstalledAt()) return;
      const formData = new FormData();
      const poleData: Record<string, any> = {};
      // Add only the specific field to the payload
      if (!shouldUpdate(fieldName)) return;
      poleData[fieldName] = form.getValues(fieldName as any);
      formData.append('pole_data', JSON.stringify(poleData));
      dispatch(setIsPoleLoading(true));
      const result = await updatePole({ formData, poleId: pole?.id ?? -1 });
      if (result?.data?.data?.id) {
        dispatch(updatePoleInState({ id: result.data.data.id, newData: result.data.data }));
      }
    } catch (error) {
      toast.error(`Failed to update ${fieldName.replaceAll('_', ' ')}`);
      console.error('Update failed', error);
    } finally {
      dispatch(setIsPoleLoading(false));
    }
  };

  const getDeviceConnectivityValue = (value?: boolean) => {
    if (value === undefined) return '';
    return value ? 'Connected' : 'Did not Connect';
  };

  const isSelectDeviceDisabled = useMemo(() => {
    switch (selectedDeviceType) {
      case `${DEVICE_TYPES[0]}`:
        return !canAddDeviceType(`${DEVICE_TYPES[0]}`);
      case `${DEVICE_TYPES[1]}`:
        return !canAddDeviceType(`${DEVICE_TYPES[1]}`);
      case `${DEVICE_TYPES[2]}`:
        return !canAddDeviceType(`${DEVICE_TYPES[2]}`);
      default:
        return false; // Default case
    }
  }, [selectedDeviceType, form.getValues().devices]);

  const errors = form.formState.errors;

  const movePoleHandler = () => {
    dispatch(setIsMovingPole(true));
    if (mapRef) {
      mapRef.getCanvas().style.cursor = 'crosshair';
    }
  };

  useEffect(() => {
    if (!isMovingPole) {
      if (mapRef) {
        mapRef.getCanvas().style.cursor = '';
      }
    }
  }, [isMovingPole]);

  const handleCoordinateChange =
    (key: 'lat' | 'long', min: number, max: number) => (ev: React.ChangeEvent<HTMLInputElement>) => {
      const raw = ev.target.value;
      if (raw === '' || raw === '-') {
        setCoordinates(prev => ({ ...prev, [key]: raw }));
        return;
      }
      let value = Number(raw);
      if (Number.isNaN(value)) return;
      if (value < min) value = min;
      if (value > max) value = max;
      setCoordinates(prev => ({ ...prev, [key]: value }));
    };

  const formatSerialNumberInput = (input: string): string => {
    let raw = input.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');

    // Limit input to either 2 letters + 8 digits (10 total) or 4 letters + 9 digits (13 total)
    const lettersRegex = /[A-Z]+/;
    const lettersMatch = lettersRegex.exec(raw);
    const letters = lettersMatch?.[0] || '';
    const digits = raw.slice(letters.length).replaceAll(/\D/g, '');

    let value = '';

    if (letters.length <= 2) {
      value = letters.slice(0, 2) + digits.slice(0, 8);
    } else {
      value = letters.slice(0, 4) + digits.slice(0, 9);
    }
    return value;
  };

  const getPoleLabel = () => {
    if (form.getValues('disabled')) {
      return 'NON EXISTENT';
    }
    if (form.getValues('is_archived')) {
      return 'DISABLED';
    }
    if (form.getValues('is_miscellaneous')) {
      return 'MISCELLANEOUS';
    }
    return 'NONE';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PoleImageSection
          pole={pole ?? null}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          setDeletedFilesIds={setDeletedFilesIds}
          selectedImageTypes={selectedImageTypes}
          setSelectedImageTypes={setSelectedImageTypes}
          disableUpload={false}
          isPoleAddMode={isPoleAddMode}
          poleIconName={poleIconName}
          handleEditPole={handleEditPole}
          handleUploadFiles={() => {
            !isPoleAddMode && form.handleSubmit(onSubmit)();
          }}
        />
        <Card className="flex flex-col gap-4 overflow-auto px-4 pb-6">
          <div className="flex flex-1 shrink basis-0 flex-col">
            <FormField
              name="pole_id"
              render={({ field }) => (
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <SingleSelectOption
                    hideCloseButton
                    value={field.value}
                    tempValueParent={tempPoleId}
                    title="Pole ID"
                    onClose={() => setTempPoleId(form.getValues('pole_id'))}
                    optionsList={[]}
                    onSaveClick={() => {
                      field.onChange(tempPoleId);
                      if (!isPoleAddMode && !isEqual(tempPoleId, pole?.pole_id)) form.handleSubmit(onSubmit)();
                    }}>
                    <FormItem className="flex w-full flex-row items-center gap-8">
                      <div className="flex flex-1 flex-col">
                        <FormControl className="!m-0">
                          <Input
                            className="!mt-[5px] h-8 w-full"
                            placeholder="Pole ID"
                            value={tempPoleId}
                            onChange={ev => setTempPoleId(ev.target.value)}
                            data-testid="pole-id"
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </FormItem>
                  </SingleSelectOption>
                </div>
              )}
            />
          </div>
          <FormField
            name="label"
            render={() => (
              <SingleSelectOption
                dataTestId="pole-label"
                title="Pole label"
                value={getPoleLabel()}
                optionsList={isPoleAddMode ? poleLabelOptionsForCreate : poleLabelOptionsForEdit}
                onSaveClick={updatedValue => {
                  if (updatedValue === 'NON EXISTENT') {
                    form.setValue('disabled', true);
                    form.setValue('is_archived', false);
                    form.setValue('is_miscellaneous', false);
                  } else if (updatedValue === 'DISABLED') {
                    form.setValue('disabled', false);
                    form.setValue('is_archived', true);
                    form.setValue('is_miscellaneous', false);
                  } else if (updatedValue === 'MISCELLANEOUS') {
                    form.setValue('disabled', false);
                    form.setValue('is_archived', false);
                    form.setValue('is_miscellaneous', true);
                  } else {
                    form.setValue('disabled', false);
                    form.setValue('is_archived', false);
                    form.setValue('is_miscellaneous', false);
                  }
                  !isPoleAddMode && form.handleSubmit(onSubmit)();
                }}
              />
            )}
          />

          <Separator />

          <div className="flex w-full flex-col gap-4">
            <FormField
              name="status"
              render={({ field }) => (
                <SingleSelectOption
                  dataTestId="pole-status"
                  title="Status"
                  value={form.getValues('status')}
                  optionsList={poleStatuses}
                  onSaveClick={updatedValue => {
                    field.onChange(updatedValue);
                    !isPoleAddMode && form.handleSubmit(onSubmit)();
                  }}
                />
              )}
            />

            {statusTypes?.[form.getValues('status')] && (
              <FormField
                name="status_type"
                render={({ field }) => (
                  <SingleSelectOption
                    dataTestId="inaccessible-reason"
                    title="Inaccessible Reason"
                    value={form.getValues('status_type') ?? ''}
                    optionsList={statusTypes?.[form.getValues('status')] ?? []}
                    onSaveClick={updatedValue => {
                      field.onChange(updatedValue);
                      !isPoleAddMode && form.handleSubmit(onSubmit)();
                    }}
                  />
                )}
              />
            )}

            {form.getValues('status') === poleStatusesMap.blocked && (
              <FormField
                name="access_efforts"
                render={({ field }) => (
                  <MultiSelectOption
                    dataTestId="access-efforts"
                    title="Access Efforts"
                    values={field.value || []}
                    optionsList={accessEfforts ?? []}
                    disabled={isLoading}
                    handleValidation={validatePoleAccessEfforts}
                    saveButtonOnClick={updatedValues => {
                      field.onChange(updatedValues);
                      !isPoleAddMode && form.handleSubmit(onSubmit)();
                    }}
                  />
                )}
              />
            )}

            <FormField
              name="status_reason"
              render={({ field }) => (
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <SingleSelectOption
                    hideCloseButton
                    value={field.value}
                    tempValueParent={tempStatusReason}
                    title="Inaccessible Comment"
                    onClose={() => setTempStatusReason(form.getValues('status_reason') ?? '')}
                    onSaveClick={() => {
                      if (!isPoleAddMode && !isEqual(tempStatusReason, pole?.status_reason)) {
                        field.onChange(tempStatusReason);
                        form.handleSubmit(onSubmit)();
                      }
                    }}>
                    <FormItem className="flex w-full flex-row items-center gap-8">
                      <div className="flex flex-1 flex-col">
                        <FormControl className="!m-0">
                          <Textarea
                            className="min-h-[100px] overflow-hidden break-words !text-xs"
                            placeholder="Inaccessible Comment"
                            value={tempStatusReason}
                            onChange={ev => setTempStatusReason(ev.target.value)}
                            data-testid="status-reason"
                            maxLength={200}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </FormItem>
                  </SingleSelectOption>
                </div>
              )}
            />
          </div>

          <Separator />

          <div className="flex w-full flex-col gap-2.5">
            <div className="flex w-full flex-row items-center justify-between">
              <Label className="flex-1 !text-xss font-bold text-grayShades-shade7">Lat</Label>
              <Label className="flex-1 !text-xss font-bold text-grayShades-shade7">Long</Label>
            </div>

            <SingleSelectOption
              sectionTitle="Latitude Longitude "
              value={`${form.getValues('lat')}`}
              tempValueParent={`${coordinates?.long}`}
              value2={`${form.getValues('long')}`}
              optionsList={[]}
              hasTwoValues={true}
              onClose={() => setCoordinates({ lat: form.getValues('lat'), long: form.getValues('long') })}
              onSaveClick={() => {
                if (coordinates) {
                  if (coordinates.lat !== '' && coordinates.lat !== '-') {
                    form.setValue('lat', Number(coordinates.lat));
                  }
                  if (coordinates.long !== '' && coordinates.long !== '-') {
                    form.setValue('long', Number(coordinates.long));
                  }
                  if (!isPoleAddMode) form.handleSubmit(onSubmit)();
                }
              }}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-2">
                    <FormField
                      name="lat"
                      render={() => (
                        <FormItem className="flex-1">
                          <FormLabel className="!text-xss font-bold text-grayShades-shade7">Latitude</FormLabel>
                          <FormControl className="!m-0">
                            <Input
                              type="number"
                              className="!mt-[5px] h-8"
                              placeholder="number"
                              value={coordinates?.lat}
                              onChange={handleCoordinateChange('lat', -90, 90)}
                              data-testid="pole-latitude"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="long"
                      render={() => (
                        <FormItem className="flex-1">
                          <FormLabel className="!text-xss font-bold text-grayShades-shade7">Longitude</FormLabel>
                          <FormControl className="!m-0">
                            <Input
                              type="number"
                              className="!mt-[5px] h-8"
                              placeholder="number"
                              value={coordinates?.long}
                              onChange={handleCoordinateChange('long', -180, 180)}
                              data-testid="pole-longitude"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <CopyCoordinatesButton
                    lat={coordinates?.lat || form.getValues('lat')}
                    long={coordinates?.long || form.getValues('long')}
                    className="mt-5"
                  />
                </div>
              </div>
              {!isMovingPole && (
                <Button
                  variant="default"
                  size="sm"
                  className={`rounded-md bg-primary ${isMovingPole && 'cursor-not-allowed'}`}
                  onClick={movePoleHandler}>
                  Move Pole
                </Button>
              )}
            </SingleSelectOption>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <div className="flex w-full flex-col gap-1">
              <SingleSelectOption
                dataTestId="devices-options"
                title="Device"
                sectionTitle="Device Type"
                disabled={isSelectDeviceDisabled}
                disabledOptions={[
                  !canAddDeviceType(DEVICE_TYPES[0]) || selectedDeviceType === DEVICE_TYPES[2],
                  !canAddDeviceType(DEVICE_TYPES[1]) || selectedDeviceType === DEVICE_TYPES[2],
                  !canAddDeviceType(DEVICE_TYPES[2]),
                ]}
                value={selectedDeviceType ?? ''}
                optionsList={DEVICE_TYPES}
                onSaveClick={updatedValue => handleAddDeviceClick(updatedValue)}
              />
            </div>
            {form.getValues('devices')?.map((device: Device, index: number) => (
              <div key={device.id || index} className="flex w-full flex-col gap-4">
                <div className="flex w-full flex-col bg-grayShades-shade1 p-1 pl-2">
                  <div className="flex w-full">
                    <FormField
                      control={form.control}
                      name={`devices.${index}.serial_no` as const}
                      rules={{
                        required: 'Serial number is required',
                        pattern: {
                          value: /^(?:[A-Z]{2}\d{8}|[A-Z]{4}\d{9})$/,
                          message:
                            'Serial number must be either:\n- 2 letters followed by 8 digits (e.g., GS00035517), or\n- 4 letters followed by 9 digits (e.g., GSAA252500036)',
                        },
                      }}
                      render={({ field }) => (
                        <div className="flex w-full flex-row items-center justify-between gap-2">
                          <Label className="flex-1 !text-xss font-bold text-grayShades-shade7">Serial</Label>
                          <SingleSelectOption
                            className="!min-w-[130px] flex-1"
                            hasError={showDeviceValidation && Boolean(errors?.devices?.[index]?.serial_no)}
                            placeholder="Enter GS"
                            value={field.value}
                            tempValueParent={pole?.devices?.[index]?.serial_no ?? ''}
                            sectionTitle="Device Serial Number"
                            optionsList={[]}
                            onSaveClick={() => {
                              setShowDeviceValidation(true);
                              form.trigger();
                            }}>
                            <FormItem className="flex w-full flex-row items-center gap-8">
                              <div className="flex flex-1 flex-col">
                                <FormControl className="!m-0">
                                  <Input
                                    maxLength={13}
                                    className="!mt-[5px] h-8"
                                    placeholder="Serial no."
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      const formatted = formatSerialNumberInput(value);
                                      field.onChange(formatted);
                                    }}
                                    value={field.value?.startsWith('GS') ? field.value : 'GS'}
                                  />
                                </FormControl>
                                {showDeviceValidation && <FormMessage className="mt-1 text-xs" />}
                              </div>
                            </FormItem>
                          </SingleSelectOption>
                        </div>
                      )}
                    />
                  </div>

                  <div className="flex w-full flex-row items-center justify-between gap-2">
                    <Label className="flex-1 !text-xss font-bold text-grayShades-shade7">Orientation</Label>
                    <FormField
                      control={form.control}
                      name={`devices.${index}.solar_orientation` as const}
                      rules={{
                        required: 'Orientation is required',
                      }}
                      render={({ field }) => (
                        <div className="flex flex-1 flex-col">
                          <SingleSelectOption
                            className="flex-1"
                            sectionTitle="Solar Orientation"
                            value={field.value ?? ''}
                            hasError={showDeviceValidation && Boolean(errors?.devices?.[index]?.solar_orientation)}
                            optionsList={Object.values(OrientationOptions)}
                            onSaveClick={updatedValue => {
                              field.onChange(updatedValue);
                              form.trigger();
                            }}
                          />
                          {showDeviceValidation && <FormMessage className="mt-1 text-xs" />}
                        </div>
                      )}
                    />
                  </div>

                  <div className="flex w-full flex-row items-center justify-between gap-2">
                    <Label className="flex-1 !text-xss font-bold text-grayShades-shade7">Connectivity</Label>
                    <FormField
                      control={form.control}
                      name={`devices.${index}.is_blinked` as const}
                      rules={{
                        validate: value => (value !== undefined && value !== null) || 'Connectivity is required',
                      }}
                      render={({ field }) => (
                        <div className="flex flex-1 flex-col">
                          <SingleSelectOption
                            className="flex-1"
                            value={`${getDeviceConnectivityValue(field.value)}`}
                            sectionTitle="Connectivity"
                            hasError={showDeviceValidation && Boolean(errors?.devices?.[index]?.is_blinked)}
                            visibleValue={DEVICE_CONNECTIVITY_VALUE[`${getDeviceConnectivityValue(field.value)}`]}
                            optionsList={['Connected', 'Did not Connect']}
                            onSaveClick={updatedValue => {
                              field.onChange(updatedValue === 'Connected');
                              form.trigger();
                            }}
                          />
                          {showDeviceValidation && <FormMessage className="mt-1 text-xs" />}
                        </div>
                      )}
                    />
                  </div>
                  <div className="my-2 flex flex-col justify-center gap-2 pr-1">
                    {!isPoleAddMode &&
                    !device.isNew &&
                    JSON.stringify(form.getValues(`devices.${index}`)) !== JSON.stringify(pole?.devices?.[index]) ? (
                      <Button
                        disabled={isLoading}
                        type="button"
                        variant="secondary"
                        className="rounded"
                        onClick={() => device?.id && handleUpdateDevice(device?.id)}>
                        Update Device
                      </Button>
                    ) : (
                      ''
                    )}
                    <ConfirmationDialog
                      title="Remove device from pole"
                      description="Are you sure you want to remove all devices from this pole?"
                      triggerComponent={
                        <Button disabled={isLoading} variant="destructive" className="text-xs">
                          Remove
                        </Button>
                      }
                      confirmationComponent={
                        <Button
                          type="button"
                          disabled={isLoading}
                          variant="destructive"
                          className="bg-redShades-shade1"
                          onClick={() =>
                            handleDeleteDevice(device.id ?? -1, form.getValues(`devices.${index}.type`), device?.isNew)
                          }>
                          REMOVE DEVICE
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {form.getValues('devices')?.some(device => device.isNew) && !isPoleAddMode && (
            <Button
              variant="secondary"
              disabled={isLoading}
              type="button"
              className="mt-1 rounded"
              onClick={handleSaveAllDevices}>
              Save Devices
            </Button>
          )}

          {Boolean(pole?.devices?.length) && <Separator />}

          <div className="flex w-full flex-col">
            <FormField
              name="installed_at"
              rules={{
                validate: value => {
                  if (isInstalled && !value) {
                    toast.error('Installed At date is required');
                    return 'Installed At date is required';
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="!text-xss font-bold text-grayShades-shade7">Installed At</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      format="MM/dd/yyyy h:mm a"
                      disableClock={true}
                      value={field.value ? new Date(field.value) : null}
                      onChange={date => {
                        handleDateChange(date, field);
                      }}
                      className="w-full"
                      clearIcon={field.value && !isInstalled ? <XIcon /> : null}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
            {!isPoleAddMode && shouldUpdate('installed_at') && (
              <Button
                disabled={isLoading}
                type="button"
                className="mt-2 w-full"
                onClick={() => saveIndividualField('installed_at')}>
                Save
              </Button>
            )}
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <FormField
              name="equipments"
              render={({ field }) => (
                <MultiSelectOption
                  dataTestId="equipment-options"
                  title="Circuit Protection Equipment"
                  values={field.value || []}
                  optionsList={equipments ?? []}
                  disabled={isLoading}
                  saveButtonOnClick={updatedValues => {
                    field.onChange(updatedValues);
                    !isPoleAddMode && form.handleSubmit(onSubmit)();
                  }}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex w-full flex-col">
            <FormField
              name="vegetation_notes"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="!text-xss font-bold text-grayShades-shade7">Pole Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[48px] overflow-hidden break-words !text-xs"
                      {...field}
                      data-testid="vegetation_notes"
                      maxLength={200}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isPoleAddMode && shouldUpdate('vegetation_notes') && (
              <Button
                disabled={isLoading}
                type="button"
                className="mt-2 w-full"
                onClick={() => saveIndividualField('vegetation_notes')}>
                Save
              </Button>
            )}
          </div>
          <div className="flex w-full flex-col">
            <FormField
              name="installation_notes"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="!text-xss font-bold text-grayShades-shade7">Device Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[48px] overflow-hidden break-words !text-xs"
                      {...field}
                      data-testid="installation-notes"
                      maxLength={200}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isPoleAddMode && shouldUpdate('installation_notes') && (
              <Button
                disabled={isLoading}
                type="button"
                className="mt-2 w-full"
                onClick={() => saveIndividualField('installation_notes')}>
                Save
              </Button>
            )}
          </div>
          {/* Read-only fields below */}
          <div className="flex flex-col">
            <Separator className="my-3" />

            <div className="flex w-full flex-col text-xs font-bold">
              <Label className="!text-xss font-bold text-grayShades-shade7">Created by</Label>
              {pole?.created_by && (
                <p className="mt-2.5 overflow-hidden break-words text-xss text-primary">
                  {formatDate(pole?.created_by)}
                </p>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex w-full flex-col text-xs font-bold">
              <Label className="!text-xss font-bold text-grayShades-shade7">Created at</Label>
              {pole?.created_at && (
                <p className="mt-2.5 overflow-hidden break-words text-xss text-primary">
                  {formatDate(pole?.created_at)}
                </p>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex w-full flex-col text-xs font-bold">
              <Label className="!text-xss font-bold text-grayShades-shade7">Updated by</Label>
              {pole?.updated_by && (
                <p className="mt-2.5 overflow-hidden break-words text-xss text-primary">
                  {formatDate(pole?.updated_by)}
                </p>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex w-full flex-col text-xs font-bold">
              <Label className="!text-xss font-bold text-grayShades-shade7">Updated at</Label>
              {pole?.updated_at && (
                <p className="mt-2.5 overflow-hidden break-words text-xss text-primary">
                  {formatDate(pole?.updated_at)}
                </p>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex w-full flex-col">
              <FormField
                name="last_date_accessed_attempted"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="!text-xss font-bold text-grayShades-shade7">
                      Last Date Access Attempted
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        format="MM/dd/yyyy h:mm a"
                        disableClock={true}
                        minDate={new Date()}
                        value={field.value ? new Date(field.value) : null}
                        onChange={date => handleDateChange(date, field)}
                        className="w-full"
                        clearIcon={field.value && !isInstalled ? <XIcon /> : null}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              {!isPoleAddMode && shouldUpdate('last_date_accessed_attempted') && (
                <Button
                  disabled={isLoading}
                  type="button"
                  className="mt-2 w-full"
                  onClick={() => form.handleSubmit(onSubmit)()}>
                  Save
                </Button>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex w-full flex-col text-xs font-bold">
              <Label className="!text-xss font-bold text-grayShades-shade7">Number of Active Spans</Label>
              <p className="mt-2.5 overflow-hidden break-words text-xss text-primary">
                {pole?.enabled_spans_count ?? 0}
              </p>
            </div>

            <Separator className="my-3" />

            <div className="flex w-full flex-col text-xs font-bold">
              <Label className="!text-xss font-bold text-grayShades-shade7">Has_Spans Connected (Yes / No)</Label>
              <p className="mt-2.5 overflow-hidden break-words text-xss text-primary">
                {pole?.has_span_connected ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {isPoleAddMode && (
            <Button disabled={isLoading} type="submit">
              Save
            </Button>
          )}
        </Card>
      </form>
    </Form>
  );
};

export default EditPole;
