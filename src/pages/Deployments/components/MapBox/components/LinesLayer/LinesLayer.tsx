import { EdgeGroup, LineType } from '@app/pages/Deployments/components/MapBox/types';
import { Layer, Source } from 'react-map-gl';
import React, { memo, useMemo } from 'react';
import { getLineStyles } from '@app/pages/Deployments/components/MapBox/MapBox.utils';

interface LinesLayerProps {
  processedEdges: EdgeGroup[];
  selectedLineId: string | number | null;
}

const LinesLayer: React.FC<LinesLayerProps> = ({ processedEdges, selectedLineId }) => {
  // ✅ Duplicates Edges Map
  const duplicatesMap = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const edgeGroup of processedEdges) {
      const edgeSet = new Set<number>();
      if (edgeGroup.id) {
        edgeSet.add(edgeGroup.id);
      }
      if (edgeSet.size > 1) {
        map.set(edgeGroup.id, edgeSet);
      }
    }
    return map;
  }, [processedEdges]);

  const combinedLineData = useMemo(() => {
    const features: any[] = [];

    for (const edge of processedEdges) {
      const edgeId = edge.id;

      const edgeSet = duplicatesMap.get(edge.id);

      const isDuplicateEdge = Boolean(edgeSet && edgeSet.size > 1 && edgeSet.has(edgeId));

      const isSelectedEdge = selectedLineId === edgeId;
      const { lineWidth, lineOpacity } = getLineStyles(isSelectedEdge);
      const lineColor = edge?.color || '#0281FB';

      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: edge.coordinates,
        },
        properties: {
          id: edgeId,
          edgeId,
          lineColor,
          lineWidth,
          lineOpacity,
          isDuplicateEdge,
        },
      });
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [processedEdges, selectedLineId, duplicatesMap]);

  return (
    <Source id="combined-lines" type="geojson" data={combinedLineData}>
      <Layer
        id="lines-layer"
        type="line"
        paint={{
          'line-color': ['get', 'lineColor'],
          'line-width': ['get', 'lineWidth'],
          'line-opacity': ['get', 'lineOpacity'],
        }}
        metadata={{
          'test-layer-type': 'lines',
          'test-feature-count': combinedLineData.features.length,
        }}
      />

      <Layer
        id="transmission-line-dots"
        type="line"
        filter={['==', ['get', 'lineType'], LineType.Transmission]}
        paint={{
          'line-color': 'white',
          'line-width': 4,
          'line-dasharray': [2, 3],
          'line-opacity': ['get', 'lineOpacity'],
        }}
        metadata={{
          'test-layer-type': 'transmission-dots',
        }}
      />
    </Source>
  );
};

export default memo(LinesLayer);
