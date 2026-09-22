import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';

interface EdgeInspectorProps {
  mapRef: React.MutableRefObject<any>;
  debugMode: boolean;
}

const EdgeInspector: React.FC<EdgeInspectorProps> = ({ mapRef, debugMode }) => {
  const edges = useSelector((state: RootState) => state.edges.edgesList);
  const poles = useSelector((state: RootState) => state.poles.polesList);

  // Create a map of pole IDs to coordinates for edge positioning
  const poleCoordinates = React.useMemo(() => {
    const poleMap = new Map();
    for (const pole of poles) {
      poleMap.set(pole.id, { lat: pole.lat, lng: pole.long });
    }
    return poleMap;
  }, [poles]);

  const getScreenCoordinates = React.useCallback(
    (lat: number, lng: number) => {
      try {
        if (!mapRef.current) return { x: 0, y: 0, valid: false };
        const map = mapRef.current.getMap();
        if (!map.isStyleLoaded()) return { x: 0, y: 0, valid: false };

        const point = map.project([lng, lat]);
        return { x: point.x, y: point.y, valid: true };
      } catch (error) {
        console.warn('Error calculating screen coordinates:', error);
        return { x: 0, y: 0, valid: false };
      }
    },
    [mapRef]
  );

  const getEdgePosition = React.useCallback(
    (edge: any) => {
      // Strategy 1: Use coordinates if available
      if (edge.coordinates && edge.coordinates.length > 0) {
        const midIndex = Math.floor(edge.coordinates.length / 2);
        const midPoint = edge.coordinates[midIndex];
        if (midPoint && midPoint.length >= 2) {
          return getScreenCoordinates(midPoint[1], midPoint[0]);
        }
      }

      // Strategy 2: Use pole positions (from_pole_id and to_pole_id)
      const fromPole = poleCoordinates.get(edge.from_pole_id);
      const toPole = poleCoordinates.get(edge.to_pole_id);

      if (fromPole && toPole) {
        // Calculate midpoint between poles
        const midLat = (fromPole.lat + toPole.lat) / 2;
        const midLng = (fromPole.lng + toPole.lng) / 2;
        return getScreenCoordinates(midLat, midLng);
      }

      // Strategy 3: Use just from pole if available
      if (fromPole) {
        return getScreenCoordinates(fromPole.lat, fromPole.lng);
      }

      // Strategy 4: Use just to pole if available
      if (toPole) {
        return getScreenCoordinates(toPole.lat, toPole.lng);
      }

      return { x: 0, y: 0, valid: false };
    },
    [poleCoordinates, getScreenCoordinates]
  );

  // Filter edges to only those in viewport
  const visibleEdges = React.useMemo(() => {
    if (!mapRef.current || edges.length === 0) return [];

    try {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();
      if (!bounds) return edges;

      return edges.filter(edge => {
        // Check if edge has coordinates
        if (edge.coordinates && edge.coordinates.length > 0) {
          const buffer = 0.01;
          return edge.coordinates.some(coord => {
            const [lng, lat] = coord;
            return (
              lat >= bounds.getSouth() - buffer &&
              lat <= bounds.getNorth() + buffer &&
              lng >= bounds.getWest() - buffer &&
              lng <= bounds.getEast() + buffer
            );
          });
        }

        // Check if poles are in viewport
        const fromPole = poleCoordinates.get(edge.from_pole_id);
        const toPole = poleCoordinates.get(edge.to_pole_id);

        if (fromPole || toPole) {
          const buffer = 0.01;
          const checkPole = (pole: any) =>
            pole.lat >= bounds.getSouth() - buffer &&
            pole.lat <= bounds.getNorth() + buffer &&
            pole.lng >= bounds.getWest() - buffer &&
            pole.lng <= bounds.getEast() + buffer;

          return (fromPole && checkPole(fromPole)) || (toPole && checkPole(toPole));
        }

        return false;
      });
    } catch {
      return edges;
    }
  }, [edges, poleCoordinates, mapRef.current]);

  // Debug logging for edges
  React.useEffect(() => {
    if (debugMode) {
      console.log('EdgeInspector Debug:', {
        totalEdges: edges.length,
        visibleEdges: visibleEdges.length,
        polesAvailable: poleCoordinates.size,
        edgesSample: edges.slice(0, 3).map(edge => ({
          id: edge.id,
          hasCoordinates: Boolean(edge.coordinates && edge.coordinates.length > 0),
          coordinatesCount: edge.coordinates?.length ?? 0,
          fromPoleId: edge.from_pole_id,
          toPoleId: edge.to_pole_id,
          fromPoleExists: poleCoordinates.has(edge.from_pole_id),
          toPoleExists: poleCoordinates.has(edge.to_pole_id),
        })),
      });
    }
  }, [debugMode, edges.length, visibleEdges.length, poleCoordinates]);

  return (
    <>
      {visibleEdges.map(edge => {
        const position = getEdgePosition(edge);

        if (!position.valid) {
          if (debugMode) {
            console.warn(`Edge ${edge.id}: Could not determine position`, {
              hasCoordinates: Boolean(edge.coordinates && edge.coordinates.length > 0),
              fromPole: edge.from_pole_id,
              toPole: edge.to_pole_id,
              fromPoleExists: poleCoordinates.has(edge.from_pole_id),
              toPoleExists: poleCoordinates.has(edge.to_pole_id),
            });
          }
          return null;
        }

        const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Edge clicked via inspector:', {
            id: edge.id,
            fromPole: edge.from_pole_id,
            toPole: edge.to_pole_id,
            position,
            coordinates: edge.coordinates?.length ?? 0,
          });

          // Dispatch synthetic map click event
          if (mapRef.current) {
            const mapContainer = mapRef.current.getMap().getContainer();
            const mapClickEvent = new MouseEvent('click', {
              clientX: position.x,
              clientY: position.y,
              bubbles: true,
            });
            mapContainer.dispatchEvent(mapClickEvent);
          }
        };

        return (
          <button
            key={`edge-inspector-${edge.id}`}
            type="button"
            aria-label={`Edge ${edge.id}: from pole ${edge.from_pole_id} to pole ${edge.to_pole_id}`}
            data-testid={`edge-${edge.id}`}
            data-edge-id={edge.id}
            data-edge-from-pole={edge.from_pole_id}
            data-edge-to-pole={edge.to_pole_id}
            data-edge-color={edge.color ?? 'default'}
            data-edge-has-coordinates={Boolean(edge.coordinates && edge.coordinates.length > 0)}
            data-edge-coordinate-count={edge.coordinates?.length ?? 0}
            data-edge-deployment-id={edge.deployment_id}
            title={`Edge ${edge.id}: ${edge.from_pole_id} → ${edge.to_pole_id}`}
            style={{
              position: 'absolute',
              left: position.x - 15,
              top: position.y - 15,
              width: 30,
              height: 30,
              backgroundColor: debugMode ? 'rgba(0, 255, 0, 0.7)' : 'transparent',
              border: debugMode ? '3px solid lime' : '2px solid transparent',
              borderRadius: '4px',
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 1500, // Higher than poles
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: debugMode ? '11px' : '0',
              fontWeight: 'bold',
              color: 'black',
              textShadow: '1px 1px 1px white',
              boxShadow: debugMode ? '0 0 5px rgba(0, 255, 0, 0.8)' : 'none',
              padding: 0,
            }}
            onClick={handleInteraction}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleInteraction(e);
              }
            }}
            onMouseEnter={e => {
              if (debugMode) {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1.2)';
                target.style.zIndex = '2000';
              }
            }}
            onMouseLeave={e => {
              if (debugMode) {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1)';
                target.style.zIndex = '1500';
              }
            }}>
            {debugMode ? `E${edge.id}` : ''}
          </button>
        );
      })}
    </>
  );
};

export default EdgeInspector;
