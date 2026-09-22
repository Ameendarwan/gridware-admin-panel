import { Layer, Source } from 'react-map-gl';
import React, { memo } from 'react';

import { RootState } from '@app/store';
import { createOffsetLine } from '../../MapBox.utils';
import { useSelector } from 'react-redux';

const MeasureDistanceLayer = () => {
  const distancePoints = useSelector((state: RootState) => state.poles.measureDistancePoints);
  const offsetCoordinates = distancePoints?.length === 2 ? createOffsetLine(distancePoints, 0) : null;

  if (!offsetCoordinates) return null;
  return (
    <Source
      type="geojson"
      data={{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: offsetCoordinates,
        },
      }}>
      <Layer
        type="line"
        paint={{
          'line-color': '#686868',
          'line-width': 10,
          'line-opacity': 1,
        }}
      />

      <Layer
        type="line"
        paint={{
          'line-color': '#00FF00',
          'line-width': 4,

          'line-opacity': 1,
        }}
      />
    </Source>
  );
};

export default memo(MeasureDistanceLayer);
