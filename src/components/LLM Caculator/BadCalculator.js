import React, { useState } from 'react';
import BadDisplay from './BadCalculatorDisplay';
import BadCalculatorButton from '../CalculatorButton';

function BadCalculator() {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [operand, setOperand] = useState(null);

  const handleButtonClick = (label) => {
    if (label >= '0' && label <= 'π') {
      handleNumber(label);
    } else if (label === '.') {
      handleDot();
    } else if (label === 'C') {
      handleClear();
    } else {
      handleOperator(label);
    }
  };

  const handleNumber = (number) => {
    var newNumber = '';
    if (number >= '0' && number <= '9') {
      newNumber = number;
    } /* else if (number === 'π') {
      newNumber = Math.PI;
    } else if (number === 'e') {
      newNumber = Math.E;
    }*/

    if (waitingForOperand) {
      setDisplayValue(number);
      setWaitingForOperand(false);
    }else {
      setDisplayValue(displayValue === '0' ? number : displayValue + number);
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

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setWaitingForOperand(false);
    setOperand(null);
  };

  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(displayValue);

    if (operand == null) {
      setOperand(inputValue);
    } else if (operator) {
      const currentOperand = operand || 0;
      const newValue = performOperation(currentOperand, inputValue, operator);
      setOperand(newValue);
      setDisplayValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
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

  return (
    <div className="badCalculator">
      <BadDisplay value={displayValue} />
      <div className="badCalculator-buttons">
        {['C', '/', '*', '-', '+', '^', 'log', '=', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((label) => (
          <BadCalculatorButton key={label} label={label} onClick={handleButtonClick} />
        ))}
      </div>
    </div>
  );
}

export default BadCalculator;