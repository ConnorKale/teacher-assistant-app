import React from 'react';
import PropTypes from 'prop-types';

function BadCalculatorButton({ label, onClick, isSelected, className }) {
  return (
    <button 
      className={`BadCalculatorButton ${isSelected ? 'BadCalculatorButton-selected' : ''} ${className || ''}`} 
      onClick={() => onClick(label)}
    >
      {label}
    </button>
  );
}

BadCalculatorButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  className: PropTypes.string
};

BadCalculatorButton.defaultProps = {
  isSelected: false,
  className: ''
};

export default BadCalculatorButton; 