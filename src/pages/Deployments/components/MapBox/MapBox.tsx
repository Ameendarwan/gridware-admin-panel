import { Edge, LineTypeKey, MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { MapRef, Map as Mapbox } from 'react-map-gl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { deploymentsApi, useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } from '@app/store/apis/deployments/deployments';
import { edgeApi, useGetEdgesByIdQuery, useGetSpansByDeploymentIdQuery } from '@app/store/apis/edge/edge';
import { errorToastDuration, getMarkerSize } from '@app/pages/Deployments/components/MapBox/MapBox.utils';
import {
  setDeploymentId,
  setEdges,
  setEdgesMap,
  setMode,
  setSpansData,
  setSpansList,
} from '@app/store/slices/edgesSlice';
import {
  setIsPoleLoading,
  setMapRef,
  setPoleSidebarCloseClicked,
  setPoles,
  setPolesValidationErrors,
  setSelectedPole,
} from '@app/store/slices/polesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import LinesLayer from '@app/pages/Deployments/components/MapBox/components/LinesLayer';
import Loader from '@app/components/Loader/Loader';
import MapControlsLayer from '@app/pages/Deployments/components/MapBox/components/MapControlsLayer';
import MarkerLayer from './components/MarkerLayer';
import PolesLayer from '@app/pages/Deployments/components/MapBox/components/PolesLayer';
import TestOverlay from '@app/pages/Deployments/components/MapBox/components/TestOverlay';
import { RootState } from '@app/store';
import { toast } from 'sonner';
import { useDebounce } from '@app/hooks/useDebounce';
import useEdgeProcessing from '@app/pages/Deployments/components/MapBox/hooks/useLineProcessing';
import { useGetPoleByIdQuery } from '@app/store/apis/pole/pole';
import useMapCenter from '@app/pages/Deployments/components/MapBox/hooks/useMapCenter';
import useMapInteractions from '@app/pages/Deployments/components/MapBox/hooks/useMapInteractions';
import { mapTestUtils } from '@app/services/mapTestUtils';

const MapBox: React.FC = () => {
  const mapRef = useRef<MapRef | null>(null);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { id: deploymentId } = useParams<{ id: string }>();

  const [selectedPoleId, setSelectedPoleId] = useState<number | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');
  const [allEdges, setAllEdges] = useState<Edge[]>([]);
  const [isLoadingAdditionalEdges, setIsLoadingAdditionalEdges] = useState(false);

  const mode = useSelector((state: RootState) => state.edges.mode);
  const isMainSidebarCollapsed = useSelector((state: RootState) => state.sidebars.isMainSidebarCollapsed);
  const isSidebarFiltersCollapsed = useSelector((state: RootState) => state.sidebars.isSidebarFiltersCollapsed);
  const polesList = useSelector((state: RootState) => state.poles.polesList);
  const prevDeploymentId = useSelector((state: RootState) => state.edges.deploymentId);
  const gpsLocationCoordinates = useSelector((state: RootState) => state.poles.gpsLocationCoordinates);

  const {
    data: poles,
    isLoading: isLoadingPoles,
    isError: isErrorPoles,
  } = useGetPolesByDeploymentIdQuery({ deploymentId: deploymentId ?? '' }, { skip: !deploymentId });

  const {
    data: initialEdgesResponse,
    isLoading: isLoadingInitialEdges,
    isError: isErrorEdges,
  } = useGetEdgesByIdQuery({ deploymentId: deploymentId ?? '', skip: 0 }, { skip: !deploymentId });

  const { data: spans, isError: isErrorSpans } = useGetSpansByDeploymentIdQuery(
    { deploymentId: deploymentId ?? '' },
    { skip: !deploymentId || !isMapReady }
  );

  const {
    data: poleData,
    isLoading: isLoadingPole,
    isFetching: isFetchingPole,
    isError: isErrorPole,
  } = useGetPoleByIdQuery({ poleId: selectedPoleId }, { skip: !selectedPoleId });

  const {
    data: deploymentData,
    isError: isErrorDeployment,
  } = useGetDeploymentByIdQuery({ deploymentId: deploymentId ?? '' }, { skip: !deploymentId });

  // Fetch all edges when initial response is loaded
  useEffect(() => {
    if (!deploymentId || !initialEdgesResponse?.data?.records) return;

    // Start with the initial batch
    setAllEdges(initialEdgesResponse.data.records);

    // Check if we need to fetch more using the total count
    const totalCount = initialEdgesResponse.data.count || initialEdgesResponse.data.records.length;
    const batchSize = 500;

    if (totalCount <= batchSize) {
      return; // No need for more batches
    }

    // We need to fetch additional batches
    const fetchMoreBatches = async () => {
      setIsLoadingAdditionalEdges(true);
      let allCollectedEdges = [...initialEdgesResponse.data.records];

      try {
        // Calculate how many more batches we need
        const totalBatches = Math.ceil(totalCount / batchSize);
        let currentSkip = batchSize;

        // Create fetch promises for all remaining batches
        const fetchPromises = [];

        for (let i = 1; i < totalBatches; i++) {
          fetchPromises.push(
            API.get(
              `/edge/all?skip=${currentSkip}&limit=${batchSize}&where={"and":[{"deployment_id":{"eq": "${deploymentId}"}}]}&order_by=id desc`
            )
          );
          currentSkip += batchSize;
        }

        // Execute all requests in parallel
        const responses = await Promise.all(fetchPromises);

        // Process all responses
        for (const response of responses) {
          if (response.data?.data?.records) {
            allCollectedEdges = [...allCollectedEdges, ...response.data.data.records];
          }
        }

        // Update with all collected edges
        setAllEdges(allCollectedEdges);
      } catch (error) {
        console.error('Error fetching additional edge batches:', error);
        toast.error('Error fetching all edges', { duration: errorToastDuration });
      } finally {
        setIsLoadingAdditionalEdges(false);
      }
    };

    fetchMoreBatches();
  }, [deploymentId, initialEdgesResponse]);

  useEffect(() => {
    if (isErrorPoles) {
      toast.error('Error Fetching poles', { duration: errorToastDuration });
    }
    if (isErrorEdges) {
      toast.error('Error Fetching Edges', { duration: errorToastDuration });
    }
    if (isErrorSpans) {
      toast.error('Error Fetching Spans', { duration: errorToastDuration });
    }
    if (isErrorPole) {
      toast.error('Error Fetching pole', { duration: errorToastDuration });
    }
    if (isErrorDeployment) {
      toast.error('Error Fetching deployment', { duration: errorToastDuration });
    }
  }, [isErrorPoles, isErrorEdges, isErrorSpans, isErrorPole, isErrorDeployment]);

  // Update document title based on deployment name
  useEffect(() => {
    const originalTitle = document.title;
    
    if (deploymentData?.data?.name) {
      document.title = deploymentData.data.name;
    }
    
    // Cleanup function to restore original title
    return () => {
      document.title = originalTitle;
    };
  }, [deploymentData?.data?.name]);

  useEffect(() => {
    /**
     * Effect hook that listens for changes in the `searchParams`.
     * - If the `mode` parameter changes in the URL, it updates the `mode` in the Redux store.
     * - If a `pole_id` is provided in the URL and it differs from the current selected pole, it updates the selected pole ID.
     */
    const modeFromParams = searchParams.get('mode') as MapMode;
    const poleIdFromParams = searchParams.get('pole_id');
    if (modeFromParams && modeFromParams !== mode) {
      dispatch(setMode(modeFromParams));
    }
    if (poleIdFromParams && Number(poleIdFromParams) !== selectedPoleId) {
      setSelectedPoleId(Number(poleIdFromParams));
    }
  }, [searchParams]);

  useEffect(() => {
    /**
     * Effect hook that listens for changes in `poleData`.
     * - If `poleData` is available, it triggers the pole selection handler to update the selected pole based on the data.
     */
    if (poleData?.data) handleSelectPole(poleData?.data);
  }, [poleData]);

  useEffect(() => {
    /**
     * Effect hook that listens for changes in `poles` and `allEdges` data.
     * - If both `poles` and `allEdges` data are available, it dispatches actions to store them in the Redux store.
     * - It also sets the deployment ID in the Redux store based on the current `deploymentId`.
     */
    if (poles?.data) {
      dispatch(setPoles(polesList?.length > 0 && prevDeploymentId === Number(deploymentId) ? polesList : poles.data));
      dispatch(setEdges(allEdges));
      dispatch(setDeploymentId(Number(deploymentId)));
    }
  }, [poles?.data, allEdges]);

  // cleanup on exit from Map
  useEffect(() => {
    return () => {
      dispatch(setPoles([]));
      dispatch(setPolesValidationErrors(undefined));
      dispatch(setEdges([]));
      dispatch(setEdgesMap({}));
      dispatch(setDeploymentId(undefined));
      dispatch(setSpansList([]));
      dispatch(setSelectedPole(null));
      dispatch(deploymentsApi.util.invalidateTags(['Poles', 'Deployment']));
      dispatch(edgeApi.util.invalidateTags(['Spans', 'Edges']));
      dispatch(setMapRef(null));
      dispatch(setPoleSidebarCloseClicked(false));
    };
  }, []);

  useEffect(() => {
    /**
     * Effect hook that listens for changes in the `spans` data.
     * - If `spans` data is available, it processes the spans to create a unique set of span identifiers.
     * - The span type, line, and phase are used to generate a unique key for each span.
     * - It then stores the list of unique span identifiers in the Redux store.
     */
    if (spans?.data?.records) {
      dispatch(setSpansData(spans?.data?.records));
      const spansSet = new Set<string>();
      for (const record of spans.data.records) {
        if (!record?.type) continue;
        const typeKey = record.type in LineTypeKey ? LineTypeKey[record.type] : record.type;
        const line = record.line;
        const phase = record.phase;
        const phaseStr = phase ? `-${phase}` : '';
        const lineStr = line ? `.${line}` : '';
        const key = `${typeKey}${phaseStr}${lineStr}`;
        spansSet.add(key);
      }
      const spansArray = Array.from(spansSet);
      dispatch(setSpansList(spansArray));
    }
  }, [spans]);

  useEffect(() => {
    /**
     * Effect hook that listens for changes in the sidebar collapse state.
     * - If the sidebar is collapsed, it triggers a resize of the map to adjust its size.
     * - Ensures that the map layout is updated when the sidebar state changes.
     */
    if (mapRef.current) {
      setTimeout(() => {
        mapRef?.current?.resize();
      }, 270);
    }
  }, [isMainSidebarCollapsed, isSidebarFiltersCollapsed]);

  /**
   * Custom hook that provides map center coordinates and zoom level, and setter functions for them.
   * - It uses the provided `poles` data to determine the initial map center and zoom level.
   */
  const { latitude, longitude, zoom, setLatitude, setLongitude, setZoom } = useMapCenter(poles);

  /**
   * Debounced zoom level to prevent unnecessary rapid updates on zoom changes.
   * - It waits for a small delay before applying the zoom level changes.
   */
  const debouncedZoom = useDebounce(zoom, 200);

  /**
   * Custom hook for processing edges.
   * - It provides the processed edges and setter functions to update them.
   */
  const { processedEdges, setProcessedEdges } = useEdgeProcessing();

  /**
   * Custom hook for handling map interactions.
   * - It provides functions for selecting poles, handling map clicks, and updating the view state.
   */
  const {
    selectedLayer,
    selectedLineId,
    handleSelectPole,
    handleOnSelectPole,
    handleMapClick,
    handleViewStateChange,
    updateBounds,
  } = useMapInteractions(processedEdges, setProcessedEdges, setZoom, setLatitude, setLongitude, mapRef);

  /**
   * Derived loading state based on `isLoadingPole` and `isFetchingPole`.
   * - It returns `true` if either `isLoadingPole` or `isFetchingPole` is `true`, indicating that data is being loaded or fetched.
   */
  useEffect(() => {
    dispatch(setIsPoleLoading(isLoadingPole || isFetchingPole));
  }, [isLoadingPole, isFetchingPole]);

  /**
   * Effect to animate the map view when GPS coordinates are updated.
   * - It triggers a smooth fly-to animation centering the map at the given latitude and longitude.
   * - Sets the zoom level to 14 for a closer view of the target location.
   */
  useEffect(() => {
    if (gpsLocationCoordinates && mapRef.current) {
      mapRef.current.flyTo({
        center: [
          gpsLocationCoordinates?.aggregatedDeviceLongitude ?? 0,
          gpsLocationCoordinates?.aggregatedDeviceLatitude ?? 0,
        ],
        zoom: 18,
        essential: true, // animation is essential
      });
    }
  }, [gpsLocationCoordinates]);

  const handleMapLoad = useCallback(() => {
    /**
     * Function to handle the map load event.
     * - It sets the `isMapReady` state to true once the map is fully loaded.
     * - If poles data exists, it dispatches the `setMapRef` action to store the map reference in the Redux store.
     * - It also calls the `updateBounds` function to update the map bounds.
     */
    setIsMapReady(true);
    if (poles?.data?.length && mapRef.current) {
      dispatch(setMapRef(mapRef.current));
      updateBounds();

      // Initialize test utilities
      mapTestUtils.setMapRef(mapRef.current);
    }
  }, [poles?.data, updateBounds]);

  // Update test utilities with Redux state changes
  const reduxState = useSelector((state: RootState) => state);
  useEffect(() => {
    mapTestUtils.setReduxState(reduxState);
  }, [reduxState]);

  if (isLoadingPoles || isLoadingInitialEdges || isLoadingAdditionalEdges) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader width="150" height="150" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full" data-testid="mapbox-container">
      <Mapbox
        key={deploymentId}
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_KEY}
        longitude={longitude}
        latitude={latitude}
        zoom={zoom}
        onClick={e => handleMapClick(e, mapRef)}
        onMove={handleViewStateChange}
        onLoad={handleMapLoad}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        renderWorldCopies={false}>
        <MarkerLayer />
        <LinesLayer processedEdges={processedEdges} selectedLineId={selectedLineId} />
        <PolesLayer markerSize={getMarkerSize(debouncedZoom)} mapRef={mapRef} />
        <MapControlsLayer selectedLayer={selectedLayer} mapStyle={mapStyle} setMapStyle={setMapStyle} />
        <TestOverlay mapRef={mapRef} handleSelectPole={handleOnSelectPole} />
      </Mapbox>
    </div>
  );
};

export default MapBox;
