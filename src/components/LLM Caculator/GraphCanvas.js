import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as math from 'mathjs';

function GraphCanvas({ func, xMin, xMax, yMin, yMax, degreeMode }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Helper function to convert from graph coordinates to canvas coordinates
    const mapX = (x) => width * (x - xMin) / (xMax - xMin);
    const mapY = (y) => height * (1 - (y - yMin) / (yMax - yMin));
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const y0 = mapY(0);
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0);
    }
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const x0 = mapX(0);
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, height);
    }
    
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    // X grid lines
    const xStep = calculateStep(xMax - xMin);
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const canvasX = mapX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#666';
      ctx.fillText(x.toFixed(1), canvasX + 2, mapY(0) + 12);
    }
    
    // Y grid lines
    const yStep = calculateStep(yMax - yMin);
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const canvasY = mapY(y);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#666';
      ctx.fillText(y.toFixed(1), mapX(0) + 2, canvasY - 2);
    }
    
    // Try to parse and plot the function
    try {
      // Replace π with pi for mathjs
      const mathFunc = func.replace(/π/g, 'pi').replace(/τ/g, '2*pi');
      
      // Set up to plot the function
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let isFirstPoint = true;
      const points = 1000; // Number of points to plot
      
      for (let i = 0; i <= points; i++) {
        const x = xMin + (i / points) * (xMax - xMin);
        
        try {
          // Evaluate the function at x
          const scope = { x };
          let y = math.evaluate(mathFunc, scope);
          
          // Handle special cases
          if (!isFinite(y)) continue;
          if (y < yMin || y > yMax) continue;
          
          const canvasX = mapX(x);
          const canvasY = mapY(y);
          
          if (isFirstPoint) {
            ctx.moveTo(canvasX, canvasY);
            isFirstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        } catch (error) {
          // Skip points where the function can't be evaluated
          continue;
        }
      }
      
      ctx.stroke();
    } catch (error) {
      // Draw error message
      ctx.fillStyle = 'red';
      ctx.fillText(`Error: ${error.message}`, 10, 20);
    }
    
  }, [func, xMin, xMax, yMin, yMax, degreeMode]);
  
  // Helper function to calculate a nice step size for grid lines
  const calculateStep = (range) => {
    const rawStep = range / 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    
    if (normalized < 1.5) return magnitude;
    if (normalized < 3) return 2 * magnitude;
    if (normalized < 7) return 5 * magnitude;
    return 10 * magnitude;
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      width={600}
      height={400}
      className="graph-canvas"
    />
  );
}

GraphCanvas.propTypes = {
  func: PropTypes.string.isRequired,
  xMin: PropTypes.number,
  xMax: PropTypes.number,
  yMin: PropTypes.number,
  yMax: PropTypes.number,
  degreeMode: PropTypes.bool
};

GraphCanvas.defaultProps = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
  degreeMode: false
};

export default GraphCanvas; 