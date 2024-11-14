import { useState } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
const MapBoxGL = import('mapbox-gl');

interface Pin {
  id: number;
  longitude: number;
  latitude: number;
  description: string;
}

const mockPins: Pin[] = [
  { id: 1, longitude: -122.4, latitude: 37.8, description: 'Pin 1: Golden Gate Bridge' },
  { id: 2, longitude: -122.42, latitude: 37.81, description: "Pin 2: Fisherman's Wharf" },
  { id: 3, longitude: -122.41, latitude: 37.79, description: 'Pin 3: Alcatraz Island' },
  { id: 4, longitude: -122.39, latitude: 37.79, description: 'Pin 4: Pier 39' },
  { id: 5, longitude: -122.43, latitude: 37.82, description: 'Pin 5: Coit Tower' },
  { id: 6, longitude: -122.38, latitude: 37.76, description: 'Pin 6: Mission District' },
  { id: 7, longitude: -122.44, latitude: 37.76, description: 'Pin 7: Castro District' },
  { id: 8, longitude: -122.36, latitude: 37.78, description: 'Pin 8: Chinatown' },
  { id: 9, longitude: -122.46, latitude: 37.77, description: 'Pin 9: Golden Gate Park' },
  { id: 10, longitude: -122.37, latitude: 37.73, description: 'Pin 10: Dolores Park' },
];

const MapBox: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  // GeoJSON line coordinates
  const lineCoordinates = mockPins.map(pin => [pin.longitude, pin.latitude]);

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_KEY}
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100vh' }}
      mapLib={MapBoxGL as any}
      mapStyle="mapbox://styles/mapbox/streets-v9">
      {mockPins.map(pin => (
        <Marker key={pin.id} longitude={pin.longitude} latitude={pin.latitude}>
          <div onClick={() => setSelectedPin(pin)} style={{ cursor: 'pointer', color: 'red', fontSize: '24px' }}>
            ⬤ {/* Circle icon */}
          </div>
        </Marker>
      ))}

      {/* Add line connecting pins */}
      <Source
        type="geojson"
        data={{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates,
          },
        }}>
        <Layer
          id="line-layer"
          type="line"
          paint={{
            'line-color': '#FF5733',
            'line-width': 4,
          }}
        />
      </Source>

      {selectedPin && (
        <Popup
          longitude={selectedPin.longitude}
          latitude={selectedPin.latitude}
          onClose={() => setSelectedPin(null)}
          closeOnClick={false}>
          <div>{selectedPin.description}</div>
        </Popup>
      )}
    </Map>
  );
};

export default MapBox;
