import React, { useState, useEffect, useRef } from 'react';
import BadDisplay from './BadCalculatorDisplay';
import BadCalculatorButton from './BadCalculatorButton';
import GraphCanvas from './GraphCanvas';
import * as math from 'mathjs';

// Complex number helper functions
const Complex = {
  add: (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
  subtract: (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
  multiply: (a, b) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  }),
  divide: (a, b) => {
    const denominator = b.re * b.re + b.im * b.im;
    return {
      re: (a.re * b.re + a.im * b.im) / denominator,
      im: (a.im * b.re - a.re * b.im) / denominator
    };
  },
  power: (a, n) => {
    if (n === 0) return { re: 1, im: 0 };
    if (n === 1) return a;
    
    let result = { re: 1, im: 0 };
    let base = { ...a };
    let exponent = n;
    
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = Complex.multiply(result, base);
      }
      base = Complex.multiply(base, base);
      exponent = Math.floor(exponent / 2);
    }
    
    return result;
  },
  toString: (c) => {
    if (c.im === 0) return c.re.toString();
    if (c.re === 0) return c.im === 1 ? 'i' : c.im === -1 ? '-i' : `${c.im}i`;
    return `${c.re}${c.im < 0 ? '-' : '+'}${Math.abs(c.im) === 1 ? 'i' : `${Math.abs(c.im)}i`}`;
  },
  fromString: (str) => {
    if (!str.includes('i')) return { re: parseFloat(str), im: 0 };
    
    str = str.replace(/\s/g, '');
    let re = 0;
    let im = 0;
    
    if (str === 'i') {
      re = 0;
      im = 1;
    } else if (str === '-i') {
      re = 0;
      im = -1;
    } else if (str.endsWith('i')) {
      if (str.includes('+')) {
        const parts = str.split('+');
        re = parseFloat(parts[0]);
        im = parts[1] === 'i' ? 1 : parseFloat(parts[1].replace('i', ''));
      } else if (str.includes('-')) {
        const firstMinus = str.indexOf('-');
        if (firstMinus === 0) {
          const secondMinus = str.indexOf('-', 1);
          if (secondMinus !== -1) {
            re = parseFloat(str.substring(0, secondMinus));
            im = parseFloat(str.substring(secondMinus).replace('i', ''));
          } else {
            const plusIndex = str.indexOf('+', 1);
            if (plusIndex !== -1) {
              re = parseFloat(str.substring(0, plusIndex));
              im = parseFloat(str.substring(plusIndex).replace('i', ''));
            } else {
              re = 0;
              im = parseFloat(str.replace('i', ''));
            }
          }
        } else {
          re = parseFloat(str.substring(0, firstMinus));
          im = parseFloat(str.substring(firstMinus).replace('i', ''));
        }
      } else {
        re = 0;
        im = parseFloat(str.replace('i', ''));
      }
    } else {
      re = parseFloat(str);
      im = 0;
    }
    
    return { re, im };
  },
  isComplex: (str) => str.includes('i')
};

