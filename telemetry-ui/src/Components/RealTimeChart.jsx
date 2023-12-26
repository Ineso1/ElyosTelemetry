import React, { useRef, useEffect, useState } from 'react';

const feedRate = 10; // Adjust the feed rate as needed (number of values per second)
const numDataPoints = 1000; // Number of data points shown on the chart
const numGridLines = 10; // Number of horizontal grid lines
const topMargin = 20; // Top margin in pixels
const bottomMargin = 70; // Bottom margin in pixels

function RealTimeChart({ chartLineColor = '#00FF00', canvasBackgroundColor = '#111' }) {
  const canvasRef = useRef(null);
  const [dataQueue, setDataQueue] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [initialCanvasWidth, setInitialCanvasWidth] = useState(0);
  const [initialCanvasHeight, setInitialCanvasHeight] = useState(0);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const chartContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%', // Make the chart container fill its parent's width
    minHeight: '100px',
    margin: '0 auto', // Center the chart horizontally
  };

  const canvasStyle = {
    width: '100%', // Set the canvas width to take up 100% of the container
    height: '100%',
    border: '1px solid #333', // Add a border to the canvas
  };

  const infoDivStyle = {
    position: 'absolute',
    top: cursorPosition.y + 10, // Add 10px offset from the cursor vertically
    left: cursorPosition.x + 10, // Add 10px offset from the cursor horizontally
    padding: '10px',
    backgroundColor: '#222',
    color: '#FFF',
    fontSize: '16px',
    textAlign: 'center',
  };

  // Use useEffect to handle initial canvas size setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Get the device pixel ratio to improve canvas quality
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set the initial canvas size based on the device pixel ratio
    const initialWidth = canvas.clientWidth * devicePixelRatio;
    const initialHeight = canvas.clientHeight * devicePixelRatio;
    canvas.width = initialWidth;
    canvas.height = initialHeight;

    // Store the initial canvas size to calculate scale factors later
    setInitialCanvasWidth(initialWidth);
    setInitialCanvasHeight(initialHeight);
  }, []);

  // Function to update the data queue with new values and elapsed time
  const updateDataQueue = () => {
    // Generate a new data point (dummy info)
    const newDataPoint = Math.random() * 100;

    // Update the data queue by adding the new data point at the end
    setDataQueue((prevData) => {
      const newQueue = [...prevData, newDataPoint];

      // Dequeue past values when the queue size exceeds numDataPoints
      if (newQueue.length > numDataPoints) {
        return newQueue.slice(newQueue.length - numDataPoints);
      }

      return newQueue;
    });

    // Update elapsed time
    setElapsedTime((prevTime) => prevTime + (1000 / feedRate));
  };

  // Use useEffect to call the updateDataQueue function based on the feed rate
  useEffect(() => {
    const interval = setInterval(updateDataQueue, 1000 / feedRate);

    // Clean up the interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Function to handle mouse move over the canvas
  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    const mouseX = (event.clientX - canvasRect.left) * scaleX;
    const mouseY = (event.clientY - canvasRect.top) * scaleY;

    // Find the data point closest to the mouse position
    const closestIndex = Math.round((mouseX / canvas.width) * (numDataPoints - 1));
    const closestDataPoint = dataQueue[closestIndex];

    // Update the selected point with the data value and timestamp
    setSelectedPoint(closestDataPoint ? { 
      value: closestDataPoint, 
      timestamp: (closestIndex * (elapsedTime / numDataPoints)) / 1000 // Correctly calculate the timestamp
    } : null);

    // Update the cursor position state
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  // Use useEffect to handle canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate the scale factors for both x and y directions
    const scaleX = canvas.width / initialCanvasWidth;
    const scaleY = canvas.height / initialCanvasHeight;

    // Clear the canvas and set background color
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the horizontal grid lines
    const gridSpacing = (canvas.height - topMargin - bottomMargin) / (numGridLines + 1);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5 * scaleY; // Adjust line width based on the y scale factor
    ctx.beginPath();
    for (let i = 1; i <= numGridLines; i++) {
      const y = topMargin + i * gridSpacing;
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw the data points on the chart
    ctx.strokeStyle = chartLineColor;
    ctx.lineWidth = 3; // Keep the line width constant
    ctx.beginPath();
    if (dataQueue.length > 0) {
      // Calculate the visible range of data
      const startIndex = Math.max(0, dataQueue.length - numDataPoints);
      const visibleData = dataQueue.slice(startIndex);

      const dataRange = Math.max(...visibleData) - Math.min(...visibleData);
      const dataScale = dataRange > 0 ? (canvas.height - topMargin - bottomMargin) / dataRange : 1;
      const dataOffset = Math.min(...visibleData);

      for (let i = 0; i < visibleData.length; i++) {
        const x = (i / (numDataPoints - 1)) * canvas.width;
        const y = canvas.height - bottomMargin - (visibleData[i] - dataOffset) * dataScale;

        // Adjust the coordinates with the scale factors
        const adjustedX = x * scaleX;
        const adjustedY = y * scaleY;

        if (i === 0) {
          ctx.moveTo(adjustedX, adjustedY);
        } else {
          ctx.lineTo(adjustedX, adjustedY);
        }
      }
    }
    ctx.stroke();

    // Draw the vertical axis labels (time since it started)
    ctx.fillStyle = '#FFF';
    ctx.font = `${24 * Math.min(scaleX, scaleY)}px Arial`; // Adjust font size based on the smaller scale factor
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= numDataPoints; i += numDataPoints / 5) {
      const x = (i / (numDataPoints - 1)) * canvas.width;
      const timeLabel = (i * elapsedTime) / numDataPoints / 1000; // Convert to seconds
      const adjustedX = x * scaleX;
      const adjustedY = canvas.height - bottomMargin + topMargin + 20;

      ctx.fillText(`${timeLabel.toFixed(1)}s`, adjustedX, adjustedY);
    }

    // Draw the horizontal axis label (data values)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const dataRange = Math.max(...dataQueue) - Math.min(...dataQueue);
    const dataInterval = dataRange / numGridLines;
    for (let i = 0; i <= numGridLines; i++) {
      const y = canvas.height - bottomMargin - i * gridSpacing; // Adjust for the bottom margin
      const dataValue = i * dataInterval + Math.min(...dataQueue);
      const adjustedY = y * scaleY + topMargin; // Correct the y position by adding the top margin

      ctx.fillText(dataValue.toFixed(1), 5, adjustedY);
    }

    // Draw the data points on the chart
    ctx.strokeStyle = chartLineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (dataQueue.length > 0) {
      // Calculate the visible range of data
      const startIndex = Math.max(0, dataQueue.length - numDataPoints);
      const visibleData = dataQueue.slice(startIndex);

      const dataRange = Math.max(...visibleData) - Math.min(...visibleData);
      const dataScale = dataRange > 0 ? (canvas.height - topMargin - bottomMargin) / dataRange : 1;
      const dataOffset = Math.min(...visibleData);

      for (let i = 0; i < visibleData.length; i++) {
        const x = (i / (numDataPoints - 1)) * canvas.width;
        const y = canvas.height - bottomMargin - (visibleData[i] - dataOffset) * dataScale;

        // Adjust the coordinates with the scale factors
        const adjustedX = x * scaleX;
        const adjustedY = y * scaleY;

        if (i === 0) {
          ctx.moveTo(adjustedX, adjustedY);
        } else {
          ctx.lineTo(adjustedX, adjustedY);
        }
      }
    }
    ctx.stroke();

    // Draw the selected point circle
    if (selectedPoint) {
      const dataRange = Math.max(...dataQueue) - Math.min(...dataQueue);
      const dataScale = dataRange > 0 ? (canvas.height - topMargin - bottomMargin) / dataRange : 1;
      const x = (selectedPoint.timestamp / (elapsedTime / numDataPoints)) * canvas.width; // Correctly calculate the x coordinate
      const y = canvas.height - bottomMargin - (selectedPoint.value - Math.min(...dataQueue)) * dataScale;
      const adjustedX = x * scaleX;
      const adjustedY = y * scaleY;
      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, 12 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
      ctx.fillStyle = 'red'; // Change the color to red
      ctx.fill();

      // Draw a line from the point to the x-axis
      ctx.beginPath();
      ctx.moveTo(adjustedX, adjustedY);
      ctx.lineTo(adjustedX, canvas.height - bottomMargin);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw a line from the point to the y-axis
      ctx.beginPath();
      ctx.moveTo(adjustedX, adjustedY);
      ctx.lineTo(0, adjustedY);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw a rectangle to display the value
      const infoBoxWidth = 100;
      const infoBoxHeight = 40;
      ctx.fillStyle = '#222';
      ctx.fillRect(adjustedX - infoBoxWidth / 2, adjustedY - infoBoxHeight - 5, infoBoxWidth, infoBoxHeight);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px Arial';
      ctx.fillText(selectedPoint.value.toFixed(1), adjustedX, adjustedY - infoBoxHeight / 2 - 5);
    }

  }, [dataQueue, elapsedTime, canvasBackgroundColor, chartLineColor, initialCanvasWidth, initialCanvasHeight, topMargin, bottomMargin, selectedPoint]);

  return (
    <div style={chartContainerStyle}>
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        onMouseMove={handleCanvasMouseMove}
      />
      {selectedPoint && (
        <div style={infoDivStyle}>
          <p>Value: {selectedPoint.value.toFixed(1)}</p>
          <p>Timestamp: {selectedPoint.timestamp.toFixed(1)}s</p>
        </div>
      )}
    </div>
  );
}

export default RealTimeChart;
