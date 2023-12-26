import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function Track({ data }) {
  const svgRef = useRef();
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate min and max values for x and y coordinates
    const xMin = d3.min(data, (d) => d.x);
    const xMax = d3.max(data, (d) => d.x);
    const yMin = d3.min(data, (d) => d.y);
    const yMax = d3.max(data, (d) => d.y);

    const svg = d3.select(svgRef.current);
    const width = 400; // Set a fixed width for the SVG
    const height = 400; // Set a fixed height for the SVG
    const padding = 20; // Add some padding to keep the track within the viewBox

    // Calculate the scale factor based on the data range and SVG size
    const xScaleFactor = (width - padding) / (xMax - xMin);
    const yScaleFactor = (height - padding) / (yMax - yMin);
    const scaleFactor = Math.min(xScaleFactor, yScaleFactor);

    // Calculate the new width and height of the viewBox
    const viewBoxWidth = (xMax - xMin) * scaleFactor + padding;
    const viewBoxHeight = (yMax - yMin) * scaleFactor + padding;

    // Create scales for x and y axes using the scaleFactor
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, viewBoxWidth]);
    const yScale = d3.scaleLinear().domain([yMax, yMin]).range([0, viewBoxHeight]);

    // Create a line generator with curveCardinal interpolation
    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveCardinal);

    // Set the viewBox attribute to maintain the 1:1 aspect ratio
    svg.attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    // Append the path element for the track
    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 5)
      .attr('d', line);

    // Append circles for each data point to make them selectable
    const circles = svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 5)
      .attr('fill', (d) => (selectedPoint === d ? 'red' : 'blue'))
      .on('click', (event, d) => handlePointClick(d))
      .on('mouseover', (event, d) => handlePointHover(d))
      .on('mouseout', () => handlePointHover(null));

    // Append a path element for the highlighted segment (initially hidden)
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'yellow')
      .attr('stroke-width', 4)
      .attr('d', () => null) // Set the initial path data to null
      .style('visibility', 'hidden'); // Hide the highlighted segment initially

    function handlePointClick(point) {
      setSelectedPoint(point);
      // Do something with the selected point, like showing details or performing an action.
    }

    function handlePointHover(point) {
      setSelectedPoint(point);
      // Update the circle's radius when hovered
      circles
        .attr('r', (d) => (selectedPoint === d ? 20 : 5));

      // Show the highlighted segment when the mouse hovers over a point
      const highlightedPath = svg.selectAll('path:last-child');
      if (!point) {
        // Hide the highlighted segment if no point is hovered
        highlightedPath.style('visibility', 'hidden');
      } else {
        // Get the data points up to the selected point
        const segmentData = data.slice(0, data.indexOf(point) + 1);
        // Generate the path data for the highlighted segment
        const highlightedLine = d3.line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y))
          .curve(d3.curveCardinal);
        // Set the path data for the highlighted segment
        highlightedPath.attr('d', highlightedLine(segmentData));
        // Show the highlighted segment
        highlightedPath.style('visibility', 'visible');
      }
    }
  }, [data, selectedPoint]);

  return (
    <div>
      <svg ref={svgRef} width={400} height={400}></svg>
      {selectedPoint && (
        <div>
          <h2>Selected Point:</h2>
          <p>X: {selectedPoint.x}</p>
          <p>Y: {selectedPoint.y}</p>
        </div>
      )}
    </div>
  );
}

export default Track;
