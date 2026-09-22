import { Marker } from 'react-map-gl';

import MeasureDistanceLayer from '../MeasureDistanceLayer';
import React from 'react';
import { RootState } from '@app/store';
import { useSelector } from 'react-redux';
import { getMode } from '@app/store/slices/edgesSlice';
import { MapMode } from '../../types';

const MarkerLayer = () => {
  const mode = useSelector(getMode);
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const selectedFromPole = useSelector((state: RootState) => state.edges.selectedFromPole);
  const selectedToPole = useSelector((state: RootState) => state.edges.selectedToPole);
  const isMeasureingDistance = useSelector((state: RootState) => state.poles.isMeasuringDistance);
  const distancePoints = useSelector((state: RootState) => state.poles.measureDistancePoints);
  const isAddingPole = useSelector((state: RootState) => state.poles.isAddingPole);
  const newPoleCoordinates = useSelector((state: RootState) => state.poles.newPoleCoordinates);
  const gpsLocationCoordinates = useSelector((state: RootState) => state.poles.gpsLocationCoordinates);
  const drawingSpanPoles = useSelector((state: RootState) => state.edges.drawingSpanPoles);

  return (
    <>
      {/* Adding new pole marker */}
      {mode !== MapMode.CREATEEDGE &&
        poles.map(
          pole =>
            (pole.id === selectedToPole || pole.id === selectedFromPole) && (
              <Marker key={pole.id} longitude={pole.long} latitude={pole.lat} color="#0281FB" />
            )
        )}

      {drawingSpanPoles?.map(pole => (
        <Marker key={pole.id} longitude={pole.long} latitude={pole.lat} color="#0281FB" />
      ))}

      {/* Adding new pole marker */}
      {isAddingPole && newPoleCoordinates && (
        <Marker longitude={newPoleCoordinates[0]} latitude={newPoleCoordinates[1]} color="#FF0000" />
      )}

      {isMeasureingDistance &&
        distancePoints?.length &&
        distancePoints.map(([longitude, latitude]) => (
          <Marker key={`distance-${longitude}-${latitude}`} longitude={longitude} latitude={latitude} color="#FF0000">
            <div className="h-6 w-6 rounded-full border-[2px] border-white bg-red-600" />
          </Marker>
        ))}

      {/* Measuring distance between two poles */}
      {isMeasureingDistance && distancePoints?.length === 2 && <MeasureDistanceLayer />}

      {/* Renders a red marker and a circular shadow on the map based on GPS coordinates */}
      {gpsLocationCoordinates && (
        <>
          <Marker
            longitude={gpsLocationCoordinates?.aggregatedDeviceLongitude ?? 0}
            latitude={gpsLocationCoordinates?.aggregatedDeviceLatitude ?? 0}
            color="#FF0000">
            <div className="h-4 w-4 rounded-full bg-red-600" />
          </Marker>

          {/*  Do not remove this component as it can be used in future features or enhancements related to map marker visualizations */}
          {/* <Source
            id="marker-shadow-source"
            type="geojson"
            data={createCircle(gpsLocationCoordinates?.long, gpsLocationCoordinates?.lat)}>
            <Layer {...(markerShadowLayer as any)} />
          </Source> */}
        </>
      )}
    </>
  );
};

export default MarkerLayer;
