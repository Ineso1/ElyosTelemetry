import React, { useRef, useEffect } from 'react';

function TrackPlotter({ trackData , carPosition }) {
  const canvasRef = useRef(null);
  const canvasWidth = 600; // Adjust the canvas width as needed
  const canvasHeight = 400; // Adjust the canvas height as needed
  const margin = 70; // Inner margin in pixels
  const trackColorStart = '#3bbaf621'; // Yellow color at the start of the track
  const trackColorEnd = '#FF0000'; // Red color at the end of the track
  const backgroundColor = '#111'; // Dark background color
  const axisColor = '#FFF'; // Axis color
  const gridLineColor = '#333'; // Grid line color
  const gridLineWidth = 0.3; // Grid line width
  const fontSize = '14px'; // Font size for labels
  const carColor = '#fff'; // Color of the car

  const legendItems = [
    { label: 'Track', color: trackColorStart },
    { label: 'Car', color: carColor },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size with inner margin
    canvas.width = canvasWidth + 2 * margin;
    canvas.height = canvasHeight + 2 * margin;

    // Clear the canvas and set background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Function to draw a point on the canvas
    const drawPoint = (x, y, color) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    };

     // Function to draw a smooth curve between points
    const drawSmoothCurve = () => {
      ctx.beginPath();

      // Start at the first point
      const start = trackData[0];
      const startX = (start.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
      const startY = (start.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);
      ctx.moveTo(startX + margin, startY + margin);

      // Loop through the track points and draw smooth curves
      for (let i = 0; i < trackData.length - 1; i++) {
        const current = trackData[i];
        const next = trackData[i + 1];
        const currentX = (current.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
        const currentY = (current.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);
        const nextX = (next.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
        const nextY = (next.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);

        const xc = (currentX + nextX) / 2;
        const yc = (currentY + nextY) / 2;
        ctx.quadraticCurveTo(currentX + margin, currentY + margin, xc + margin, yc + margin);
      }

      // Draw a line to the last point from the last control point of the last bezier curve
      const last = trackData[trackData.length - 1];
      const lastX = (last.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
      const lastY = (last.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);
      ctx.lineTo(lastX + margin, lastY + margin);

      ctx.strokeStyle = '#E7D94B'; // Green color for the curve
      ctx.lineWidth = 4; // Increased line width
      ctx.stroke();
    };

    // Function to draw axis lines and labels
    const drawAxis = (axis = false) => {
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2;

      if(axis){
      // X-axis
      ctx.beginPath();
      ctx.moveTo(margin, canvasHeight + margin);
      ctx.lineTo(canvasWidth + margin, canvasHeight + margin);
      ctx.stroke();

      // Y-axis
      ctx.beginPath();
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, canvasHeight + margin);
      ctx.stroke();
      }

      // X-axis label
      ctx.font = fontSize;
      ctx.fillStyle = axisColor;
      ctx.textAlign = 'center';
      ctx.fillText('Longitud', canvasWidth / 2 + margin, canvasHeight + 1.7 * margin - 10);

      // Y-axis label
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Latitud', -canvasHeight / 2 - margin, margin - 50);
      ctx.restore();

      // Draw values on X-axis
      ctx.textAlign = 'center';
      const xStep = canvasWidth / 10;
      const xRange = trackData[trackData.length - 1].x - trackData[0].x;
      for (let i = 0; i <= 10; i++) {
        const xValue = trackData[0].x + (xRange / 10) * i;
        const xPosition = margin + (i * xStep);
        ctx.fillText(xValue.toFixed(2), xPosition, canvasHeight + 1.7 * margin - 25);
      }

      // Draw values on Y-axis
      ctx.textAlign = 'end';
      const yStep = canvasHeight / 8;
      const yRange = trackData[trackData.length - 1].y - trackData[0].y;
      for (let i = 0; i <= 8; i++) {
        const yValue = trackData[0].y + (yRange / 8) * i;
        const yPosition = margin + canvasHeight - (i * yStep);
        ctx.fillText(yValue.toFixed(2), margin - 10, yPosition);
      }
    };

    // Function to draw grid lines
    const drawGrid = () => {
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = gridLineWidth;

      // Draw vertical grid lines
      const xStep = canvasWidth / 10; // Adjust the number of grid lines as needed
      for (let x = margin; x <= canvasWidth + margin; x += xStep) {
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, canvasHeight + margin);
        ctx.stroke();
      }

      // Draw horizontal grid lines
      const yStep = canvasHeight / 8; // Adjust the number of grid lines as needed
      for (let y = margin; y <= canvasHeight + margin; y += yStep) {
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(canvasWidth + margin, y);
        ctx.stroke();
      }
    };

    // Function to draw the legend
    const drawLegend = () => {
      const legendX = canvasWidth;
      const legendY = margin + 10;
      const legendItemHeight = 20;
      const legendPadding = 5;

      ctx.font = fontSize;
      ctx.fillStyle = axisColor;

      for (let i = 0; i < legendItems.length; i++) {
        const item = legendItems[i];
        const itemY = legendY + i * (legendItemHeight + legendPadding);

        ctx.beginPath();
        ctx.arc(legendX, itemY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = item.color;
        ctx.stroke();

        ctx.fillText(item.label, legendX + 15, itemY + 5);
      }
    };

    // Function to handle mouse move over the canvas (hover)
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if the mouse is over any track point
      for (const point of trackData) {
        const px = (point.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
        const py = (point.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);

        if (Math.abs(px - x + margin) <= 5 && Math.abs(py - y + margin) <= 5) {
          console.log('Hovering over point:', point);
          // Add your logic here for hover action on the point
          return;
        }
      }
    };

    // Function to handle click on the canvas
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if the click is on any track point
      for (const point of trackData) {
        const px = (point.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
        const py = (point.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);

        if (Math.abs(px - x + margin) <= 5 && Math.abs(py - y + margin) <= 5) {
          console.log('Clicked on point:', point);
          // Add your logic here for click action on the point
          return;
        }
      }
    };

    // Attach event listeners to canvas
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    // Draw the chart components
    drawAxis();
    drawGrid();
    // Draw the legend
    drawLegend();

    // Draw the track on the canvas with gradient and smooth curve
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, trackColorStart);
    gradient.addColorStop(1, trackColorEnd);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Start at the first point
    const start = trackData[0];
    const startX = (start.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
    const startY = (start.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);
    ctx.moveTo(startX, startY);
    drawPoint(startX + margin, startY + margin, trackColorStart); // Draw the start point

    // Loop through the track points and draw smooth curves
    for (let i = 0; i < trackData.length - 1; i++) {
      const current = trackData[i];
      const next = trackData[i + 1];
      const currentX = (current.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
      const currentY = (current.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);
      const nextX = (next.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
      const nextY = (next.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);

      drawSmoothCurve(currentX + margin, currentY + margin, nextX + margin, nextY + margin);
      drawPoint(nextX + margin, nextY + margin, trackColorStart); // Draw the next point
    }

    // Draw the car's position on the track
    if (carPosition) {
      const carX = margin + (carPosition.x - trackData[0].x) * canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
      const carY = margin + (carPosition.y - trackData[0].y) * canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);
      drawPoint(carX, carY, carColor);
    }

    ctx.stroke();

    // Remove event listeners when the component is unmounted
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [trackData]);

  return <canvas ref={canvasRef} />;
}

export default TrackPlotter;
