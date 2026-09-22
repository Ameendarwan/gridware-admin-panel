import { Layer, MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { Marker, NavigationControl } from 'react-map-gl';
import { setIsAddingPole, setIsMovingPole, setNewPoleCoordinates } from '@app/store/slices/polesSlice';
import { useDispatch, useSelector } from 'react-redux';

import CreateEdge from '@app/pages/Deployments/components/MapBox/components/CreateEdge';
import EditPole from '@app/pages/Deployments/components/MapBox/components/EditPole';
import MapStyleSwitcher from '@app/pages/Deployments/components/MapBox/components/MapStyleSwitcher/MapStyleSwitcher';
import MeasureDistance from '../MeasureDistance';
import React from 'react';
import { RootState } from '@app/store';
import ViewEditSection from '@app/pages/Deployments/components/MapBox/components/ViewEditSection';
import ViewPole from '@app/pages/Deployments/components/MapBox/components/ViewPole/ViewPole';
import { setMode } from '@app/store/slices/edgesSlice';
import { useSearchParams } from 'react-router-dom';
import AddPole from '../AddPole';
import { Button } from '@app/components/Button/Button';

interface MapControlsLayerProps {
  selectedLayer: Layer | null;
  mapStyle: string;
  setMapStyle: React.Dispatch<React.SetStateAction<string>>;
}

const MapControlsLayer: React.FC<MapControlsLayerProps> = ({ selectedLayer, mapStyle, setMapStyle }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = useSelector((state: RootState) => state.edges.mode);
  const isAddingPole = useSelector((state: RootState) => state.poles.isAddingPole);
  const mapRef = useSelector((state: RootState) => state.poles.mapRef);
  const selectedPole = useSelector((state: RootState) => state.poles.selectedPole);
  const newPoleCoordinates = useSelector((state: RootState) => state.poles.newPoleCoordinates);
  const isMovingPole = useSelector((state: RootState) => state.poles.isMovingPole);

  const handleCancelAddPole = () => {
    dispatch(setIsAddingPole(false));
    dispatch(setIsMovingPole(false));
    dispatch(setNewPoleCoordinates(null));
    dispatch(setMode(MapMode.NOVIEW));
    if (mapRef) {
      mapRef.getCanvas().style.cursor = '';
    }
  };

  const handleEditPole = () => {
    searchParams.set('mode', mode === MapMode.POLEEDIT ? MapMode.POLEVIEW : MapMode.POLEEDIT);
    setSearchParams(searchParams);
  };

  return (
    <>
      <NavigationControl position="bottom-right" showCompass />

      <ViewEditSection pole={selectedPole} layer={selectedLayer ?? null} mode={mode}>
        {mode === MapMode.POLEVIEW && selectedPole && <ViewPole pole={selectedPole} handleEditPole={handleEditPole} />}
        {(mode === MapMode.POLEEDIT || mode === MapMode.POLEADD) && (
          <EditPole pole={selectedPole} handleEditPole={handleEditPole} />
        )}
      </ViewEditSection>

      {isAddingPole && (
        <div className="absolute bottom-4 left-1/2 z-[400] flex -translate-x-1/2 transform gap-4">
          <Button onClick={handleCancelAddPole} variant="secondary">
            Cancel
          </Button>
          {mode !== MapMode.POLEADD && <Button onClick={() => dispatch(setMode(MapMode.POLEADD))}>Place</Button>}
        </div>
      )}

      <div className="absolute right-2 top-3 flex min-w-10 flex-col items-end">
        <div className="relative flex w-full flex-col gap-4">
          <MapStyleSwitcher mapStyle={mapStyle} setMapStyle={setMapStyle} />
          <MeasureDistance />
          <AddPole />
          <CreateEdge />
        </div>
      </div>

      {isMovingPole && (
        <Marker longitude={newPoleCoordinates?.[0] ?? 0} latitude={newPoleCoordinates?.[1] ?? 0} color="#FF0000" />
      )}
    </>
  );
};

export default MapControlsLayer;
