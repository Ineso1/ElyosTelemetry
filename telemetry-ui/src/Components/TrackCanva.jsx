import React, { useEffect, useRef, useState } from 'react';

const TrackCanva = ({ trackData }) => {
  const canvasRef = useRef(null); // Ref to store the canvas element
  const [hoveredPoint, setHoveredPoint] = useState(null); // State to keep track of the hovered point
  const [clickedPoint, setClickedPoint] = useState(null); // State to keep track of the clicked point

  // Declare trackPoints as a global variable to make it accessible inside and outside the useEffect hook
  let trackPoints = [];

  // Function to draw the track on the canvas
  const drawTrack = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(trackPoints[0].x, trackPoints[0].y);
    for (let i = 1; i < trackPoints.length; i++) {
      ctx.lineTo(trackPoints[i].x, trackPoints[i].y);
    }
    ctx.stroke();

    // Draw individual points on the track
    trackPoints.forEach((point) => {
      if (point !== clickedPoint) {
        drawPoint(ctx, point, hoveredPoint === point || clickedPoint === point);
      }
    });
  };

  // Function to draw an individual point on the canvas
  const drawPoint = (ctx, point, isHighlighted) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, isHighlighted ? 8 : 5, 0, 2 * Math.PI);
    ctx.fillStyle = isHighlighted ? 'red' : 'blue';
    ctx.fill();
    ctx.closePath();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Function to handle canvas resize
    const handleResize = () => {
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      ctx.canvas.width = canvasWidth;
      ctx.canvas.height = canvasHeight;

      // Calculate scaling factors for the x and y axes
      const xScale = canvasWidth / (trackData[trackData.length - 1].x - trackData[0].x);
      const yScale = canvasHeight / (trackData[trackData.length - 1].y - trackData[0].y);

      // Choose the minimum scaling factor to maintain 1:1 aspect ratio
      const scale = Math.min(xScale, yScale);

      // Calculate the translation to center the track within the canvas
      const offsetX = (canvasWidth - (trackData[trackData.length - 1].x - trackData[0].x) * scale) / 2;
      const offsetY = (canvasHeight - (trackData[trackData.length - 1].y - trackData[0].y) * scale) / 2;

      // Update the trackPoints with the new scaling and translation
      trackPoints = trackData.map(({ x, y }) => ({
        x: offsetX + (x - trackData[0].x) * scale,
        y: offsetY + (y - trackData[0].y) * scale,
      }));

      // Set the line width to make the track thicker (e.g., 3 pixels)
      ctx.lineWidth = 3;

      // Draw the track with updated coordinates
      drawTrack(ctx);
    };

    // Set up the initial canvas size and style
    handleResize();

    // Attach the event listeners for mouse hover and click
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const closestPoint = trackPoints.reduce((closest, point) => {
        const distance = Math.sqrt((point.x - mouseX) ** 2 + (point.y - mouseY) ** 2);
        if (!closest || distance < closest.distance) {
          return { ...point, distance };
        }
        return closest;
      }, null);
      setHoveredPoint(closestPoint);
    };

    const handleMouseClick = () => {
      if (hoveredPoint) {
        setClickedPoint(hoveredPoint);
        console.log(hoveredPoint);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);

    // Clean up the event listeners when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
    };
  }, [trackData, hoveredPoint, clickedPoint]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '400px', 
          cursor: 'pointer',
          zIndex: 2, // Lower zIndex value to place it behind the track
        }} // Show pointer cursor on hover
      />
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            top: hoveredPoint.y + 100,
            left: hoveredPoint.x,
            zIndex: 1, // Lower zIndex value to place it behind the track
            backgroundColor: 'white', // You can change the background color as per your design
            padding: '5px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p>Point Info</p>
          <p>X: {hoveredPoint.x}</p>
          <p>Y: {hoveredPoint.y}</p>
        </div>
      )}
    </div>
  );
};

export default TrackCanva;
