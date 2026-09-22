import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';
import EdgeInspector from '../EdgeInspector';
import { Pole } from '@app/store/apis/pole/types';

interface TestOverlayProps {
  mapRef: React.MutableRefObject<any>;
  handleSelectPole: (pole: Pole) => void;
}

const TestOverlay: React.FC<TestOverlayProps> = ({ mapRef, handleSelectPole }) => {
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const edges = useSelector((state: RootState) => state.edges.edgesList);
  const selectedFromPole = useSelector((state: RootState) => state.edges.selectedFromPole);
  const selectedToPole = useSelector((state: RootState) => state.edges.selectedToPole);
  const polesValidationErrors = useSelector((state: RootState) => state.poles.polesValidationErrors);

  // State to force re-render when map moves
  const [mapVersion, setMapVersion] = React.useState(0);

  // Check if debug mode is enabled for visible borders
  const debugMode =
    globalThis.location.search.includes('debug-overlay=true') || localStorage.getItem('mapbox-debug-mode') === 'true';

  const isTestEnvironment = React.useMemo(() => {
    if (
      !globalThis.location.search.includes('test-mode=true') &&
      !globalThis.location.search.includes('debug-overlay=true')
    ) {
      return false;
    }

    // Development/test environment checks
    return (
      globalThis.location.search.includes('test-mode=true') ||
      globalThis.location.search.includes('debug-overlay=true') ||
      (globalThis as any).__IS_TESTING__ ||
      localStorage.getItem('mapbox-test-mode') === 'true'
    );
  }, []);

  // Performance optimization: Use throttled map movement updates
  const throttledMapMove = React.useCallback(() => {
    setMapVersion(prev => prev + 1);
  }, []);

  // Listen for map movement to update positions (throttled for performance)
  React.useEffect(() => {
    if (!mapRef.current || !isTestEnvironment) return;

    const map = mapRef.current.getMap();
    let throttleTimer: NodeJS.Timeout;

    const handleMapMove = () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      throttleTimer = setTimeout(throttledMapMove, 100); // Throttle to 100ms
    };

    map.on('move', handleMapMove);
    map.on('zoom', handleMapMove);

    return () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      map.off('move', handleMapMove);
      map.off('zoom', handleMapMove);
    };
  }, [mapRef.current, isTestEnvironment, throttledMapMove]);

  // Performance optimization: Only render visible poles
  const visiblePoles = React.useMemo(() => {
    if (!mapRef.current || poles.length === 0) return [];

    try {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();
      if (!bounds) return poles;

      // Only render poles within viewport + buffer for performance
      return poles.filter(pole => {
        const buffer = 0.01; // Small buffer to include nearby poles
        return (
          pole.lat >= bounds.getSouth() - buffer &&
          pole.lat <= bounds.getNorth() + buffer &&
          pole.long >= bounds.getWest() - buffer &&
          pole.long <= bounds.getEast() + buffer
        );
      });
    } catch {
      return poles; // Fallback to all poles if bounds calculation fails
    }
  }, [poles, mapVersion, mapRef.current]);

  // Debug logging with performance info
  React.useEffect(() => {
    console.log('TestOverlay Debug:', {
      isTestEnvironment,
      hasMapRef: Boolean(mapRef.current),
      totalPoles: poles.length,
      visiblePoles: visiblePoles.length,
      totalEdges: edges.length,
      mapVersion,
      url: globalThis.location.href,
    });
  }, [isTestEnvironment, mapRef.current, poles.length, edges.length, visiblePoles.length, mapVersion]);

  // Debug edges specifically
  React.useEffect(() => {
    if (debugMode && edges.length > 0) {
      console.log(
        'Edges data:',
        edges.map(edge => ({
          id: edge.id,
          coordinates: edge.coordinates,
          coordinatesLength: edge.coordinates?.length ?? 0,
          fromPole: edge.from_pole_id,
          toPole: edge.to_pole_id,
        }))
      );
    }
  }, [edges, debugMode]);

  if (!isTestEnvironment) {
    return null;
  }

  // Early return if test mode not enabled
  if (!isTestEnvironment) {
    return (
      <div
        data-testid="test-mode-disabled"
        style={{ display: 'none' }}
        data-help="Add ?test-mode=true to URL or set localStorage.setItem('mapbox-test-mode', 'true')"
      />
    );
  }

  if (!mapRef.current) {
    return <div data-testid="map-not-ready" style={{ display: 'none' }} data-help="Map reference not available yet" />;
  }

  const getScreenCoordinates = (lat: number, lng: number) => {
    try {
      const map = mapRef.current.getMap();
      if (!map.isStyleLoaded()) {
        return { x: 0, y: 0, valid: false };
      }
      const point = map.project([lng, lat]);
      return { x: point.x, y: point.y, valid: true };
    } catch (error) {
      console.warn('Error calculating screen coordinates:', error);
      return { x: 0, y: 0, valid: false };
    }
  };

  return (
    <div
      data-testid="map-test-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}>
      {/* Render visible pole markers only */}
      {visiblePoles.map(pole => {
        const screenPos = getScreenCoordinates(pole.lat, pole.long);
        if (!screenPos.valid) return null;

        const isSelected = selectedFromPole === pole.id || selectedToPole === pole.id;
        const hasValidationError = polesValidationErrors?.pole_ids?.includes(pole.id) || false;

        const handlePoleInteraction = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Test overlay pole clicked:', pole.id);

          // Directly call handleSelectPole since we have the pole data
          handleSelectPole(pole);
        };

        return (
          <button
            key={`test-pole-${pole.id}`}
            data-testid={`pole-${pole.id}`}
            data-pole-id={pole.id}
            data-pole-status={pole.status}
            data-pole-lat={pole.lat}
            data-pole-lng={pole.long}
            data-pole-selected={isSelected}
            data-pole-has-error={hasValidationError}
            data-pole-suitable-for-install={pole.suitable_for_install}
            title={`Pole ${pole.id} (${pole.status})`}
            type="button"
            aria-label={`Select pole ${pole.id} with status ${pole.status}`}
            aria-pressed={isSelected}
            style={{
              position: 'absolute',
              left: screenPos.x - 15,
              top: screenPos.y - 15,
              width: 30,
              height: 30,
              backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
              borderRadius: '50%',
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: isSelected ? 1002 : 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: debugMode ? '10px' : '0',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 1px black',
              border: 'none',
              padding: 0,
            }}
            onClick={handlePoleInteraction}>
            {debugMode ? pole.id : ''}
          </button>
        );
      })}

      {/* Render visible edge markers using dedicated EdgeInspector */}
      <EdgeInspector mapRef={mapRef} debugMode={debugMode} />

      {/* Add summary data for testing */}
      <div
        data-testid="map-test-summary"
        data-total-poles={poles.length}
        data-visible-poles={visiblePoles.length}
        data-total-edges={edges.length}
        data-selected-from-pole={selectedFromPole}
        data-selected-to-pole={selectedToPole}
        data-poles-with-errors={polesValidationErrors?.pole_ids?.length ?? 0}
        style={{ display: 'none' }}
      />

      {/* Debug info panel - only show when debug mode is active */}
      {debugMode && (
        <div
          data-testid="debug-info-panel"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 2000,
            maxWidth: '300px',
          }}>
          <div>
            <strong>🔍 Mapbox Test Overlay Debug</strong>
          </div>
          <div>Total Poles: {poles.length}</div>
          <div>Visible Poles: {visiblePoles.length}</div>
          <div>Total Edges: {edges.length}</div>
          <div>Selected From: {selectedFromPole || 'None'}</div>
          <div>Selected To: {selectedToPole || 'None'}</div>
          <div>Validation Errors: {polesValidationErrors?.pole_ids?.length ?? 0}</div>
          <div>Map Ready: {mapRef.current?.getMap()?.isStyleLoaded() ? '✅' : '❌'}</div>
          <div>Map Version: {mapVersion}</div>
          <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
            🚀 Viewport culling active for performance
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>EdgeInspector handles edge visibility</div>
        </div>
      )}
    </div>
  );
};

export default TestOverlay;
