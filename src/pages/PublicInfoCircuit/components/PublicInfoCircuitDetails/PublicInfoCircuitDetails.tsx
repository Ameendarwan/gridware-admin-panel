import * as yup from 'yup';

import { FormControl, FormField, FormItem, FormLabel } from '@app/components/Form/Form';
import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { InfoCircuit } from '../../types';
import JsonEditor from '@app/components/JSONEditor';
import SearchableDeployments from '@app/components/SearchableDeployments/SearchableDeployments';
import { urls } from '@app/routes/urls';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DetailPageWrapper from '@app/components/DetailPageWrapper';
import { getDetailPageTitle } from '@app/utils/formUtils';
import { computeLoadingState, fetchDetailData, submitDetailForm } from '@app/utils/detailPageUtils';
import { renderReadOnlyField } from '@app/utils/formFieldRenderers';

/**
 * Schema validation using Yup for the circuit form.
 * - Ensures that the circuit data adheres to the specified validation rules.
 * - Fields include required and optional values like `deployment_id`, `coordinates`, etc.
 */
const formSchema = yup.object().shape({
  deployment_id: yup.number().required(),
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
  coordinates: yup.array().optional(),
});

/**
 * Memoized version of the JsonEditor component to optimize performance by preventing unnecessary re-renders.
 * - Uses React's `memo` to only re-render when the `JsonEditor`'s props change.
 */
const MemoizedJsonEditor = memo(JsonEditor);

const PublicInfoCircuitDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = urls.publicInfoCircuit.list;
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const { id, mode } = useParams();

  const form = useForm<InfoCircuit>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      deployment_id: undefined,
      created_by: '',
      updated_by: '',
      coordinates: [],
    },
  });

  const fetchCircuitData = useCallback(async () => {
    /**
     * Fetches data for a specific circuit when an `id` is provided in the URL parameters.
     * - Uses shared utility to fetch and reset form data
     */
    if (!id) {
      setIsInitialLoading(false);
      return;
    }

    await fetchDetailData(
      `/circuit/${id}`,
      data => {
        const parsedCoordinates = data.coordinates ?? [];
        form.reset({
          deployment_id: data.deployment_id ?? undefined,
          created_by: data.created_by ?? '',
          updated_by: data.updated_by ?? '',
          coordinates: parsedCoordinates,
        });
        setCoordinates(parsedCoordinates);
      },
      undefined,
      () => setIsInitialLoading(false)
    );
  }, [id, form]);

  useEffect(() => {
    /**
     * Effect hook that fetches the circuit data when the component is mounted or when the `id` or `fetchCircuitData` function changes.
     * - Calls the `fetchCircuitData` function to fetch and populate the form with the data for the circuit.
     * - Ensures that the component always has the most recent data when loaded or when the ID changes.
     */
    fetchCircuitData();
  }, [fetchCircuitData]);

  const onSubmit = async (data: InfoCircuit) => {
    /**
     * Handles the form submission for creating or editing a circuit.
     * - Uses shared utility for consistent submit handling
     */
    setIsSaving(true);
    await submitDetailForm({
      mode,
      endpoint: '/circuit',
      id,
      data,
      entityName: 'Circuit',
      onSuccess: () => navigate(navigateUrl),
    });
    setIsSaving(false);
  };

  /**
   * A state variable `isLoading` that indicates whether the circuit form is in a loading state.
   * The loading state is true if either the initial data is loading or the form is saving.
   */
  const isLoading = computeLoadingState(isInitialLoading, isSaving);

  return (
    <DetailPageWrapper
      title={getDetailPageTitle(mode, id, 'Circuit')}
      isLoading={isLoading}
      mode={mode}
      form={form}
      onSubmit={onSubmit}
      onCancel={() => navigate(navigateUrl)}>
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
      <FormField
        name="coordinates"
        render={() => (
          <FormItem>
            <FormLabel>Coordinates</FormLabel>
            <FormControl>
              {mode === 'view' ? (
                <div>{JSON.stringify(coordinates, null, 1)}</div>
              ) : (
                <MemoizedJsonEditor control={form.control} name="coordinates" initialValue={coordinates} />
              )}
            </FormControl>
          </FormItem>
        )}
      />
      {renderReadOnlyField('created_by', 'Created by', 'public-info-circuit-created-by', 'Auto populates.')}
      {renderReadOnlyField('updated_by', 'Updated by', 'public-info-circuit-updated-by', 'Auto populates.')}
    </DetailPageWrapper>
  );
};

export default PublicInfoCircuitDetails;
