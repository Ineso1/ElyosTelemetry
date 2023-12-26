import React, { useState } from 'react';
import SomeGraph from './SomeGraph';

function Graphs() {
    const [selectedGraph, setSelectedGraph] = useState('graph1');
    const [graphData, setGraphData] = useState([0, 10, 5, 8, 12, 6, 4, 9, 0, 10, 5, 8, 12, 6, 4, 9, 0, 10, 5, 8, 12, 6, 4, 9]);
  
    const handleGraphSelection = (graphId) => {
      setSelectedGraph(graphId);
    };
  return (
    <div>
        <div className="flex flex-col mb-6">
            <button
                className={`p-2 rounded ${
                selectedGraph === 'graph1' ? 'bg-primary text-base-100' : 'bg-neutral text-base-100'
                }`}
                onClick={() => handleGraphSelection('graph1')}
            >
                Graph 1
            </button>
            <SomeGraph data={graphData} />

            <button
                className={`p-2 rounded ${
                selectedGraph === 'graph2' ? 'bg-primary text-base-100' : 'bg-neutral text-base-100'
                }`}
                onClick={() => handleGraphSelection('graph2')}
            >
                Graph 2
            </button>
            <SomeGraph data={graphData} />

            <button
                className={`p-2 rounded ${
                selectedGraph === 'graph3' ? 'bg-primary text-base-100' : 'bg-neutral text-base-100'
                }`}
                onClick={() => handleGraphSelection('graph3')}
            >
                Graph 3
            </button>
            <SomeGraph data={graphData} />
        </div>
    </div>
  )
}

export default Graphs
