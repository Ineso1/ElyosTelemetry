import React from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 20.750906,
  lng: -103.443250,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

function SatelliteMap({ trackData, selectedTrackPoint }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: '', // Replace with the actual API key
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
      options={options}
    >
      {/* Draw the track using Polyline */}
      {trackData && trackData.length > 0 && (
        <Polyline
          path={trackData}
          options={{
            strokeColor: '#00ff00',
            strokeOpacity: 1,
            strokeWeight: 4,
          }}
        />
      )}

      {/* Display a marker for each track point */}
      {trackData.map((trackPoint, index) => (
        <Marker
          key={index}
          position={{ lat: trackPoint.x, lng: trackPoint.y }}
          icon={selectedTrackPoint === trackPoint ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' : undefined}
        />
      ))}
    </GoogleMap>
  );
}

export default SatelliteMap;
