import { Dispatch, MutableRefObject, SetStateAction, useCallback, useState } from 'react';
import { EdgeGroup, Layer, MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { MapRef, ViewStateChangeEvent } from 'react-map-gl';
import {
  getMode,
  setDrawingSpanPole,
  setIsDuplicateEdge,
  setIsSelectingEdge,
  setIsSelectingFromPole,
  setIsSelectingToPole,
  setSelectedEdgeId,
  setSelectedFromPole,
  setSelectedPoleEdges,
  setSelectedToPole,
} from '@app/store/slices/edgesSlice';
import {
  setGpsLocationCoordinates,
  setMeasureDistancePoints,
  setNewPoleCoordinates,
  setSearchTerm,
  setSelectedPole,
} from '@app/store/slices/polesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { MapMouseEvent } from 'mapbox-gl';
import { Pole } from '@app/store/apis/pole/types';
import { RootState } from '@app/store';
import { useSearchParams } from 'react-router-dom';

interface LineFeatureProperties {
  edgeId: number;
  id: string;
  isDuplicateEdge?: boolean;
}

const useMapInteractions = (
  processedEdges: EdgeGroup[],
  setProcessedEdges: Dispatch<SetStateAction<EdgeGroup[]>>,
  setZoom: Dispatch<SetStateAction<number>>,
  setLatitude: Dispatch<SetStateAction<number>>,
  setLongitude: Dispatch<SetStateAction<number>>,
  mapRef: MutableRefObject<MapRef | null>
) => {
  const mode = useSelector(getMode);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | number | null>(null);
  const dispatch = useDispatch();
  const isSelectingFromPole = useSelector((state: RootState) => state.edges.isSelectingFromPole);
  const isSelectingToPole = useSelector((state: RootState) => state.edges.isSelectingToPole);
  const isAddingPole = useSelector((state: RootState) => state.poles.isAddingPole);
  const isMovingPole = useSelector((state: RootState) => state.poles.isMovingPole);
  const isMeasureingDistance = useSelector((state: RootState) => state.poles.isMeasuringDistance);
  const distancePoints = useSelector((state: RootState) => state.poles.measureDistancePoints);
  const selectedPole = useSelector((state: RootState) => state.poles.selectedPole);
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const isDuplicateEdge = useSelector((state: RootState) => state.edges.isDuplicateEdge);

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelectPole = (pole: Pole) => {
    if (isSelectingFromPole || isSelectingToPole) {
      if (isSelectingFromPole) {
        dispatch(setSelectedFromPole(pole.id));
      } else if (isSelectingToPole) {
        dispatch(setSelectedToPole(pole.id));
      }
      dispatch(setIsSelectingFromPole(false));
      dispatch(setIsSelectingToPole(false));
    } else if (selectedPole?.id !== pole.id) {
      setSelectedLayer(null);
    }
    dispatch(setSelectedPole(pole));
  };

  const handleOnSelectPole = (pole: Pole) => {
    /**
     * Function to handle the selection of a pole.
     * - If the mode is set to CREATEEDGE, EDGEVIEW, or EDGEEDIT, it triggers the pole selection.
     * - If the mode is different, it updates the `mode` and `pole_id` in the URL parameters, and sets the search parameters accordingly.
     * - Dispatches an action to reset the edge selection state.
     */
    if (mode === MapMode.CREATEEDGE) {
      if (!isDuplicateEdge) dispatch(setDrawingSpanPole(pole));
    } else if (mode === MapMode.EDGEEDIT) {
      handleSelectPole(pole);
    } else {
      searchParams.set('mode', MapMode.POLEVIEW);
      searchParams.set('pole_id', pole.id.toString());
      setSearchParams(searchParams);
      setSelectedLayer(null);
      setSelectedLineId(null);
      dispatch(setSearchTerm(''));
    }
    dispatch(setIsSelectingEdge(null));
  };

  const handleDistanceMeasurement = (lngLat: [number, number]) => {
    const newPoints = distancePoints ?? [];
    dispatch(setMeasureDistancePoints(newPoints.length ? [...newPoints, lngLat] : [lngLat]));
  };

  const handlePoleAddOrMove = (lngLat: [number, number]) => {
    dispatch(setGpsLocationCoordinates(null));
    dispatch(setNewPoleCoordinates(lngLat));
  };

  const handlePoleClick = (poleClicked: any) => {
    const selectedPole = poles.find(pole => pole.id === poleClicked?.properties?.id);
    if (selectedPole) {
      handleOnSelectPole(selectedPole);
    }
    dispatch(setGpsLocationCoordinates(null));
    dispatch(setSelectedEdgeId(-1));
  };

  const handleLineClick = (lineClicked: any, lngLat: [number, number], features: any[]) => {
    const { edgeId, isDuplicateEdge } = lineClicked.properties as LineFeatureProperties;

    if (edgeId) dispatch(setIsSelectingEdge(null));
    dispatch(setIsDuplicateEdge(Boolean(isDuplicateEdge)));
    dispatch(setSelectedEdgeId(edgeId));
    dispatch(setGpsLocationCoordinates(null));

    setSelectedLayer({
      coordinates: lngLat,
      features,
    });

    if (edgeId) {
      setSelectedLineId(edgeId ?? null);
      dispatch(setSelectedPoleEdges([]));
      // Preserve 'test-mode' and 'pole_id' query params if present, remove others
      const testMode = searchParams.get('test-mode');
      const poleId = searchParams.get('pole_id');
      const newParams: Record<string, string> = {};
      if (testMode) newParams['test-mode'] = testMode;
      if (poleId) newParams['pole_id'] = poleId;
      setSearchParams(newParams);
    }
  };

  const handleMapClick = (event: MapMouseEvent, ref: React.RefObject<MapRef>) => {
    const mapInstance = ref.current?.getMap();
    if (!mapInstance) return;

    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    // Measuring distance
    if (isMeasureingDistance && (distancePoints?.length ?? 0) < 2) {
      handleDistanceMeasurement(lngLat);
      return;
    }

    // Adding or moving poles
    if (isAddingPole || isMovingPole) {
      handlePoleAddOrMove(lngLat);
      return;
    }

    // Interactions with features
    const features = mapInstance.queryRenderedFeatures(event.point, {
      layers: ['lines-layer', 'poles-layer'],
    });

    const poleClicked = features.find(f => f?.layer?.id === 'poles-layer');
    const lineClicked = features.find(f => f?.layer?.id === 'lines-layer');

    // If nothing clicked
    if (!features.length && !lineClicked && !poleClicked) {
      dispatch(setSelectedEdgeId(-1));
      setSelectedLineId(null);
      setSelectedLayer(null);
      return;
    }

    if (features.length > 0 && !isMeasureingDistance) {
      // Handle pole click
      if (poleClicked) {
        handlePoleClick(poleClicked);
      }

      // Handle line click
      if (!poleClicked && lineClicked) {
        handleLineClick(lineClicked, lngLat, features);
      }
    }
  };

  const handleDeleteSpecificLine = (groupIndex: number, lineIndex: number) => {
    setProcessedEdges(prevLines => {
      const newLines = [...prevLines];
      const currentGroup = newLines[groupIndex];
      currentGroup.lines.splice(lineIndex, 1);
      return newLines;
    });
  };

  const updateBounds = useCallback(() => {
    // This function is called to trigger any side effects when bounds change
    // The bounds are managed internally by PolesLayer component
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.getBounds(); // Trigger bounds calculation
    }
  }, []);

  const handleViewStateChange = useCallback(
    (e: ViewStateChangeEvent) => {
      setZoom(e?.viewState?.zoom);
      setLatitude(e?.viewState?.latitude);
      setLongitude(e?.viewState?.longitude);
      updateBounds();
    },
    [setZoom, setLatitude, setLongitude, updateBounds]
  );

  return {
    selectedLayer,
    selectedLineId,
    setSelectedPole,
    handleSelectPole,
    handleMapClick,
    handleDeleteSpecificLine,
    handleViewStateChange,
    updateBounds,
    setSelectedLineId,
    setSelectedLayer,
    handleOnSelectPole,
  };
};

export default useMapInteractions;
