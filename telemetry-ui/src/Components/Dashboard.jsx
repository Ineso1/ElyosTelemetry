import React, { useState } from 'react';
import GyroComponent from '../ComponentsFeatures/GyroComponent';
// import MapComponent from './MapComponent';

function Dashboard() {

  return (
    <div className="h-full w-full bg-neutral p-6">
      {/* <MapComponent/> */}
      <GyroComponent/>
    </div>
  );
}

export default Dashboard;
