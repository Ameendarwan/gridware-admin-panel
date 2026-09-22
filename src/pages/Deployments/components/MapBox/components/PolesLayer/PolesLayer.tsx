import { Layer, MapRef, Source } from 'react-map-gl';
import React, { useEffect, useMemo, useState } from 'react';
import { BBox } from 'geojson';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';
import { addAllImagesToMap, getPoleMarkerName } from '@app/pages/Deployments/components/MapBox/MapBox.utils';

interface PolesLayerProps {
  mapRef: React.MutableRefObject<MapRef | null>;
  markerSize: number;
}

const PolesLayer: React.FC<PolesLayerProps> = ({ mapRef, markerSize }) => {
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const selectedFromPole = useSelector((state: RootState) => state.edges.selectedFromPole);
  const selectedToPole = useSelector((state: RootState) => state.edges.selectedToPole);
  const edgesList = useSelector((state: RootState) => state.edges.edgesList);
  const polesValidationErrors = useSelector((state: RootState) => state.poles.polesValidationErrors);
  const pole_ids = polesValidationErrors?.pole_ids || [];
  const validationIcon = polesValidationErrors?.icon || 'marker-missing-edge';
  const [viewportBounds, setViewportBounds] = useState<BBox | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const updateBounds = () => {
        const bounds = map.getBounds();
        if (bounds) {
          setViewportBounds([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
        }
      };
      updateBounds();
      map.on('moveend', updateBounds);
      return () => {
        map.off('moveend', updateBounds);
      };
    }
  }, [mapRef]);

  useEffect(() => {
    if (mapRef.current && poles?.length > 0) {
      const icons = new Set(poles.map(pole => getPoleMarkerName(pole)));
      const uniqueIcons = [...icons.values()];
      addAllImagesToMap(mapRef.current, uniqueIcons, markerSize);
    }
  }, [mapRef, poles, markerSize, edgesList, polesValidationErrors]);

  const polesGeoJSON = useMemo(() => {
    if (!viewportBounds) {
      return { type: 'FeatureCollection', features: [] };
    }
    const [minLng, minLat, maxLng, maxLat] = viewportBounds;
    const features = poles
      .filter(pole => pole.long >= minLng && pole.long <= maxLng && pole.lat >= minLat && pole.lat <= maxLat)
      .map(pole => {
        const iconName = getPoleMarkerName(pole);
        const hasValidationError = pole_ids.includes(pole.id);
        return {
          type: 'Feature',
          properties: {
            id: pole.id,
            iconName,
            selectedPoleIcon: 'marker-selected-pole',
            validationIcon: hasValidationError ? validationIcon : '',
            hasValidationError,
            isHighlighted: selectedFromPole === pole.id || selectedToPole === pole.id,
          },
          geometry: {
            type: 'Point',
            coordinates: [pole.long, pole.lat],
          },
        };
      });
    return {
      type: 'FeatureCollection',
      features,
    };
  }, [
    poles,
    viewportBounds,
    edgesList,
    selectedFromPole,
    selectedToPole,
    polesValidationErrors,
    pole_ids,
    validationIcon,
  ]);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();

      // Ensure selected poles are the highest
      if (map.getLayer('selected-poles-layer')) {
        map.moveLayer('selected-poles-layer');
      }
      // Ensure poles-layer is above lines
      if (map.getLayer('poles-layer')) {
        map.moveLayer('poles-layer');
      }
      // New: Ensure validation errors layer is the highest
      if (map.getLayer('validation-errors-layer')) {
        map.moveLayer('validation-errors-layer');
      }
    }
  }, [mapRef, polesGeoJSON]);

  // Always provide a valid GeoJSON object to Source, even if empty
  const safePolesGeoJSON = polesGeoJSON || { type: 'FeatureCollection', features: [] };

  return (
    <Source id="poles" type="geojson" data={safePolesGeoJSON}>
      {/* Layer for Highlighted (Selected) Poles */}
      <Layer
        id="selected-poles-layer"
        type="symbol"
        layout={{
          'icon-image': ['case', ['get', 'isHighlighted'], ['get', 'selectedPoleIcon'], ''],
          'icon-size': 1.1,
          'icon-allow-overlap': true,
          'icon-anchor': 'center',
        }}
        paint={{
          'icon-opacity': ['case', ['get', 'isHighlighted'], 1, 0], // Only show if its highlighted
        }}
      />

      {/* Base Layer for All Poles */}
      <Layer
        id="poles-layer"
        type="symbol"
        layout={{
          'icon-image': ['get', 'iconName'],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'symbol-z-order': 'auto',
        }}
        metadata={{
          'test-layer-type': 'poles',
          'test-feature-count': safePolesGeoJSON.features.length,
        }}
      />

      {/* Layer for Poles with Validation Errors */}
      <Layer
        id="validation-errors-layer"
        type="symbol"
        layout={{
          'icon-image': ['case', ['get', 'hasValidationError'], ['get', 'validationIcon'], ''],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-offset': [0, 5],
        }}
        paint={{
          'icon-opacity': ['case', ['get', 'hasValidationError'], 1, 0], // Only show when there's an error
        }}
      />
    </Source>
  );
};

export default React.memo(PolesLayer);
