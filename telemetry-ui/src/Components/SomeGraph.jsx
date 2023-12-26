import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function SomeGraph({ data }) {
  const graphRef = useRef();

  useEffect(() => {
    const svg = d3.select(graphRef.current);
    const width = svg.attr('width');
    const height = svg.attr('height');
    
    // Define margins and dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 30 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    // Create scales for x and y axes
    const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, graphWidth]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([graphHeight, 0]);
    
    // Create line generator
    const line = d3
      .line()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d));
    
    // Append a group element to hold the graph
    const graph = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Append the path element for the line graph
    graph
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add x-axis
    graph
      .append('g')
      .attr('transform', `translate(0, ${graphHeight})`)
      .call(d3.axisBottom(xScale));
    
    // Add y-axis
    graph.append('g').call(d3.axisLeft(yScale));
    
  }, [data]);

  return <svg ref={graphRef} width={400} height={300} />;
}

export default SomeGraph;
