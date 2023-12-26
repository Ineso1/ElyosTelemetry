import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiaW5lc29vb28iLCJhIjoiY2xrZDZyYWxhMHU3eTNyanM1eDdxdTljNCJ9.PNXVGkJ0qhXwnIymOQfgAA'; // Replace with your Mapbox access token

const MapComponent = ({ trackData }) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [trackData[0].y, trackData[0].x],
      zoom: 12,
    });
  
    map.on('load', () => {
      // Add the track data as a GeoJSON source
      map.addSource('track', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: trackData.map((point) => [point.y, point.x]),
          },
        },
      });
  
      // Add a layer to display the track
      map.addLayer({
        id: 'track',
        type: 'line',
        source: 'track',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#E72AD6',
          'line-width': 5,
        },
      });
    });
  
    // Clean up the map instance when the component unmounts
    return () => map.remove();
  }, [trackData]);
  

  return <div id="map-container" style={{ width: '100%', height: '400px' }} />;
};

export default MapComponent;
