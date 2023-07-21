import React, { useState } from 'react';
import MapComponent from './MapComponent';

function Dashboard() {

  return (
    <div className="h-full w-full bg-neutral p-6">
      <h1>Map Example</h1>
      <MapComponent/>
    </div>
  );
}

export default Dashboard;
