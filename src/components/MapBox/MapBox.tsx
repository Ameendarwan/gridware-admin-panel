import Map from 'react-map-gl'

const MapBox = () => {
  console.log('POLA', import.meta.env.VITE_REACT_APP_MAPBOX_KEY)
  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_KEY}
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14,
      }}
      style={{ width: 600, height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    />
  )
}

export default MapBox
