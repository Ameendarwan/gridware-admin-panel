import { MapRef } from 'react-map-gl';
import { RootState } from '@app/store';

export interface MapTestData {
  poles: Array<{
    id: number;
    lat: number;
    long: number;
    status: string;
    poleId: string;
    isSelected?: boolean;
    hasValidationError?: boolean;
  }>;
  edges: Array<{
    id: number;
    coordinates: [number, number][];
    color?: string;
    isSelected?: boolean;
  }>;
  mapCenter: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
}

export class MapTestUtils {
  private static instance: MapTestUtils;
  private mapRef: MapRef | null = null;
  private reduxState: RootState | null = null;

  static getInstance(): MapTestUtils {
    if (!MapTestUtils.instance) {
      MapTestUtils.instance = new MapTestUtils();
    }
    return MapTestUtils.instance;
  }

  setMapRef(mapRef: MapRef | null): void {
    this.mapRef = mapRef;
    // Expose to globalThis for testing
    (globalThis as any).__mapTestUtils = this;

    // Log helpful testing information in development only
    if (mapRef && process.env.NODE_ENV === 'development') {
      console.log('🗺️ Mapbox testing utilities loaded!');
      console.log('📝 Type globalThis.__mapTestUtils.getDebugInfo() for available commands');
      console.log('🚀 Quick start: globalThis.__mapTestUtils.enableDebugMode() then refresh');
    }
  }

  setReduxState(state: RootState): void {
    this.reduxState = state;
  }

  /**
   * Get all current map data for testing purposes
   */
  getMapTestData(): MapTestData | null {
    if (!this.mapRef || !this.reduxState) {
      return null;
    }

    const { poles, edges } = this.reduxState;
    const map = this.mapRef.getMap();
    const center = map.getCenter();
    const zoom = map.getZoom();

    return {
      poles: poles.polesList.map(pole => ({
        id: pole.id,
        lat: pole.lat,
        long: pole.long,
        status: pole.status,
        poleId: pole.pole_id,
        isSelected: edges.selectedFromPole === pole.id || edges.selectedToPole === pole.id,
        hasValidationError: poles.polesValidationErrors?.pole_ids?.includes(pole.id) || false,
      })),
      edges: edges.edgesList.map(edge => ({
        id: edge.id,
        coordinates: edge.coordinates || [],
        color: edge.color,
        isSelected: false, // You can implement this based on your selection logic
      })),
      mapCenter: {
        latitude: center.lat,
        longitude: center.lng,
        zoom,
      },
    };
  }

  /**
   * Query rendered features at a specific point (for testing clicks)
   */
  queryFeaturesAtPoint(x: number, y: number): any[] {
    if (!this.mapRef) return [];

    return this.mapRef.getMap().queryRenderedFeatures([x, y]);
  }

  /**
   * Get pole at specific coordinates
   */
  getPoleAtCoordinates(lat: number, lng: number, tolerance = 0.001): any {
    const data = this.getMapTestData();
    if (!data) return null;

    return data.poles.find(pole => Math.abs(pole.lat - lat) < tolerance && Math.abs(pole.long - lng) < tolerance);
  }

  /**
   * Simulate clicking on a pole by ID
   */
  simulatePoleClick(poleId: number): boolean {
    const data = this.getMapTestData();
    if (!data) return false;

    const pole = data.poles.find(p => p.id === poleId);
    if (!pole) return false;

    // Convert lat/lng to screen coordinates
    if (this.mapRef) {
      const point = this.mapRef.getMap().project([pole.long, pole.lat]);

      // Dispatch a synthetic click event
      const clickEvent = new MouseEvent('click', {
        clientX: point.x,
        clientY: point.y,
        bubbles: true,
      });

      this.mapRef.getMap().getContainer().dispatchEvent(clickEvent);
      return true;
    }

    return false;
  }

  /**
   * Get all visible poles in current viewport
   */
  getVisiblePoles(): any[] {
    if (!this.mapRef) return [];

    const map = this.mapRef.getMap();
    const bounds = map.getBounds();
    const data = this.getMapTestData();

    if (!data || !bounds) return [];

    return data.poles.filter(
      pole =>
        pole.lat >= bounds.getSouth() &&
        pole.lat <= bounds.getNorth() &&
        pole.long >= bounds.getWest() &&
        pole.long <= bounds.getEast()
    );
  }

  /**
   * Wait for map to be ready
   */
  waitForMapReady(): Promise<void> {
    return new Promise(resolve => {
      if (this.mapRef && this.mapRef.getMap().isStyleLoaded()) {
        resolve();
        return;
      }

      const checkReady = () => {
        if (this.mapRef && this.mapRef.getMap().isStyleLoaded()) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  }

  /**
   * Enable test mode programmatically
   */
  enableTestMode(): void {
    localStorage.setItem('mapbox-test-mode', 'true');
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Mapbox test mode enabled. Refresh the page to see test overlay.');
    }
  }

  /**
   * Enable debug mode to see overlay elements visually
   */
  enableDebugMode(): void {
    localStorage.setItem('mapbox-test-mode', 'true');
    localStorage.setItem('mapbox-debug-mode', 'true');
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Mapbox debug mode enabled. Refresh the page to see visual overlay elements.');
    }
  }

  /**
   * Disable test mode
   */
  disableTestMode(): void {
    localStorage.removeItem('mapbox-test-mode');
    localStorage.removeItem('mapbox-debug-mode');
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Mapbox test mode disabled. Refresh the page.');
    }
  }