function BadCalculator() {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [operand, setOperand] = useState(null);
  const [isComplexMode, setIsComplexMode] = useState(false);
  const [degreeMode, setDegreeMode] = useState(false); // Changed to false for radian default
  const [algebraicMode, setAlgebraicMode] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [graphFunction, setGraphFunction] = useState('sin(x)');
  const [graphXMin, setGraphXMin] = useState(-10);
  const [graphXMax, setGraphXMax] = useState(10);
  const [graphYMin, setGraphYMin] = useState(-10);
  const [graphYMax, setGraphYMax] = useState(10);
  const [integrationMode, setIntegrationMode] = useState(false);
  const [integrationLowerBound, setIntegrationLowerBound] = useState('0');
  const [integrationUpperBound, setIntegrationUpperBound] = useState('1');
  const [calculatorView, setCalculatorView] = useState('standard'); // 'standard', 'graph', 'integration'

  const handleButtonClick = (label) => {
    if (calculatorView === 'graph') {
      handleGraphButtonClick(label);
      return;
    }
    
    if (calculatorView === 'integration') {
      handleIntegrationButtonClick(label);
      return;
    }
    
    if ((label >= '0' && label <= '9') || label === 'π' || label === 'e' || label === 'φ' || label === 'τ' || label === 'i' || label === 'x') {
      handleNumber(label);
    } else if (label === '.') {
      handleDot();
    } else if (label === 'C') {
      handleClear();
    } else if (label === '=') {
      handleEquals();
    } else if (label === '±') {
      handleNegate();
    } else if (label === 'deg/rad') {
      setDegreeMode(!degreeMode);
    } else if (label === 'complex') {
      setIsComplexMode(!isComplexMode);
    } else if (label === 'graph') {
      setCalculatorView('graph');
      setGraphFunction(displayValue);
    } else if (label === 'integrate') {
      setCalculatorView('integration');
      setDisplayValue(displayValue);
    } else if (label === 'algebraic') {
      setAlgebraicMode(!algebraicMode);
    } else if (label === 'del') {
      handleDelete();
    } else if (label === '(' || label === ')') {
      handleParenthesis(label);
    } else {
      handleOperator(label);
    }
  };

  const handleGraphButtonClick = (label) => {
    if (label === 'C' || label === 'back') {
      setCalculatorView('standard');
    } else if (label === 'plot') {
      try {
        // Validate function by evaluating at x=0
        const scope = { x: 0 };
        math.evaluate(graphFunction, scope);
        setShowGraph(true);
      } catch (error) {
        setGraphFunction(`Error: ${error.message}`);
      }
    } else if (label === 'clear') {
      setGraphFunction('');
    } else if (label === '=') {
      // Use current graph bounds to plot
      try {
        // Validate function by evaluating at x=0
        const scope = { x: 0 };
        math.evaluate(graphFunction, scope);
        setShowGraph(true);
      } catch (error) {
        setGraphFunction(`Error: ${error.message}`);
      }
    }
  };

  const handleIntegrationButtonClick = (label) => {
    if (label === 'C' || label === 'back') {
      setCalculatorView('standard');
    } else if (label === 'calculate') {
      calculateIntegral();
    } else if (label === 'lower') {
      // Handle lower bound input
      setIntegrationMode('lower');
    } else if (label === 'upper') {
      // Handle upper bound input
      setIntegrationMode('upper');
    } else if (label === 'function') {
      // Handle function input
      setIntegrationMode('function');
    }
  };

  const calculateIntegral = () => {
    try {
      const lowerBound = parseFloat(integrationLowerBound);
      const upperBound = parseFloat(integrationUpperBound);
      
      if (isNaN(lowerBound) || isNaN(upperBound)) {
        throw new Error('Invalid bounds');
      }
      
      // Use Simpson's rule for numerical integration
      const func = (x) => {
        try {
          return math.evaluate(graphFunction, { x });
        } catch (error) {
          throw new Error('Invalid function');
        }
      };
      
      const n = 1000; // Number of intervals
      const h = (upperBound - lowerBound) / n;
      let sum = func(lowerBound) + func(upperBound);
      
      for (let i = 1; i < n; i++) {
        const x = lowerBound + i * h;
        sum += (i % 2 === 0 ? 2 : 4) * func(x);
      }
      
      const result = (h / 3) * sum;
      setDisplayValue(`∫(${graphFunction}) = ${result.toFixed(8)}`);
      setCalculatorView('standard');
    } catch (error) {
      setDisplayValue(`Integration error: ${error.message}`);
      setTimeout(() => setCalculatorView('standard'), 2000);
    }
  };

  const handleNumber = (number) => {
    let newNumber = number;
    
    if (number === 'π') {
      newNumber = 'π';
    } else if (number === 'e') {
      newNumber = 'e';
    } else if (number === 'φ') {
      newNumber = '(1+sqrt(5))/2'; // Golden Ratio in algebraic form
    } else if (number === 'τ') {
      newNumber = '2*π'; // Tau in algebraic form
    } else if (number === 'i') {
      newNumber = 'i';
    } else if (number === 'x') {
      newNumber = 'x';
    }

    if (waitingForOperand) {
      setDisplayValue(newNumber);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? newNumber : displayValue + number);
    }
  };

  const handleDot = () => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };
  
  const handleDelete = () => {
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.substring(0, displayValue.length - 1));
    } else {
      setDisplayValue('0');
    }
  };
  
  const handleParenthesis = (paren) => {
    if (waitingForOperand) {
      setDisplayValue(paren);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue + paren);
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setWaitingForOperand(false);
    setOperand(null);
  };

  const handleNegate = () => {
    if (algebraicMode) {
      if (displayValue.startsWith('-')) {
        setDisplayValue(displayValue.substring(1));
      } else {
        setDisplayValue('-' + displayValue);
      }
      return;
    }
    
    if (Complex.isComplex(displayValue)) {
      const complex = Complex.fromString(displayValue);
      complex.re = -complex.re;
      complex.im = -complex.im;
      setDisplayValue(Complex.toString(complex));
    } else {
      const value = parseFloat(displayValue);
      setDisplayValue((-value).toString());
    }
  };

  const handleUnaryOperation = (operation) => {
    if (algebraicMode) {
      // In algebraic mode, we wrap the current expression in the function
      let functionStr = '';
      switch (operation) {
        case 'sqrt':
          functionStr = `sqrt(${displayValue})`;
          break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'sec':
        case 'csc':
        case 'cot':
        case 'asin':
        case 'acos':
        case 'atan':
        case 'asec':
        case 'acsc':
        case 'acot':
          functionStr = `${operation}(${displayValue})`;
          break;
        default:
          functionStr = displayValue;
      }
      setDisplayValue(functionStr);
      return;
    }
    
    // Handle complex numbers
    if (Complex.isComplex(displayValue)) {
      const complex = Complex.fromString(displayValue);
      
      switch (operation) {
        case 'sqrt':
          // Implement complex square root
          const r = Math.sqrt(complex.re * complex.re + complex.im * complex.im);
          const theta = Math.atan2(complex.im, complex.re);
          const sqrtR = Math.sqrt(r);
          const sqrtTheta = theta / 2;
          const sqrtComplex = {
            re: sqrtR * Math.cos(sqrtTheta),
            im: sqrtR * Math.sin(sqrtTheta)
          };
          setDisplayValue(Complex.toString(sqrtComplex));
          break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'sec':
        case 'csc':
        case 'cot':
        case 'asin':
        case 'acos':
        case 'atan':
        case 'asec':
        case 'acsc':
        case 'acot':
          // Complex trig functions are more complicated
          // This is a simplified implementation
          setDisplayValue({ re: NaN, im: NaN });
          break;
        default:
          setDisplayValue({ re: NaN, im: NaN });
      }
    } else {
      // Handle real numbers
      let result;
      const inputValue = parseFloat(displayValue);
      let angle = inputValue;
      
      // Convert degrees to radians if needed
      if (degreeMode && ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].includes(operation)) {
        angle = inputValue * Math.PI / 180;
      }
      
      switch (operation) {
        case 'sqrt':
          result = Math.sqrt(inputValue);
          break;
        case 'sin':
          result = Math.sin(angle);
          break;
        case 'cos':
          result = Math.cos(angle);
          break;
        case 'tan':
          result = Math.tan(angle);
          break;
        case 'sec':
          result = 1 / Math.cos(angle);
          break;
        case 'csc':
          result = 1 / Math.sin(angle);
          break;
        case 'cot':
          result = 1 / Math.tan(angle);
          break;
        case 'asin':
          result = Math.asin(inputValue);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'acos':
          result = Math.acos(inputValue);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'atan':
          result = Math.atan(inputValue);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'asec':
          result = Math.acos(1 / inputValue);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'acsc':
          result = Math.asin(1 / inputValue);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'acot':
          result = Math.atan(1 / inputValue);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        default:
          result = inputValue;
      }
      
      setDisplayValue(String(result));
    }
    
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    if (algebraicMode) {
      try {
        // For constants, replace them with their values
        let expression = displayValue
          .replace(/π/g, 'pi')
          .replace(/τ/g, '2*pi');
          
        const result = math.evaluate(expression);
        setDisplayValue(result.toString());
        setWaitingForOperand(true);
      } catch (error) {
        setDisplayValue(`Error: ${error.message}`);
        setTimeout(() => setDisplayValue('0'), 2000);
      }
      return;
    }
    
    if (operator && operand !== null) {
      let inputValue;
      
      if (Complex.isComplex(displayValue) || (typeof operand === 'object' && operand.hasOwnProperty('re'))) {
        // At least one operand is complex
        const inputComplex = Complex.isComplex(displayValue) 
          ? Complex.fromString(displayValue) 
          : { re: parseFloat(displayValue), im: 0 };
          
        const operandComplex = typeof operand === 'object' && operand.hasOwnProperty('re')
          ? operand
          : { re: operand, im: 0 };
        
        const result = performComplexOperation(operandComplex, inputComplex, operator);
        setDisplayValue(Complex.toString(result));
        setOperand(null);
      } else {
        // Both operands are real
        inputValue = parseFloat(displayValue);
        const currentOperand = operand || 0;
        const newValue = performOperation(currentOperand, inputValue, operator);
        
        setDisplayValue(String(newValue));
        setOperand(null);
      }
      
      setWaitingForOperand(true);
      setOperator(null);
    }
  };

  const handleOperator = (nextOperator) => {
    if (algebraicMode && !['+', '-', '*', '/', '^'].includes(nextOperator)) {
      // Handle special operators in algebraic mode
      if (['sqrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 
           'asin', 'acos', 'atan', 'asec', 'acsc', 'acot'].includes(nextOperator)) {
        handleUnaryOperation(nextOperator);
        return;
      }
    }
    
    if (algebraicMode) {
      // In algebraic mode, just append the operator to the display
      setDisplayValue(displayValue + nextOperator);
      return;
    }
    
    // If clicking the same operator, deselect it
    if (nextOperator === operator && waitingForOperand) {
      setOperator(null);
      return;
    }
    
    // Check for unary operations
    if (['sqrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 
         'asin', 'acos', 'atan', 'asec', 'acsc', 'acot'].includes(nextOperator)) {
      handleUnaryOperation(nextOperator);
      return;
    }
    
    let newOperand;
    
    if (Complex.isComplex(displayValue)) {
      newOperand = Complex.fromString(displayValue);
    } else {
      newOperand = parseFloat(displayValue);
    }

    if (operand == null) {
      setOperand(newOperand);
    } else if (operator) {
      // Calculate with existing operator before setting new one
      let result;
      
      if (typeof operand === 'object' && operand.hasOwnProperty('re') || Complex.isComplex(displayValue)) {
        // At least one operand is complex
        const operandComplex = typeof operand === 'object' && operand.hasOwnProperty('re')
          ? operand
          : { re: operand, im: 0 };
          
        const inputComplex = Complex.isComplex(displayValue)
          ? Complex.fromString(displayValue)
          : { re: parseFloat(displayValue), im: 0 };
          
        result = performComplexOperation(operandComplex, inputComplex, operator);
        setDisplayValue(Complex.toString(result));
      } else {
        // Both operands are real
        const inputValue = parseFloat(displayValue);
        result = performOperation(operand, inputValue, operator);
        setDisplayValue(String(result));
      }
      
      setOperand(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const performComplexOperation = (left, right, operator) => {
    switch (operator) {
      case '+':
        return Complex.add(left, right);
      case '-':
        return Complex.subtract(left, right);
      case '*':
        return Complex.multiply(left, right);
      case '/':
        return Complex.divide(left, right);
      case '^':
        // Only support integer powers for complex numbers
        if (right.im === 0 && Number.isInteger(right.re)) {
          return Complex.power(left, right.re);
        }
        return { re: NaN, im: NaN };
      default:
        return right;
    }
  };

  const performOperation = (left, right, operator) => {
    switch (operator) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '^':
        return Math.pow(left, right);
      case 'log':
        return Math.log(left) / Math.log(right);
      default:
        return right;
    }
  };

  // Define groups of buttons for better organization
  const basicOperators = ['+', '-', '*', '/'];
  const advancedOperators = ['^', 'log', '(', ')', 'del'];
  const trigFunctions = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'];
  const invTrigFunctions = ['asin', 'acos', 'atan', 'asec', 'acsc', 'acot'];
  const specialNumbers = ['π', 'e', 'φ', 'τ', 'i', 'x'];
  const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'];
  const controlButtons = ['C', '±', 'deg/rad', 'complex', 'algebraic', '='];
  const extraFeatures = ['sqrt', 'graph', 'integrate'];
  
  // Algebraic input and graphing related buttons
  const graphButtons = ['plot', 'clear', 'back', 'C'];
  const integrationButtons = ['lower', 'upper', 'function', 'calculate', 'back', 'C'];

  return (
    <div className="badCalculator">
      <BadDisplay value={displayValue} />
      <div className="mode-indicator">
        {degreeMode ? 'DEG' : 'RAD'} | 
        {isComplexMode ? 'COMPLEX' : 'REAL'} | 
        {algebraicMode ? 'ALGEBRAIC' : 'RPN'}
      </div>
      
      {calculatorView === 'standard' && (
        <div className="badCalculator-buttons-advanced">
          {/* Control buttons */}
          <div className="button-group">
            {controlButtons.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                isSelected={
                  (label === 'deg/rad' && !degreeMode) || 
                  (label === 'complex' && isComplexMode) ||
                  (label === 'algebraic' && algebraicMode)
                }
                className="control-button"
              />
            ))}
          </div>
          
          {/* Basic operators */}
          <div className="button-group">
            {basicOperators.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                isSelected={label === operator}
                className="operator-button"
              />
            ))}
          </div>
          
          {/* Advanced operators */}
          <div className="button-group">
            {advancedOperators.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                isSelected={label === operator}
                className="advanced-operator-button"
              />
            ))}
          </div>
          
          {/* Extra features */}
          <div className="button-group">
            {extraFeatures.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                className="feature-button"
              />
            ))}
          </div>
          
          {/* Trig functions */}
          <div className="button-group">
            {trigFunctions.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                className="function-button"
              />
            ))}
          </div>
          
          {/* Inverse trig functions */}
          <div className="button-group">
            {invTrigFunctions.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                className="function-button"
              />
            ))}
          </div>
          
          {/* Special numbers */}
          <div className="button-group">
            {specialNumbers.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                className="special-number-button"
              />
            ))}
          </div>
          
          {/* Digits */}
          <div className="button-group digits">
            {digits.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                className="digit-button"
              />
            ))}
          </div>
        </div>
      )}
      
      {calculatorView === 'graph' && (
        <div className="graph-container">
          <div className="graph-controls">
            <input
              type="text"
              value={graphFunction}
              onChange={(e) => setGraphFunction(e.target.value)}
              placeholder="Enter function of x"
              className="graph-function-input"
            />
            <div className="graph-range-controls">
              <div>
                <label>X Min:</label>
                <input
                  type="number"
                  value={graphXMin}
                  onChange={(e) => setGraphXMin(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label>X Max:</label>
                <input
                  type="number"
                  value={graphXMax}
                  onChange={(e) => setGraphXMax(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label>Y Min:</label>
                <input
                  type="number"
                  value={graphYMin}
                  onChange={(e) => setGraphYMin(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label>Y Max:</label>
                <input
                  type="number"
                  value={graphYMax}
                  onChange={(e) => setGraphYMax(parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            <div className="graph-buttons">
              {graphButtons.map((label) => (
                <BadCalculatorButton 
                  key={label} 
                  label={label} 
                  onClick={handleButtonClick} 
                  className="graph-button"
                />
              ))}
            </div>
          </div>
          
          {showGraph && (
            <GraphCanvas 
              func={graphFunction}
              xMin={graphXMin}
              xMax={graphXMax}
              yMin={graphYMin}
              yMax={graphYMax}
              degreeMode={degreeMode}
            />
          )}
        </div>
      )}
      
      {calculatorView === 'integration' && (
        <div className="integration-container">
          <div className="integration-inputs">
            <div>
              <label>Function:</label>
              <input
                type="text"
                value={graphFunction}
                onChange={(e) => setGraphFunction(e.target.value)}
                className={integrationMode === 'function' ? 'active' : ''}
              />
            </div>
            <div>
              <label>Lower Bound:</label>
              <input
                type="text"
                value={integrationLowerBound}
                onChange={(e) => setIntegrationLowerBound(e.target.value)}
                className={integrationMode === 'lower' ? 'active' : ''}
              />
            </div>
            <div>
              <label>Upper Bound:</label>
              <input
                type="text"
                value={integrationUpperBound}
                onChange={(e) => setIntegrationUpperBound(e.target.value)}
                className={integrationMode === 'upper' ? 'active' : ''}
              />
            </div>
          </div>
          
          <div className="integration-display">
            ∫<sub>{integrationLowerBound}</sub><sup>{integrationUpperBound}</sup> {graphFunction} dx
          </div>
          
          <div className="integration-buttons">
            {integrationButtons.map((label) => (
              <BadCalculatorButton 
                key={label} 
                label={label} 
                onClick={handleButtonClick} 
                isSelected={
                  (label === 'lower' && integrationMode === 'lower') ||
                  (label === 'upper' && integrationMode === 'upper') ||
                  (label === 'function' && integrationMode === 'function')
                }
                className="integration-button"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BadCalculator;