import React, { useState } from 'react';
import MapComponent from './MapComponent';
import TrackPlotter from './TrackPlotter';
import RealTimeChart from './RealTimeChart';
import GyroComponent from '../ComponentsFeatures/GyroComponent';

function Dashboard() {
  const trackData = [
    { x: 20.759515, y:-103.440551 },
    { x: 20.759289, y: -103.440817 },
    { x: 20.758508, y: -103.441168 },
    { x: 20.758211, y: -103.441269 },
    { x: 20.757415, y: -103.441492 },
    { x: 20.754791, y: -103.442204 },
    { x: 20.752951, y: -103.442688 },
    { x: 20.750906, y: -103.443250 },
    { x: 20.747474, y: -103.444156 },
    { x: 20.746897, y: -103.444401 },
    { x: 20.746520, y: -103.444711 },
    { x: 20.746149, y: -103.445163 },
    { x: 20.746045, y: -103.445709 },
    { x: 20.745998, y: -103.446409 },
    { x: 20.745888, y: -103.446713 },
    { x: 20.745500, y: -103.447227 },
    { x: 20.744961, y: -103.447432 },
    { x: 20.743241, y: -103.447923 },
    { x: 20.739316, y: -103.449150 }


    // Add more geographic coordinates here
  ];

  let carPosition = { x: 20.745989, y: -103.446813};

return (
  <div className="h-full w-full bg-neutral p-6">
    <h1>Map Example</h1>
    <MapComponent trackData={trackData} />
    <TrackPlotter trackData={trackData} carPosition={carPosition} />
    <RealTimeChart/>
  </div>
);
}

export default Dashboard;