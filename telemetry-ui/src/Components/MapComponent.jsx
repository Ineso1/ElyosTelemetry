import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.YOUR_MAPBOX_ACCESS_TOKEN;

const MapComponent = () => {
  // Define longitude and latitude variables with specific values
  const longitude = -73.9857; // Example longitude value
  const latitude = 40.7488; // Example latitude value

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map-container', // Replace with the ID of your map container element
      style: 'mapbox://styles/mapbox/streets-v11', // Replace with your desired map style
      center: [longitude, latitude], // Use the defined longitude and latitude here
      zoom: 10, // Replace with the initial zoom level
    });

    // Clean up the map instance when the component unmounts
    return () => map.remove();
  }, []);

  return (
    <div id="map-container" style={{ width: '100%', height: '400px' }}>
      {/* The map will be rendered inside this div */}
    </div>
  );
};

export default MapComponent;