  /**
   * Get debug information
   */
  getDebugInfo(): any {
    const data = this.getMapTestData();
    return {
      mapReady: this.mapRef?.getMap()?.isStyleLoaded() || false,
      testModeEnabled: localStorage.getItem('mapbox-test-mode') === 'true',
      debugModeEnabled: localStorage.getItem('mapbox-debug-mode') === 'true',
      totalPoles: data?.poles.length ?? 0,
      totalEdges: data?.edges.length ?? 0,
      visiblePoles: this.getVisiblePoles().length,
      mapCenter: data?.mapCenter,
      edgeDetails:
        data?.edges.map(edge => ({
          id: edge.id,
          hasCoordinates: Boolean(edge.coordinates && edge.coordinates.length > 0),
          coordinateCount: edge.coordinates?.length || 0,
          firstPoint: edge.coordinates?.[0],
          lastPoint: edge.coordinates?.at(-1),
        })) || [],
      helpCommands: [
        'globalThis.__mapTestUtils.enableTestMode() - Enable test overlay',
        'globalThis.__mapTestUtils.enableDebugMode() - Enable visual debug mode',
        'globalThis.__mapTestUtils.disableTestMode() - Disable test mode',
        'globalThis.__mapTestUtils.getDebugInfo() - Get this debug info',
        'globalThis.__mapTestUtils.getMapTestData() - Get all map data',
        'globalThis.__mapTestUtils.simulatePoleClick(poleId) - Click a pole',
        'globalThis.__mapTestUtils.getEdgeInfo() - Get edge debugging info',
        'globalThis.__mapTestUtils.getPerformanceInfo() - Get performance metrics',
      ],
    };
  }

  /**
   * Get detailed edge information for debugging
   */
  getEdgeInfo(): any {
    const data = this.getMapTestData();
    if (!data) return null;

    return {
      totalEdges: data.edges.length,
      edgesWithCoordinates: data.edges.filter(e => e.coordinates && e.coordinates.length > 0).length,
      edgeDetails: data.edges.map(edge => ({
        id: edge.id,
        hasCoordinates: Boolean(edge.coordinates && edge.coordinates.length > 0),
        coordinateCount: edge.coordinates?.length || 0,
        sampleCoordinates: edge.coordinates?.slice(0, 3), // First 3 points
        color: edge.color,
        isSelected: edge.isSelected,
      })),
      domElements: {
        overlayExists: Boolean(document.querySelector('[data-testid="map-test-overlay"]')),
        edgeElementsCount: document.querySelectorAll('[data-testid^="edge-"]').length,
        poleElementsCount: document.querySelectorAll('[data-testid^="pole-"]').length,
        edgeInspectorActive: document.querySelectorAll('[data-testid^="edge-"] [key*="edge-inspector"]').length > 0,
      },
      edgeInspection: {
        elementsInDOM: Array.from(document.querySelectorAll('[data-testid^="edge-"]')).map(el => ({
          id: (el as HTMLElement).dataset.edgeId,
          fromPole: (el as HTMLElement).dataset.edgeFromPole,
          toPole: (el as HTMLElement).dataset.edgeToPole,
          hasCoordinates: (el as HTMLElement).dataset.edgeHasCoordinates === 'true',
          coordinateCount: (el as HTMLElement).dataset.edgeCoordinateCount,
          visible: Boolean((el as HTMLElement).offsetParent), // Check if actually visible
        })),
      },
    };
  }

  /**
   * Get performance information
   */
  getPerformanceInfo(): any {
    const summary = document.querySelector('[data-testid="map-test-summary"]') as HTMLElement;
    const totalPoles = Number.parseInt(summary?.dataset.totalPoles ?? '0', 10);
    const visiblePoles = Number.parseInt(summary?.dataset.visiblePoles ?? '0', 10);
    const totalEdges = Number.parseInt(summary?.dataset.totalEdges ?? '0', 10);
    const visibleEdges = Number.parseInt(summary?.dataset.visibleEdges ?? '0', 10);

    return {
      totalElements: totalPoles + totalEdges,
      renderedElements: visiblePoles + visibleEdges,
      poles: {
        total: totalPoles,
        visible: visiblePoles,
        culled: totalPoles - visiblePoles,
        cullPercentage: totalPoles > 0 ? Math.round(((totalPoles - visiblePoles) / totalPoles) * 100) : 0,
      },
      edges: {
        total: totalEdges,
        visible: visibleEdges,
        culled: totalEdges - visibleEdges,
        cullPercentage: totalEdges > 0 ? Math.round(((totalEdges - visibleEdges) / totalEdges) * 100) : 0,
      },
      performance: {
        viewportCullingActive: true,
        throttledUpdates: true,
        memoizedCalculations: true,
      },
      recommendations: this.getPerformanceRecommendations(totalPoles + totalEdges, visiblePoles + visibleEdges),
    };
  }

  /**
   * Get performance recommendations based on element counts
   */
  private getPerformanceRecommendations(total: number, visible: number): string[] {
    const recommendations = [];

    if (total > 1000) {
      recommendations.push('⚠️ High element count (1000+). Consider data pagination or clustering.');
    }

    if (visible > 500) {
      recommendations.push('⚠️ Many visible elements (500+). Consider increasing zoom level.');
    }

    if (total > 100 && visible === total) {
      recommendations.push('💡 All elements visible. Viewport culling not active - zoom in to improve performance.');
    }

    if (visible < total * 0.1) {
      recommendations.push(
        '✅ Excellent culling ratio. Only ' + Math.round((visible / total) * 100) + '% of elements rendered.'
      );
    }

    return recommendations;
  }
}

// Export singleton instance
export const mapTestUtils = MapTestUtils.getInstance();

// Expose to window for Cypress/Playwright access
declare global {
  interface Window {
    __mapTestUtils: MapTestUtils;
  }
}
